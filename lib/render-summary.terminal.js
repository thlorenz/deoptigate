'use strict'

const colors = require('ansicolors')
const ansiRegex = require('ansi-regex')
const table = require('text-table')
const { severityColors } = require('./severities')
const { nameIcState, severityIcState } = require('./ic-state')
const assert = require('assert')

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

class TerminalSummaryRenderer {
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
    if (severity == null) debugger
    const bailoutString = severityColors[severity - 1](bailoutType)
    const timestampString = (timestamp > 0
      ? colors.brightBlack(`${(timestamp / 1E3).toFixed()}ms`)
      : 'n/a'
    )
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

module.exports = TerminalSummaryRenderer
