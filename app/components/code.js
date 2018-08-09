'use strict'

const React = require('react')
const { Component } = React
const ReactDOM = require('react-dom')
const assert = require('assert')
const scrollIntoView = require('scroll-into-view-if-needed')
const { highlight } = require('peacock')

const Theme = require('../theme.browser')
const MarkerResolver = require('../../lib/rendering/marker-resolver')

function tryHighlightCode(fileName, code, theme) {
  // TODO: if file is very large or fails to highlight add markers without highlighting
  try {
    try {
      // Highlighting without jsx support allows peacock to only parse out tokens
      // which is faster than building the AST
      const jsx = fileName.endsWith('jsx')
      return highlight(code, { theme, linenos: true, jsx })
    } catch (err) {
      // File maybe jsx file even though it doesn't have that extension
      // so let's try again
      return highlight(code, { theme, linenos: true, jsx: true })
    }
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
      const { markerid, markertype } = tgt.dataset
      if (markerid == null) return
      event.preventDefault()
      event.stopPropagation()
      this._onmarkerClicked(parseInt(markerid), markertype)
    })
  }

  componentDidUpdate() {
    const { selectedLocation } = this.props
    if (selectedLocation == null) return
    const code = document.getElementById(`code-location-${selectedLocation}`)
    if (code == null) return
    scrollIntoView(code, { behavior: 'smooth', scrollMode: 'if-needed' })
  }

  shouldComponentUpdate(nextProps) {
    const props = this.props
    return (
         props.code !== nextProps.code
      || props.selectedLocation !== nextProps.selectedLocation
      || props.includeAllSeverities !== nextProps.includeAllSeverities
    )
  }

  render() {
    const {
        className = ''
      , code
      , fileName
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
    const highlightedCode = tryHighlightCode(fileName, code, theme)
    return (
      <div className={className}>
        <div dangerouslySetInnerHTML={{__html: highlightedCode}} />
      </div>
    )
  }

  _onmarkerClicked(id, type) {
    const { onmarkerClicked } = this.props
    onmarkerClicked(id, type)
  }
}

module.exports = {
  CodeView
}
