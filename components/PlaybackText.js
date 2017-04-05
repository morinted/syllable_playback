import { Component } from 'react'
import syllable from 'syllable'

type Props =
  { text: string
  }

type State =
  { paragraphs: Array<Array<string>>
  , paragraphIndex: number
  , wordIndex: number
  , speed: number
  , play: boolean
  , timeoutID?: number
  }

let speedOptions = []
let index = 0
for (let i = 30; i <= 250; i += 5) {
  speedOptions[index] = i
  index += 1
}

export default class PlaybackText extends Component {
  props: Props
  state: State
  constructor() {
    super()
    this.state =
      { wordIndex: 0
      , paragraphs: [[]]
      , paragraphIndex: 0
      , speed: 225
      , play: false
      , timeoutID: null
      }
  }

  componentWillMount() {
    this.processText(this.props.text)
  }

  componentWillReceiveProps(props) {
    if (props.text !== this.props.text) {
      this.processText(props.text)
    }
  }

  processText = (text = '') => {
    let paragraphs =
      text
        .split('\n') // Separate by new lines
        .filter(text => text) // Get rid of empty new lines
        .map(paragraphBlock => paragraphBlock.split(' ')) // Break into words
    if (!paragraphs.length || paragraphs.some(paragraph => !paragraph.length)) {
      // Unexpected input…abandon.
      paragraphs = [[]]
    }
    if (this.state.play) {
      this.togglePlay()
    }
    this.setState(
      { paragraphs
      , paragraphIndex: 0
      , wordIndex: 0
      }
    )
  }

  stateTimeout(callback, time) {
    const timeoutID =
      setTimeout(callback, time)
    this.setState({ timeoutID })
  }

  togglePlay = () => {
    const { play, timeoutID, paragraphs } = this.state
    if (this.state.play) {
      if (this.state.timeoutID) {
        clearTimeout(this.state.timeoutID)
      }
      this.setState({ play: false, timeoutID: null })
    } else {
      this.setState({ play: true })
      const processWord = (paragraphIndex, wordIndex) => {
        if (paragraphIndex >= paragraphs.length) {
          this.togglePlay()
        } else if (wordIndex >= paragraphs[paragraphIndex].length) {
          // Paragraph break
          this.setState(
            { paragraphIndex: paragraphIndex + 1
            , wordIndex: 0
            }
          )
          const paragraphBreak =
            paragraphIndex + 1 < paragraphs.length
              ? 2000
              : 0
          this.stateTimeout(() => processWord(paragraphIndex + 1, 0), paragraphBreak)
        } else {
          this.setState(
            { paragraphIndex
            , wordIndex: wordIndex + 1
            }
          )
          const { speed } = this.state
          // Syllable seems to handle all-caps words as words…let's handle them as acronyms.
          const word = paragraphs[paragraphIndex][wordIndex]

          const syllables = /^([A-Z]|[\u0080-\u024F])+$/.test(word) && word === word.toUpperCase()
            ? word.length
            : syllable(word) || 1
          const waitTime =
            syllables // Get syllables in word
            / 1.4 // Average 1.4 syllables per word → now we have number of words
            * 60 / speed // 60 seconds per minute, over WPM
            * 1000 // Convert to milliseconds
          this.stateTimeout(() => processWord(paragraphIndex, wordIndex + 1), waitTime)
        }
      }
      if (this.state.paragraphIndex >= paragraphs.length) {
        processWord(0, 0)
      } else {
        processWord(this.state.paragraphIndex, this.state.wordIndex)
      }
    }
  }

  changeProgress = (paragraphIndex, wordIndex) => {
    if (this.state.play) {
      this.togglePlay()
    }
    this.setState({ paragraphIndex, wordIndex })
  }

  render() {
    const { wordIndex, paragraphIndex, paragraphs, speed, play } = this.state
    const readParagraphs = paragraphs.slice(0, paragraphIndex)
    const inProgressParagraph = paragraphs[paragraphIndex] || []
    const unreadParagraphs = paragraphs.slice(paragraphIndex + 1)

    const currentParagraph =
      { read: inProgressParagraph.slice(0, wordIndex)
      , unread: inProgressParagraph.slice(wordIndex)
      , current: inProgressParagraph[wordIndex]
      }
    return (
      <div>
        <style jsx>{`
          .read {
            background-color: #ddd;
          }
          p {
            cursor: pointer;
          }
        `}</style>
        <h3>Playback</h3>
        <h4>Speed (WPM where word is 1.4 syllables)</h4>
        <select value={this.state.speed} onChange={e => this.setState({ speed: e.target.value })}>
          { speedOptions.map(speed =>
              <option value={speed} key={speed}>{speed} WPM</option>
            )
          }
        </select>
        <button
          onClick={this.togglePlay}
        >
          { this.state.play ? 'Pause' : 'Play' }
        </button>
        <button
          onClick={() => {
            if (this.state.play) {
              this.togglePlay()
            }
            this.setState({ paragraphIndex: 0, wordIndex: 0 })
          }}
        >
          Reset
        </button>
        <h2>Text</h2>
        { readParagraphs.map((words, index) =>
            <p className='read' key={`read_${index}`} onClick={() => this.changeProgress(index, 0)}>
              { words.join(' ') }
            </p>
          )
        }
        <p className='in-progress' onClick={() => this.changeProgress(paragraphIndex, 0)}>
          <span className='read'>
            { currentParagraph.read.join(' ') }
          </span>
          <span className='unread'>
            { ' ' + currentParagraph.unread.join(' ') }
          </span>
        </p>
        { unreadParagraphs.map((words, index) =>
            <p
              className='unread'
              key={`unread_${index + paragraphIndex + 1}`}
              onClick={() => this.changeProgress(index + paragraphIndex + 1, 0)}
            >
              { words.join(' ') }
            </p>
          )
        }
      </div>
    )
  }
}
