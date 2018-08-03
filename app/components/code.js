'use strict'

const React = require('react')
const { Component } = React
const ReactDOM = require('react-dom')
const assert = require('assert')
const scrollIntoView = require('scroll-into-view-if-needed')
const { highlight } = require('peacock')

const Theme = require('../theme.browser')
const MarkerResolver = require('../../lib/rendering/marker-resolver')

function tryHighlightCode(code, theme) {
  try {
    return highlight(code, { theme, linenos: true })
  } catch (err) {
    return `
      <p>Deoptigate was unable to highlight the below code</p>
      <pre style='whitespace: pre'>${code}</pre>
    `
  }
}

class CodeView extends Component {
  constructor(props) {
    super()

    const { onmarkerClicked } = props
    assert.equal(typeof onmarkerClicked, 'function', 'need to pass onmarkerClicked function')
    this._bind()
  }

  _bind() {
    this._onmarkerClicked = this._onmarkerClicked.bind(this)
  }

  componentDidMount() {
    const rootEl = ReactDOM.findDOMNode(this)
    rootEl.addEventListener('click', event => {
      const tgt = event.target
      const { markerid } = tgt.dataset
      if (markerid == null) return
      event.preventDefault()
      event.stopPropagation()
      this._onmarkerClicked(parseInt(markerid))
    })
  }

  componentDidUpdate() {
    const { selectedLocation } = this.props
    if (selectedLocation == null) return
    const code = document.getElementById(`code-location-${selectedLocation}`)
    if (code == null) return
    scrollIntoView(code, { behavior: 'smooth', scrollMode: 'if-needed' })
  }

  render() {
    const {
        className = ''
      , code
      , ics
      , deopts
      , codes
      , icLocations
      , deoptLocations
      , codeLocations
      , selectedLocation
      , includeAllSeverities
    } = this.props

    const markerResolver = new MarkerResolver({
        deopts
      , deoptLocations
      , ics
      , icLocations
      , codes
      , codeLocations
      , selectedLocation
      , includeAllSeverities
    })

    const theme = new Theme(markerResolver).theme
    const highlightedCode = tryHighlightCode(code, theme)
    return (
      <div className={className}>
        <div dangerouslySetInnerHTML={{__html: highlightedCode}} />
      </div>
    )
  }

  _onmarkerClicked(id) {
    const { onmarkerClicked } = this.props
    onmarkerClicked(id)
  }
}

module.exports = {
  CodeView
}
