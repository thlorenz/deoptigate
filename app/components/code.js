'use strict'

const React = require('react')
const { Component } = React
const ReactDOM = require('react-dom')
const assert = require('assert')
const scrollIntoView = require('scroll-into-view-if-needed')

const Theme = require('../theme.browser')
const MarkerResolver = require('../../lib/marker-resolver')
const { highlight } = require('peacock')

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
        file
      , code
      , ics
      , deopts
      , icLocations
      , deoptLocations
      , selectedLocation
    } = this.props

    const markerResolver = new MarkerResolver({
        deopts
      , deoptLocations
      , ics
      , icLocations
      , isterminal: false
      , selectedLocation
    })

    const theme = new Theme(markerResolver).theme
    const highlightedCode = highlight(code, { theme, linenos: true })
    return (
      <div>
        <h4>{file}</h4>
        <div dangerouslySetInnerHTML={{__html: highlightedCode}} />
      </div>
    )
  }

  _onmarkerClicked(id) {
    const { onmarkerClicked } = this.props
    onmarkerClicked(id)
  }
}

class CodesView extends Component {
  constructor(props) {
    super()

    const { onmarkerClicked } = props
    assert.equal(typeof onmarkerClicked, 'function', 'need to pass onmarkerClicked function')
  }

  render() {
    const {
        files
      , groups
      , selectedLocation
      , className = ''
      , onmarkerClicked
    } = this.props

    const codes = Array.from(groups)
      .map(([ file, { ics, icLocations, deopts, deoptLocations } ], idx) => {
        const code = files.get(file).src
        return (
          <CodeView
            key={file}
            selectedLocation={selectedLocation}
            file={file}
            code={code}
            ics={ics}
            icLocations={icLocations}
            deopts={deopts}
            deoptLocations={deoptLocations}
            onmarkerClicked={onmarkerClicked} />
        )
      })

    return (
      <div className={className}>{codes}</div>
    )
  }
}

module.exports = {
  CodesView
}
