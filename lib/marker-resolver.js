'use strict'

const colors = require('ansicolors')
const { severityColors } = require('./severities')

const DEOPTSYMBOL = '▼'
const ICSYMBOL = '☎'

function highestSeverity(infos) {
  return infos.reduce(
      (highest, { severity }) => severity > highest ? severity : highest
    , 0
  )
}

class MarkerResolver {
  constructor({ ics, deopts, locations, isterminal }) {
    this._ics = ics
    this._deopts = deopts
    this._locations = locations
    this._locationIdx = 0
    this._currentLocation = this._locations[0]
    this._isterminal = isterminal
  }

  resolve(location) {
    if (location <= this._currentLocation) return ''
    var s = ''
    do {
      this._locationIdx++
      this._currentLocation = this._locations[this._locationIdx]
      s += this._determineMarkerSymbol()
    } while (location > this._currentLocation)
    return s
  }

  _determineMarkerSymbol() {
    const key = this._currentLocation
    // prefer deopts over ics when determining rendering
    if (this._deopts != null && this._deopts.has(key)) {
      return this._handle(this._deopts.get(key), true)
    }
    if (this._ics != null && this._ics.has(key)) {
      return this._handle(this._ics.get(key), false)
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

  _terminalFootnote() {
    return colors.brightBlack(`(${this._locationIdx})`)
  }

  _determineTerminalMarkerSymbol(infos, severity, isdeopt) {
    return (
      this._terminalSymbol(infos, severity, isdeopt) +
      this._terminalFootnote()
    )
  }

  _determineBrowserMarkerSymbol(infos, severity, isdeopt) {
    throw new Error('Unimplemented')
  }
}

module.exports = MarkerResolver
