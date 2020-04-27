'use strict'

const { MIN_SEVERITY } = require('../severities')

const UNINITIALIZED = 0
const PREMONOMORPHIC = 1
const MONOMORPHIC = 2
const RECOMPUTE_HANDLER = 3
const POLYMORPHIC = 4
const MEGAMORPHIC = 5
const GENERIC = 6

function parseIcState(s) {
  switch (s) {
    case '0':
      return UNINITIALIZED
    case '.':
      return PREMONOMORPHIC
    case '1':
      return MONOMORPHIC
    case '^':
      return RECOMPUTE_HANDLER
    case 'P':
      return POLYMORPHIC
    case 'N':
      return MEGAMORPHIC
    case 'G':
      return GENERIC
    default:
      throw new Error('parse: unknown ic code state: ' + s)
  }
}

function nameIcState(state) {
  switch (state) {
    case UNINITIALIZED:
      return 'unintialized'
    case PREMONOMORPHIC:
      return 'premonomorphic'
    case MONOMORPHIC:
      return 'monomorphic'
    case RECOMPUTE_HANDLER:
      return 'recompute handler'
    case POLYMORPHIC:
      return 'polymorphic'
    case MEGAMORPHIC:
      return 'megamorphic'
    case GENERIC:
      return 'generic'
    default:
      throw new Error('name: unknown ic code state : ' + state)
  }
}

function severityIcState(state) {
  switch (state) {
    case UNINITIALIZED:
      return MIN_SEVERITY
    case PREMONOMORPHIC:
      return MIN_SEVERITY
    case MONOMORPHIC:
      return MIN_SEVERITY
    case RECOMPUTE_HANDLER:
      return MIN_SEVERITY
    case POLYMORPHIC:
      return MIN_SEVERITY + 1
    case MEGAMORPHIC:
      return MIN_SEVERITY + 2
    case GENERIC:
      return MIN_SEVERITY + 2
    default:
      throw new Error('severity: unknown ic code state : ' + state)
  }
}

module.exports = {
  parseIcState,
  nameIcState,
  severityIcState,
}
