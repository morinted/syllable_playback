import { Component } from 'react'

type Props =
  { onSubmit: (words: string) => void
  }

type State =
  { words: string
  }

export default class WordsForm extends Component {
  props: Props
  state: State
  constructor() {
    super()
    this.state =
      { words: ''
      }
  }

  render() {
    return (
      <form
        name="words"
        onSubmit={
          e => {
            e.preventDefault()
            this.props.onSubmit(this.state.words)
          }
        }
      >
        <style jsx>{`
          textarea {
            height: 200px;
            width: 400px;
          }
          button {
            display: block;
          }
        `}</style>
        <h3>Enter desired text</h3>
        <textarea
          onChange={e => this.setState({ words: e.target.value })}
          value={this.state.words}
        />
        <button
          type="submit"
        >
          Submit text
        </button>
      </form>
    )
  }
}
