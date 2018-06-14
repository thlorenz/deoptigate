'use strict'

const colors = require('ansicolors')
const {
    severityColors
  , browserSeverityColors
  , MIN_SEVERITY
} = require('../severities')
const { unkeyLocation } = require('../grouping/location')
const assert = require('assert')

const DEOPTSYMBOL = '▼'
const ICSYMBOL = '☎'
const CODESYMBOL = '▲'

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
    , codes
    , icLocations
    , deoptLocations
    , codeLocations
  , isterminal
    , selectedLocation = null
    , includeAllSeverities = true
  }) {
    assert(ics == null || icLocations != null, 'need to provide locations for ics')
    assert(deopts == null || deoptLocations != null, 'need to provide locations for deopts')
    assert(codes == null || codeLocations != null, 'need to provide locations for codes')

    this._ics = ics
    this._icLocations = icLocations
    this._icLocationIdx = 0

    this._deopts = deopts
    this._deoptLocations = deoptLocations
    this._deoptLocationIdx = 0

    this._codes = codes
    this._codeLocations = codeLocations
    this._codeLocationIdx = 0

    this._isterminal = isterminal
    this._selectedLocation = selectedLocation
    this._includeAllSeverities = includeAllSeverities
  }

  resolve(codeLocation) {
    let insertBefore = ''
    let insertAfter = ''
    {
      const { before, after } = this._resolveDeopt(codeLocation)
      insertBefore += before
      insertAfter += after
    }
    {
      const { before, after } = this._resolveIc(codeLocation)
      insertBefore += before
      insertAfter += after
    }
    {
      const { before, after } = this._resolveCode(codeLocation)
      insertBefore += before
      insertAfter += after
    }
    return { insertBefore, insertAfter }
  }

  _resolveDeopt(codeLocation) {
    if (this._deopts == null) return ''
    const { before, after, locationIdx } = this._resolve({
        codeLocation
      , map         : this._deopts
      , locationIdx : this._deoptLocationIdx
      , locations   : this._deoptLocations
    })
    this._deoptLocationIdx = locationIdx
    return { before, after }
  }

  _resolveIc(codeLocation) {
    if (this._ics == null) return ''
    const { before, after, locationIdx } = this._resolve({
        codeLocation
      , map         : this._ics
      , locationIdx : this._icLocationIdx
      , locations   : this._icLocations
    })
    this._icLocationIdx = locationIdx
    return { before, after }
  }

  _resolveCode(loc) {
    if (this._codes == null) return ''
    const { before, after, locationIdx } = this._resolve({
        codeLocation: loc
      , map         : this._codes
      , locationIdx : this._codeLocationIdx
      , locations   : this._codeLocations
    })
    this._codeLocationIdx = locationIdx
    return { before, after }
  }

  _resolve({ map, codeLocation, locationIdx, locations }) {
    let before = ''
    let after = ''

    let locationKey = locations[locationIdx]
    let currentLocation = unkeyLocation(locationKey)

    while (
      currentLocation != null &&
      applyMark(codeLocation, currentLocation)
    ) {
      const { result, placeBefore } = this._determineMarkerSymbol(map, locationKey)
      if (placeBefore) before += result
      else after += result
      locationIdx++
      locationKey = locations[locationIdx]
      currentLocation = unkeyLocation(locationKey)
    }
    return { before, after, locationIdx }
  }

  _determineMarkerSymbol(map, key) {
    const kind = (
        map === this._deopts ?  'deopt'
      : map === this._ics ? 'ic'
      : 'code'
    )
    if (map != null && map.has(key)) {
      return this._handle(map.get(key), kind)
    }
    return ''
  }

  _handle(info, kind) {
    const severity = info.severity
    if (severity === MIN_SEVERITY && !this._includeAllSeverities) return { result: '' }
    const result = this._isterminal
      ? this._determineTerminalMarkerSymbol(info, kind)
      : this._determineBrowserMarkerSymbol(info, kind)

    // anonymous Node.js function wrapper
    const placeBefore = (info.isScript && info.line === 1 && info.column === 1)
    return { result, placeBefore }
  }

  _terminalSymbol(infos, severity, kind) {
    const symbol = (
        kind === 'deopt' ? DEOPTSYMBOL
      : kind === 'ic' ? ICSYMBOL
      : CODESYMBOL
    )
    return severityColors[severity - 1](symbol)
  }

  _terminalFootnote(infos) {
    return colors.brightBlack(`(${infos.id})`)
  }

  // TODO: adapt or rip out
  _determineTerminalMarkerSymbol(infos, severity, kind) {
    return (
      this._terminalSymbol(infos, severity, kind) +
      this._terminalFootnote(infos)
    )
  }

  _determineBrowserMarkerSymbol(info, kind) {
    const symbol = (
        kind === 'deopt' ? DEOPTSYMBOL
      : kind === 'ic' ? ICSYMBOL
      : CODESYMBOL
    )
    const color = browserSeverityColors[info.severity - 1]
    const className = (
      this._selectedLocation === info.id
      ? `${color} selected`
      : color
    )
    return (
      `<a href='#'id="code-location-${info.id}" class="${className}"` +
        ` data-markerid="${info.id}">${symbol}</a>`
    )
  }
}

module.exports = MarkerResolver
