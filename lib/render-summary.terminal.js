'use strict'

const colors = require('ansicolors')
const ansiRegex = require('ansi-regex')
const table = require('text-table')
const { severityColors } = require('./severities')

// eslint-disable-next-line no-unused-vars
function inspect(obj, { depth = 5, colors = true, maxArrayLength = 10 } = {}) {
  console.error(require('util').inspect(obj, { depth, colors, maxArrayLength }))
}

function underlineRow(headerRow) {
  return headerRow.map(x => '-'.repeat(x.length))
}

class SummaryRenderer {
  constructor({ ics, deopts, deoptLocations }) {
    this._ics = ics
    this._deopts = deopts
    this._deoptLocations = deoptLocations
  }

  render() {
    var rendered = ''
    for (var i = 0; i < this._deoptLocations.length; i++) {
      const loc = this._deoptLocations[i]
      if (this._deopts != null && this._deopts.has(loc)) {
        const infos = this._deopts.get(loc)
        rendered += this._deoptSummary(i, infos)
        rendered += this._renderDeopts(infos)
      } else if (this._ics != null && this._ics.has(loc)) {
        rendered += this._renderIcs(this._ics.get(loc))
      }
    }
    return rendered
  }

  _deoptSummary(locationIdx, infos) {
    const {
        functionName
      , file
      , line
      , column
    } = infos[0]

    const fullLoc = colors.brightBlack(`${functionName} at ${file}:${line}:${column}`)
    const locationString = colors.blue(locationIdx)
    return `(${locationString}): ${fullLoc}\n\n`
  }

  _renderDeopts(infos) {
    const headerRow = [ 'Bailout', 'Reason', 'Optimized', 'Inlined' ]
    const underlined = underlineRow(headerRow)
    const rows = [ headerRow, underlined ]

    for (const info of infos) {
      rows.push(this._deoptRow(info))
    }
    const opts = {
        stringLength: x => String(x).replace(ansiRegex(), '').length
      , align: [ 'l', 'l', 'l', 'l', 'l' ]
      , hsep: ' | '
    }

    const tbl = table(rows, opts)
    const indented = tbl.split('\n').map(x => `  ${x}`).join('\n')
    return `${indented}\n\n\n`
  }

  _deoptRow(info) {
    const {
        inlined
      , bailoutType
      , deoptReason
      , optimizationState
      , severity
    } = info
    /*
    { timestamp: 785328,
        functionName: 'addObjects',
        file: '../examples/adders.js',
        line: 137,
        column: 28,
        inlined: false,
        bailoutType: 'eager',
        deoptReason: 'wrong call target',
        optimizationState: 'optimized',
        severity: 3 }
      */
    const bailoutString = severityColors[severity - 1](bailoutType)
    const optimizationStateString = colors.brightBlack(optimizationState)
    const inlinedString = colors.brightBlack(inlined)
    return [
        bailoutString
      , deoptReason
      , optimizationStateString
      , inlinedString
    ]
  }
}

if (!module.parent && typeof window === 'undefined') {
(async () => {
  const resolveFiles = require('./resolve-files')
  const mapByFile = require('./map-by-file')
  const groupByLocation = require('./group-by-location')
  const path = require('path')
  const fs = require('fs')

  const ThemeTerminal = require('./theme.terminal')
  const MarkerResolver = require('./marker-resolver')
  const { highlight } = require('cardinal')

  try {
    const data = require('../results/v8.log.json')
    const root = path.join(__dirname, '..', '..', 'v8-ic-processor', 'tmp')
    const resolved = await resolveFiles({ data, root })
    const byFile = mapByFile(resolved)
    const { ics, deopts, icLocations, deoptLocations } =
      groupByLocation(byFile).get('../examples/adders.js')

    const code = fs.readFileSync(path.join(__dirname, '..', '..', 'v8-ic-processor', 'examples', 'adders.js'), 'utf8')
    const markerResolver = new MarkerResolver({
        deopts
      , deoptLocations
      , ics
      , icLocations
      , isterminal: true
    })
    const theme = new ThemeTerminal(markerResolver).theme
    const highlighted = highlight(code, { theme, linenos: true })

    const summaryRenderer = new SummaryRenderer({ deopts, deoptLocations })
    const rendered = summaryRenderer.render()

    console.log(highlighted + '\n\n')
    console.log(rendered)
  } catch (err) {
    console.error(err)
  }
})()
}

