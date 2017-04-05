import { Component } from 'react'
import WordsForm from '../components/WordsForm'
import PlaybackText from '../components/PlaybackText'

export default class IndexPage extends Component {
  constructor() {
    super()
    this.state =
      { text: '' }
  }
  render() {
    return (
      <div>
        <WordsForm onSubmit={text => this.setState({ text })}/>
        <PlaybackText text={this.state.text} />
      </div>
    )
  }
}
