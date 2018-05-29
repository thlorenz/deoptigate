'use strict'

const colors = require('ansicolors')
const ansiRegex = require('ansi-regex')

function ansiRemovedLength(s) {
  return String(s).replace(ansiRegex(), '').length
}

function underlineString(x, underliner = '-', stringLength = ansiRemovedLength) {
  return underliner.repeat(stringLength(x))
}

function underlineRow(headerRow) {
  return headerRow.map(x => underlineString(x))
}

function mainHeader(s) {
  const underline = underlineString(s, '=')
  return colors.blue(`${s}\n${underline}`)
}

module.exports = {
    ansiRemovedLength
  , underlineString
  , underlineRow
  , mainHeader
}
