'use strict'

const { highlight } = require('cardinal')
const ThemeTerminal = require('./theme.terminal')
const colors = require('ansicolors')

const deoptSeverityColors = [
    colors.green
  , colors.blue
  , colors.red
]
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
    return deoptSeverityColors[severity - 1](symbol)
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

// eslint-disable-next-line no-unused-vars
function inspect(obj, { depth = 5, colors = true, maxArrayLength = 10 } = {}) {
  console.error(require('util').inspect(obj, { depth, colors, maxArrayLength }))
}
if (!module.parent && typeof window === 'undefined') {
(async () => {
  const resolveFiles = require('./resolve-files')
  const mapByFile = require('./map-by-file')
  const groupByLocation = require('./group-by-location')
  const path = require('path')
  const fs = require('fs')
  try {
    const data = require('../results/v8.log.json')
    const root = path.join(__dirname, '..', '..', 'v8-ic-processor', 'tmp')
    const resolved = await resolveFiles({ data, root })
    const byFile = mapByFile(resolved)
    const { ics, deopts, locations } = groupByLocation(byFile).get('../examples/adders.js')
    const code = fs.readFileSync(path.join(__dirname, '..', '..', 'v8-ic-processor', 'examples', 'adders.js'), 'utf8')
    const markerResolver = new MarkerResolver({ ics, deopts, locations, isterminal: true })
    const theme = new ThemeTerminal(markerResolver).theme
    const highlighted = highlight(code, { theme })
    console.log(highlighted)
  } catch (err) {
    console.error(err)
  }
})()
}

