'use strict'

const { highestSeverity } = require('../severities')
const SEVERITY_2_FACTOR = 10
const SEVERITY_3_FACTOR = 30

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
      icSeverities[1]
    + icSeverities[2] * SEVERITY_2_FACTOR
    + icSeverities[3] * SEVERITY_3_FACTOR
    + deoptSeverities[1]
    + deoptSeverities[2] * SEVERITY_2_FACTOR
    + deoptSeverities[3] * SEVERITY_3_FACTOR
  )
  const hasCriticalSeverities = (
       icSeverities[2] > 0
    || icSeverities[3] > 0
    || deoptSeverities[2] > 0
    || deoptSeverities[3] > 0
  )
  return {
      icSeverities
    , deoptSeverities
    , severityScore
    , hasCriticalSeverities
  }
}

module.exports = summarizeFile
