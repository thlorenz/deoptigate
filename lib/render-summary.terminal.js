'use strict'

const colors = require('ansicolors')
const ansiRegex = require('ansi-regex')
const table = require('text-table')
const { severityColors } = require('./severities')
const { nameIcState, severityIcState } = require('./ic-state')
const assert = require('assert')

// eslint-disable-next-line no-unused-vars
function inspect(obj, { depth = 5, colors = true, maxArrayLength = 10 } = {}) {
  console.error(require('util').inspect(obj, { depth, colors, maxArrayLength }))
}

function underlineString(x, underliner = '-') {
  return underliner.repeat(x.length)
}

function underlineRow(headerRow) {
  return headerRow.map(x => underlineString(x))
}

function mainHeader(s) {
  const underline = underlineString(s, '=')
  return colors.blue(`${s}\n${underline}`)
}

class SummaryRenderer {
  constructor({ ics, icLocations, deopts, deoptLocations }) {
    assert(ics == null || icLocations != null, 'need to provide locations for ics')
    assert(deopts == null || deoptLocations != null, 'need to provide locations for deopts')

    this._ics = ics
    this._icLocations = icLocations
    this._deopts = deopts
    this._deoptLocations = deoptLocations
  }

  render() {
    let rendered = ''
    if (this._deopts != null) {
      rendered += mainHeader('Deoptimizations') + '\n\n'
      for (const loc of this._deoptLocations) {
        const infos = this._deopts.get(loc)
        rendered += this._summary(infos)
        rendered += this._renderDeopts(infos)
      }
    }
    if (this._ics != null) {
      rendered += mainHeader('ICs') + '\n\n'
      for (const loc of this._icLocations) {
        const infos = this._ics.get(loc)
        rendered += this._summary(infos)
        rendered += this._renderIcs(infos)
      }
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

    const fullLoc = colors.brightBlack(`${functionName} at ${file}:${line}:${column}`)
    const locationString = colors.blue(id)
    return `(${locationString}): ${fullLoc}\n\n`
  }

  _renderDeopts(infos) {
    const headerRow = [ 'Timestamp',  'Bailout', 'Reason', 'Inlined' ]
    const underlined = underlineRow(headerRow)
    const rows = [ headerRow, underlined ]

    for (const info of infos) {
      rows.push(this._deoptRow(info))
    }
    const opts = {
        stringLength: x => String(x).replace(ansiRegex(), '').length
      , align: [ 'r', 'l', 'l', 'c' ]
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
      , timestamp
      , severity
    } = info
    const bailoutString = severityColors[severity - 1](bailoutType)
    const timestampString = colors.brightBlack(`${(timestamp / 1E3).toFixed()}ms`)
    const inlinedString = colors.brightBlack(inlined)
    return [
        timestampString
      , bailoutString
      , deoptReason
      , inlinedString
    ]
  }

  _renderIcs(infos) {
    const headerRow = [ 'Old State', 'New State', 'Key', 'Map' ]
    const underlined = underlineRow(headerRow)
    const rows = [ headerRow, underlined ]

    for (const info of infos) {
      rows.push(this._icRow(info))
    }
    const opts = {
        stringLength: x => String(x).replace(ansiRegex(), '').length
      , align: [ 'l', 'l', 'l', 'l' ]
      , hsep: ' | '
    }

    const tbl = table(rows, opts)
    const indented = tbl.split('\n').map(x => `  ${x}`).join('\n')
    return `${indented}\n\n\n`
  }

  _icRow(info) {
    const {
        oldState
      , newState
      , key
      , map
    } = info

    const oldStateName = nameIcState(oldState)
    const severityOldState = severityIcState(oldState)
    const oldStateString = severityColors[severityOldState](oldStateName)

    const newStateName = nameIcState(newState)
    const severityNewState = severityIcState(newState)
    const newStateString = severityColors[severityNewState](newStateName)

    const mapString = colors.brightBlack(`0x${map}`)

    return [
        oldStateString
      , newStateString
      , key
      , mapString
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

    const summaryRenderer = new SummaryRenderer({
        deopts
      , deoptLocations
      , ics
      , icLocations
    })
    const rendered = summaryRenderer.render()

    console.log(highlighted + '\n\n')
    console.log(rendered)
  } catch (err) {
    console.error(err)
  }
})()
}

