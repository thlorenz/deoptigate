'use strict'

const { Profile } = require('v8-tools-core/profile')

function parseOptimizationState(s) {
  switch (s) {
    case '':
      return Profile.CodeState.COMPILED
    case '~':
      return Profile.CodeState.OPTIMIZABLE
    case '*':
      return Profile.CodeState.OPTIMIZED
    default:
      throw new Error('unknown code state: ' + s)
  }
}

function nameOptimizationState(state) {
  switch (state) {
    case Profile.CodeState.COMPILED:
      return 'compiled'
    case Profile.CodeState.OPTIMIZABLE:
      return 'optimizable'
    case Profile.CodeState.OPTIMIZED:
      return 'optimized'
    case -1:
      return 'unknown'
    default:
      throw new Error('unknown code state: ' + state)
  }
}

function severityOfOptimizationState(state) {
  switch (state) {
    case Profile.CodeState.COMPILED:
      return 3
    case Profile.CodeState.OPTIMIZABLE:
      return 2
    case Profile.CodeState.OPTIMIZED:
      return 1
    case -1:
      return 3
    default:
      throw new Error('unknown code state: ' + state)
  }
}

module.exports = {
  parseOptimizationState,
  nameOptimizationState,
  severityOfOptimizationState,
}
