'use strict'

const React = require('react')
const { Component } = React
const scrollIntoView = require('scroll-into-view-if-needed')

const assert = require('assert')
const { nameIcState, severityIcState } = require('../../lib/log-processing/ic-state')
const {
    nameOptimizationState
  , severityOfOptimizationState
} = require('../../lib/log-processing/optimization-state')
const { MIN_SEVERITY } = require('../../lib/severities')

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

    this._bind()
  }

  _bind() {
    this._renderIc = this._renderIc.bind(this)
    this._renderDeopt = this._renderDeopt.bind(this)
    this._renderCode = this._renderCode.bind(this)
  }

  componentDidUpdate() {
    const { selectedLocation } = this.props
    if (selectedLocation == null) return
    const summary = document.getElementById(`summary-location-${selectedLocation}`)
    if (summary == null) return
    scrollIntoView(summary, { behavior: 'smooth', scrollMode: 'if-needed' })
  }

  render() {
    const {
        className = ''
      , ics
      , icLocations
      , deopts
      , deoptLocations
      , codes
      , codeLocations
    } = this.props
    const renderedDeopts = this._renderDeopts(deopts, deoptLocations)
    const renderedIcs = this._renderIcs(ics, icLocations)
    const renderedCodes = this._renderCodes(codes, codeLocations)
    return (
      <div className={className}>
        {renderedCodes}
        {renderedDeopts}
        {renderedIcs}
      </div>
    )
  }

  _renderDataPoint(data, locations, renderDetails) {
    const { selectedLocation, includeAllSeverities, relativePath } = this.props
    const rendered = []
    for (const loc of locations) {
      const info = data.get(loc)
      if (!includeAllSeverities && info.severity <= MIN_SEVERITY) continue

      const highlightedClass = selectedLocation === info.id ? 'bg-light-yellow' : 'bg-light-gray'
      const className = `${highlightedClass} ba br2 bw1 ma3 pa2`
      rendered.push(
        <div className={className} key={info.id}>
          {this._summary(info, relativePath)}
          {renderDetails(info)}
        </div>
      )
    }
    return rendered
  }

  _renderIcs(ics, icLocations) {
    if (ics == null) return null
    const rendered = this._renderDataPoint(ics, icLocations, this._renderIc)
    return (
      <div key='ics'>
        <h4 className='underline'>Inline Caches</h4>
        {rendered}
      </div>
    )
  }

  _renderDeopts(deopts, deoptLocations) {
    if (deopts == null) return null
    const rendered = this._renderDataPoint(deopts, deoptLocations, this._renderDeopt)
    return (
      <div key='deopts'>
        <h4 className='underline'>Deoptimizations</h4>
        {rendered}
      </div>
    )
  }

  _renderCodes(codes, codeLocations, relativePath) {
    if (codes == null) return null
    const rendered = this._renderDataPoint(codes, codeLocations, this._renderCode)
    return (
      <div key='optimizations'>
        <h4 className='underline'>Optimizations</h4>
        {rendered}
      </div>
    )
  }

  _summary(info, relativePath) {
    const {
        id
      , functionName
      , line
      , column
    } = info
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
        {functionName} at {relativePath}:{line}:{column}
      </a>
    )
    return (
      <div id={'summary-location-' + id}>
        {locationEl}
        {fullLoc}
      </div>
    )
  }

  _renderDeopt(info) {
    const rows = info.updates.map((update, idx) => this._deoptRow(update, idx))
    return (
      <table key={'deopt:' + info.id}>
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

  _renderIc(info) {
    const rows = info.updates.map((update, idx) => this._icRow(update, idx))
    return (
      <table key={'ic:' + info.id}>
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

  _icRow(update, id) {
    const {
        oldState
      , newState
      , key
      , map
    } = update
    const oldStateName = nameIcState(oldState)
    const severityOldState = severityIcState(oldState)
    const oldStateClassName = severityClassNames[severityOldState - 1]

    const newStateName = nameIcState(newState)
    const severityNewState = severityIcState(newState)
    const newStateClassName = severityClassNames[severityNewState - 1]

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

  _renderCode(info) {
    const rows = info.updates.map((update, idx) => this._codeRow(update, idx))
    return (
      <table key={'code:' + info.id}>
        <thead className='f5 b tc'>
          <tr>
            <td>Timestamp</td>
            <td>Optimization State</td>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

  _codeRow(info, id) {
    const { timestamp, state } = info
    const timeStampMs = (timestamp / 1E3).toFixed()
    const codeState = nameOptimizationState(state)
    const severity = severityOfOptimizationState(state)
    const codeStateClassName = severityClassNames[severity - 1]

    return (
      <tr key={timestamp}>
        <td>{timeStampMs}ms</td>
        <td className={codeStateClassName}>{codeState}</td>
      </tr>
    )
  }

  _onsummaryClicked(id) {
    const { onsummaryClicked } = this.props
    onsummaryClicked(id)
  }
}
module.exports = {
  SummaryView
}
