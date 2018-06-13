'use strict'

const { highestSeverity, lowestSeverity } = require('../severities')
const SEVERITY_2_FACTOR = 10
const SEVERITY_3_FACTOR = 30

function addLastCodeState(codeStates, updates) {
  const lastState = updates[updates.length - 1].state
  codeStates[lastState]++
}

function summarizeFile({ ics, deopts, codes }) {
  const icSeverities = [ 0, 0, 0, 0 ]
  const deoptSeverities = [ 0, 0, 0, 0 ]
  const codeSeverities = [ 0, 0, 0, 0 ]
  const codeStates = [ 0, 0, 0 ]
  for (const infos of ics.values()) {
    const hs = highestSeverity(infos)
    infos.severity = hs
    icSeverities[hs]++
  }
  for (const infos of deopts.values()) {
    const hs = highestSeverity(infos)
    infos.severity = hs
    deoptSeverities[hs]++
  }
  for (const infos of codes.values()) {
    if (infos.length === 0 || infos[0] == null) continue
    const updates = infos[0].updates
    let hs = lowestSeverity(updates)
    // if there are lots of updates that means the function was optimized a lot
    // which could point to an issue
    if (updates.length > 3) hs = Math.max(hs, 3)
    deoptSeverities[hs]++
    infos.severity = hs
    addLastCodeState(codeStates, updates)
  }

  const severityScore = (
      icSeverities[1]
    + icSeverities[2] * SEVERITY_2_FACTOR
    + icSeverities[3] * SEVERITY_3_FACTOR
    + deoptSeverities[1]
    + deoptSeverities[2] * SEVERITY_2_FACTOR
    + deoptSeverities[3] * SEVERITY_3_FACTOR
    + codeSeverities[1]
    + codeSeverities[2] * SEVERITY_2_FACTOR
    + codeSeverities[3] * SEVERITY_3_FACTOR
  )
  const hasCriticalSeverities = (
       icSeverities[2] > 0
    || icSeverities[3] > 0
    || deoptSeverities[2] > 0
    || deoptSeverities[3] > 0
    || codeSeverities[2] > 0
    || codeSeverities[3] > 0
  )
  return {
      icSeverities
    , deoptSeverities
    , codeSeverities
    , codeStates
    , severityScore
    , hasCriticalSeverities
  }
}

module.exports = summarizeFile
