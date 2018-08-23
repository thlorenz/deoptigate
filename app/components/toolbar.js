'use strict'

const React = require('react')
const { Component } = React

const assert = require('assert')

class ToolbarView extends Component {
  constructor(props) {
    super(props)
    const { onincludeAllSeveritiesChanged, onhighlightCodeChanged } = props
    assert.equal(typeof onincludeAllSeveritiesChanged, 'function', 'need to pass onincludeAllSeveritiesChanged function')
    assert.equal(typeof onhighlightCodeChanged, 'function', 'need to pass onhighlightCodeChanged function')
    this._bind()
  }

  _bind() {
    this._onincludeAllSeveritiesToggled = this._onincludeAllSeveritiesToggled.bind(this)
    this._onhighlightCodeToggled = this._onhighlightCodeToggled.bind(this)
  }

  render() {
    const { className = '' } = this.props
    return (
      <div className={className}>
        <span>
          {this._renderHighlightCodeOption()}
          {this._renderSeverityOption()}
        </span>
      </div>
    )
  }

  _renderSeverityOption() {
    const { includeAllSeverities } = this.props
    return (
      <span className='white pr2 pl2'>
        Low Severities
        <input
          className='ml1 pointer'
          type='checkbox'
          defaultChecked={!!includeAllSeverities}
          onChange={this._onincludeAllSeveritiesToggled} />
      </span>
    )
  }

  _renderHighlightCodeOption() {
    const { highlightCode } = this.props
    return (
      <span className='white pr2 pl2'>
        Highlight Code
        <input
          className='ml1 pointer'
          type='checkbox'
          defaultChecked={!!highlightCode}
          onChange={this._onhighlightCodeToggled} />
      </span>
    )
  }

  _onincludeAllSeveritiesToggled(e) {
    const { onincludeAllSeveritiesChanged, includeAllSeverities } = this.props
    onincludeAllSeveritiesChanged(!includeAllSeverities)
  }

  _onhighlightCodeToggled(e) {
    const { onhighlightCodeChanged, highlightCode } = this.props
    onhighlightCodeChanged(!highlightCode)
  }
}

module.exports = {
  ToolbarView
}
