'use strict'

const React = require('react')
const { Component } = React
const scrollIntoView = require('scroll-into-view-if-needed')

const assert = require('assert')
const { nameIcState, severityIcState } = require('../../lib/ic-state')

const severityClassNames = [
    'green i'
  , 'blue'
  , 'red b'
]

function highestSeverity(infos) {
  return infos.reduce(
      (highest, { severity }) => severity > highest ? severity : highest
    , 0
  )
}

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
    if (ics == null) return null
    const { selectedLocation, includeAllSeverities } = this.props
    const rendered = []
    for (const loc of icLocations) {
      const infos = ics.get(loc)
      if (!includeAllSeverities && highestSeverity(infos) === 0) continue

      const highlightedClass = selectedLocation === infos.id ? 'bg-light-yellow' : 'bg-light-gray'
      const className = `${highlightedClass} ba br2 bw1 ma3 pa2`
      rendered.push(
        <div className={className} key={infos.id}>
          {this._summary(infos)}
          {this._renderIc(infos)}
        </div>
      )
    }
    return (
      <div key='ics'>
        <h4 className='underline'>Inline Caches</h4>
        {rendered}
      </div>
    )
  }

  _renderDeopts(deopts, deoptLocations) {
    if (deopts == null) return null
    const { selectedLocation, includeAllSeverities } = this.props
    const rendered = []
    for (const loc of deoptLocations) {
      const infos = deopts.get(loc)
      if (!includeAllSeverities && highestSeverity(infos) === 0) continue

      const highlightedClass = selectedLocation === infos.id ? 'bg-light-yellow' : 'bg-light-gray'
      const className = `${highlightedClass} ba br2 bw1 ma3 pa2`
      rendered.push(
        <div className={className} key={infos.id}>
          {this._summary(infos)}
          {this._renderDeopt(infos)}
        </div>
      )
    }
    return (
      <div key='deopts'>
        <h4 className='underline'>Deoptimizations</h4>
        {rendered}
      </div>
    )
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
      <table key={'deopt:' + infos.id}>
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

  _renderIc(infos) {
    const rows = []
    let id = 0
    for (const info of infos) {
      rows.push(this._icRow(info, id++))
    }
    return (
      <table key={'ic:' + infos.id}>
        <thead className='f5 b tc'>
          <tr>
            <td>Old State</td>
            <td>New State</td>
            <td>Key</td>
            <td>Map</td>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

  _icRow(info, id) {
    const {
        oldState
      , newState
      , key
      , map
    } = info
    const oldStateName = nameIcState(oldState)
    const severityOldState = severityIcState(oldState)
    const oldStateClassName = severityClassNames[severityOldState]

    const newStateName = nameIcState(newState)
    const severityNewState = severityIcState(newState)
    const newStateClassName = severityClassNames[severityNewState]

    const mapString = `0x${map}`
    return (
      <tr key={key + id}>
        <td className={oldStateClassName}>{oldStateName}</td>
        <td className={newStateClassName}>{newStateName}</td>
        <td className='black tl'>{key}</td>
        <td className='gray tr'>{mapString}</td>
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
      , includeAllSeverities
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
          includeAllSeverities={includeAllSeverities}
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
