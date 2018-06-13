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
      , relativePath
    } = this.props
    const renderedDeopts = this._renderDeopts(deopts, deoptLocations, relativePath)
    const renderedIcs = this._renderIcs(ics, icLocations, relativePath)
    const renderedCodes = this._renderCodes(codes, codeLocations, relativePath)
    return (
      <div className={className}>
        {renderedCodes}
        {renderedDeopts}
        {renderedIcs}
      </div>
    )
  }

  _renderIcs(ics, icLocations, relativePath) {
    if (ics == null) return null
    const { selectedLocation, includeAllSeverities } = this.props
    const rendered = []
    for (const loc of icLocations) {
      const infos = ics.get(loc)
      if (!includeAllSeverities && infos.severity <= MIN_SEVERITY) continue

      const highlightedClass = selectedLocation === infos.id ? 'bg-light-yellow' : 'bg-light-gray'
      const className = `${highlightedClass} ba br2 bw1 ma3 pa2`
      rendered.push(
        <div className={className} key={infos.id}>
          {this._summary(infos, relativePath)}
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

  _renderDeopts(deopts, deoptLocations, relativePath) {
    if (deopts == null) return null
    const { selectedLocation, includeAllSeverities } = this.props
    const rendered = []
    for (const loc of deoptLocations) {
      const infos = deopts.get(loc)
      if (!includeAllSeverities && infos.severity <= MIN_SEVERITY) continue

      const highlightedClass = selectedLocation === infos.id ? 'bg-light-yellow' : 'bg-light-gray'
      const className = `${highlightedClass} ba br2 bw1 ma3 pa2`
      rendered.push(
        <div className={className} key={infos.id}>
          {this._summary(infos, relativePath)}
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

  _renderCodes(codes, codeLocations, relativePath) {
    if (codes == null) return null
    const { selectedLocation, includeAllSeverities } = this.props
    const rendered = []
    for (const loc of codeLocations) {
      const infos = codes.get(loc)
      assert(infos.length === 1, 'should never have more than one code info')

      if (!includeAllSeverities && infos.severity <= MIN_SEVERITY) continue

      const highlightedClass = selectedLocation === infos.id ? 'bg-light-yellow' : 'bg-light-gray'
      const className = `${highlightedClass} ba br2 bw1 ma3 pa2`
      rendered.push(
        <div className={className} key={infos.id}>
          {this._summary(infos, relativePath)}
          {this._renderCode(infos[0].updates, infos.id)}
        </div>
      )
    }
    return (
      <div key='optimizations'>
        <h4 className='underline'>Optimizations</h4>
        {rendered}
      </div>
    )
  }

  _summary(infos, relativePath) {
    const { id } = infos
    const {
        functionName
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

  _renderCode(updates, id) {
    const rows = []
    for (const update of updates) {
      rows.push(this._codeRow(update, id++))
    }
    return (
      <table key={'code:' + id}>
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
