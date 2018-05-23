'use strict'

const React = require('react')
const { Component } = React
const scrollIntoView = require('scroll-into-view-if-needed')

const assert = require('assert')

const severityClassNames = [
    'green i'
  , 'blue'
  , 'red b'
]

class SummaryView extends Component {
  constructor(props) {
    super(props)
    const { ics, icLocations, deopts, deoptLocations, onsummaryClicked } = props

    assert(ics == null || icLocations != null, 'need to provide locations for ics')
    assert(deopts == null || deoptLocations != null, 'need to provide locations for deopts')
    assert.equal(typeof onsummaryClicked, 'function', 'need to pass onsummaryClicked function')
  }

  componentDidUpdate() {
    const { selectedLocation } = this.props
    if (selectedLocation == null) return
    const summary = document.getElementById(`summary-location-${selectedLocation}`)
    if (summary == null) return
    scrollIntoView(summary, { behavior: 'smooth', scrollMode: 'if-needed' })
  }

  render() {
    const { ics, icLocations, deopts, deoptLocations, file } = this.props
    const renderedDeopts = this._renderDeopts(deopts, deoptLocations)
    const renderedIcs = this._renderIcs(ics, icLocations)
    return (
      <div>
        <h4>{file}</h4>
        {renderedDeopts}
        {renderedIcs}
      </div>
    )
  }

  _renderIcs(ics, icLocations) {
    return <div>TODO render Ics</div>
  }

  _renderDeopts(deopts, deoptLocations) {
    if (deopts == null) return null
    const { selectedLocation } = this.props
    const rendered = []
    for (const loc of deoptLocations) {
      const infos = deopts.get(loc)
      const highlightedClass = selectedLocation === infos.id ? 'bg-light-yellow' : 'bg-light-gray'
      const className = `${highlightedClass} ba br2 bw1 ma3 pa2`
      rendered.push(
        <div className={className} key={infos.id}>
          {this._summary(infos)}
          {this._renderDeopt(infos)}
        </div>
      )
    }
    return rendered
  }

  _summary(infos) {
    const { id } = infos
    const {
        functionName
      , file
      , line
      , column
    } = infos[0]
    const locationEl = <span className='dark-blue f5 mr2'>{id}</span>
    const onclicked = e => {
      e.preventDefault()
      e.stopPropagation()
      this._onsummaryClicked(id)
    }

    const fullLoc = (
      <a href='#'
        className='i gray'
        onClick={onclicked}>
        {functionName} at {file}:{line}:{column}
      </a>
    )
    return (
      <div id={'summary-location-' + id}>
        {locationEl}
        {fullLoc}
      </div>
    )
  }

  _renderDeopt(infos) {
    const rows = []
    for (const info of infos) {
      rows.push(this._deoptRow(info))
    }
    return (
      <table key={infos.id}>
        <thead className='f5 b tc'>
          <tr>
            <td>Timestamp</td>
            <td>Bailout</td>
            <td>Reason</td>
            <td>Inlined</td>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

  _deoptRow(info) {
    const {
        inlined
      , bailoutType
      , deoptReason
      , timestamp
      , severity
    } = info
    const bailoutClassName = severityClassNames[severity - 1]
    const timeStampMs = (timestamp / 1E3).toFixed()
    return (
      <tr key={timestamp}>
        <td>{timeStampMs}ms</td>
        <td className={bailoutClassName}>{bailoutType}</td>
        <td className='tr'>{deoptReason}</td>
        <td className='gray tr'>{inlined ? 'yes' : 'no'}</td>
      </tr>
    )
  }

  _onsummaryClicked(id) {
    const { onsummaryClicked } = this.props
    onsummaryClicked(id)
  }
}

class SummariesView extends Component {
  render() {
    const {
        groups
      , selectedLocation
      , className = ''
      , onsummaryClicked
    } = this.props

    const summaries = Array.from(groups)
      .map(([ key, { ics, icLocations, deopts, deoptLocations } ], idx) =>
        <SummaryView
          key={idx}
          selectedLocation={selectedLocation}
          file={key}
          ics={ics}
          icLocations={icLocations}
          deopts={deopts}
          deoptLocations={deoptLocations}
          onsummaryClicked={onsummaryClicked} />
      )

    return (
      <div className={className}>{summaries}</div>
    )
  }
}

module.exports = {
  SummariesView
}
