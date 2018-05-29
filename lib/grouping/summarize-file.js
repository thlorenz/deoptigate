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
  return { icSeverities, deoptSeverities }
}

module.exports = summarizeFile
