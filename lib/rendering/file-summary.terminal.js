'use strict'

const summarizeFile = require('../grouping/summarize-file')
const table = require('text-table')
const colors = require('ansicolors')
const { severityColors } = require('../severities')
const { underlineRow, mainHeader, ansiRemovedLength } = require('./util')

function addColor(arr) {
  return arr.map((x, idx) => {
    if (idx === 0) return x
    return x > 0 ? severityColors[idx - 1](x) : colors.brightBlack(x)
  })
}

const opts = {
    stringLength: ansiRemovedLength
  , align: [ 'l', 'c', 'c', 'c' ]
  , hsep: ' | '
}

function renderFileSummary({ file, deopts, ics }) {
  let { icSeverities, deoptSeverities } = summarizeFile({ deopts, ics })
  const headerRow = [
      colors.brightBlack(file)
    , 'Low Severity'
    , 'Medium Severity'
    , 'High Severity'
  ]
  const underlined = underlineRow(headerRow)

  deoptSeverities = addColor(deoptSeverities)
  icSeverities = addColor(icSeverities)
  deoptSeverities[0] = 'Deoptimizations'
  icSeverities[0] = 'Incline Caches'

  const rows = [ headerRow, underlined, deoptSeverities, icSeverities ]

  const tbl = table(rows, opts)
  const indented = tbl.split('\n').map(x => `  ${x}`).join('\n')
  return `${indented}\n\n\n`
}

function renderFilesSummaries(groups) {
  var s = mainHeader('Summary') + '\n\n'
  for (const [ file, info ] of groups) {
    const { ics, deopts } = info
    s += renderFileSummary({ file, deopts, ics })
  }
  return s
}

module.exports = {
    renderFileSummary
  , renderFilesSummaries
}
