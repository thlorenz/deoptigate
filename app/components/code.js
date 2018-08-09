'use strict'

const React = require('react')
const { Component } = React
const ReactDOM = require('react-dom')
const assert = require('assert')
const scrollIntoView = require('scroll-into-view-if-needed')
const { highlight } = require('peacock')

const Theme = require('../theme.browser')
const MarkerResolver = require('../../lib/rendering/marker-resolver')

const markOnly = require('../../lib/rendering/mark-only')

const MAX_HIGHLIGHT_LEN = 1E5

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
      || props.highlightCode !== nextProps.highlightCode
    )
  }

  render() {
    const {
        className = ''
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
    const highlightedCode = this._tryHighlightCode(theme, markerResolver)
    return (
      <div className={className}>
        <div dangerouslySetInnerHTML={{__html: highlightedCode}} />
      </div>
    )
  }

  _tryHighlightCode(theme, markerResolver) {
    const { fileName, code, highlightCode } = this.props
    const nohighlight = !highlightCode || code.length > MAX_HIGHLIGHT_LEN
    if (nohighlight) return markOnly(code, markerResolver)
    try {
      try {
        // Highlighting without jsx support allows peacock to only parse out tokens
        // which is faster than building the AST
        const jsx = fileName.endsWith('jsx')
        return highlight(code, { theme, linenos: true, jsx })
      } catch (err) {
        // Higlighting without jsx option failed, try again
        return highlight(code, { theme, linenos: true, jsx: true })
      }
    } catch (err) {
      // Highlighting failed alltogether
      try {
        return markOnly(code, markerResolver)
      } catch (innerErr) {
        // Even marking only failed, just show the code :(
        return `
          <p>Deoptigate was unable to highlight/mark the below code</p>
          <pre style='white-space: pre'>${code}</pre>
        `
      }
    }
  }

  _onmarkerClicked(id, type) {
    const { onmarkerClicked } = this.props
    onmarkerClicked(id, type)
  }
}

module.exports = {
  CodeView
}
