'use strict'

const React = require('react')
const { Component } = React

const assert = require('assert')

class ToolbarView extends Component {
  constructor(props) {
    super(props)
    const { onincludeAllSeveritiesChanged } = props
    assert.equal(typeof onincludeAllSeveritiesChanged, 'function', 'need to pass onincludeAllSeveritiesChanged function')
    this._bind()
  }

  _bind() {
    this._onincludeAllSeveritiesToggled = this._onincludeAllSeveritiesToggled.bind(this)
  }

  render() {
    const { className = '' } = this.props
    const options = this._renderOptions()
    return (
      <div className={className}>
        {options}
      </div>
    )
  }

  _renderOptions() {
    const { includeAllSeverities } = this.props
    return (
      <span>
        Low Severities
        <input
          className='pointer'
          type='checkbox'
          defaultChecked={!!includeAllSeverities}
          onChange={this._onincludeAllSeveritiesToggled} />
      </span>
    )
  }

  _onincludeAllSeveritiesToggled(e) {
    const { onincludeAllSeveritiesChanged, includeAllSeverities } = this.props
    onincludeAllSeveritiesChanged(!includeAllSeverities)
  }
}

module.exports = {
  ToolbarView
}
