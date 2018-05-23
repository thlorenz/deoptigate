'use strict'

const colors = require('ansicolors')
const { severityColors, browserSeverityColors } = require('./severities')
const { unkeyLocation } = require('./location')
const assert = require('assert')

const DEOPTSYMBOL = '▼'
const ICSYMBOL = '☎'

function highestSeverity(infos) {
  return infos.reduce(
      (highest, { severity }) => severity > highest ? severity : highest
    , 0
  )
}

function applyMark(codeLocation, markerLocation) {
  if (codeLocation.line > markerLocation.line) return true
  if (codeLocation.line < markerLocation.line) return false
  if (codeLocation.column < markerLocation.column) return false
  return true
}

class MarkerResolver {
  constructor({
      ics
    , deopts
    , icLocations
    , deoptLocations
    , isterminal
    , selectedLocation = null
  }) {
    assert(ics == null || icLocations != null, 'need to provide locations for ics')
    assert(deopts == null || deoptLocations != null, 'need to provide locations for deopts')

    this._ics = ics
    this._icLocations = icLocations
    this._icLocationIdx = 0

    this._deopts = deopts
    this._deoptLocations = deoptLocations
    this._deoptLocationIdx = 0

    this._isterminal = isterminal
    this._selectedLocation = selectedLocation
  }

  resolve(codeLocation) {
    let s = ''
    s += this._resolveDeopt(codeLocation)
    s += this._resolveIc(codeLocation)
    return s
  }

  _resolveDeopt(codeLocation) {
    if (this._deopts == null) return ''
    const { result, locationIdx } = this._resolve({
        codeLocation
      , map         : this._deopts
      , locationIdx : this._deoptLocationIdx
      , locations   : this._deoptLocations
    })
    this._deoptLocationIdx = locationIdx
    return result
  }

  _resolveIc(codeLocation) {
    if (this._ics == null) return ''
    const { result, locationIdx } = this._resolve({
        codeLocation
      , map         : this._ics
      , locationIdx : this._icLocationIdx
      , locations   : this._icLocations
    })
    this._icLocationIdx = locationIdx
    return result
  }

  _resolve({ map, codeLocation, locationIdx, locations }) {
    let result = ''

    let locationKey = locations[locationIdx]
    let currentLocation = unkeyLocation(locationKey)

    while (
      currentLocation != null &&
      applyMark(codeLocation, currentLocation)
    ) {
      result += this._determineMarkerSymbol(map, locationKey)
      locationIdx++
      locationKey = locations[locationIdx]
      currentLocation = unkeyLocation(locationKey)
    }
    return { result, locationIdx }
  }

  _determineMarkerSymbol(map, key) {
    const isdeopt = map === this._deopts
    if (map != null && map.has(key)) {
      return this._handle(map.get(key), isdeopt)
    }
    return ''
  }

  _handle(infos, isdeopt) {
    const severity = highestSeverity(infos)
    // Could make this configurable to include markers for severity 0
    if (severity === 0) return ''
    return this._isterminal
      ? this._determineTerminalMarkerSymbol(infos, severity, isdeopt)
      : this._determineBrowserMarkerSymbol(infos, severity, isdeopt)
  }

  _terminalSymbol(infos, severity, isdeopt) {
    const symbol = isdeopt ? DEOPTSYMBOL : ICSYMBOL
    return severityColors[severity - 1](symbol)
  }

  _terminalFootnote(infos) {
    return colors.brightBlack(`(${infos.id})`)
  }

  _determineTerminalMarkerSymbol(infos, severity, isdeopt) {
    return (
      this._terminalSymbol(infos, severity, isdeopt) +
      this._terminalFootnote(infos)
    )
  }

  _determineBrowserMarkerSymbol(infos, severity, isdeopt) {
    const symbol = isdeopt ? DEOPTSYMBOL : ICSYMBOL
    const color = browserSeverityColors[severity - 1]
    const className = (
      this._selectedLocation === infos.id
      ? `${color} selected`
      : color
    )
    return (
      `<a href='#'id="code-location-${infos.id}" class="${className}"` +
        ` data-markerid="${infos.id}">${symbol}</a>`
    )
  }
}

module.exports = MarkerResolver
