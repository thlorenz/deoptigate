'use strict'

const severityColors = [
    'green'
  , 'blue'
  , 'dark-red'
]

const MIN_SEVERITY = 1
function highestSeverity(infos) {
  return infos.reduce(
      (highest, { severity }) => severity > highest ? severity : highest
    , MIN_SEVERITY
  )
}

function lowestSeverity(infos) {
  return infos.reduce(
      (lowest, { severity }) => severity < lowest ? severity : lowest
    , 99
  )
}

module.exports = {
    severityColors
  , MIN_SEVERITY
  , highestSeverity
  , lowestSeverity
}
