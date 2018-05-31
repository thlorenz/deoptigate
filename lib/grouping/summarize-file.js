'use strict'

const { highestSeverity } = require('../severities')

function summarizeFile({ ics, deopts }) {
  const icSeverities = [ 0, 0, 0, 0 ]
  const deoptSeverities = [ 0, 0, 0, 0 ]
  for (const infos of ics.values()) {
    const hs = highestSeverity(infos)
    icSeverities[hs]++
  }
  for (const infos of deopts.values()) {
    const hs = highestSeverity(infos)
    deoptSeverities[hs]++
  }
  const severityScore = (
      icSeverities[1] + icSeverities[2] * 3
    + deoptSeverities[1] + deoptSeverities[2] * 3
  )
  return { icSeverities, deoptSeverities, severityScore }
}

module.exports = summarizeFile
