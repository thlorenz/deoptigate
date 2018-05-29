'use strict'

const UNINITIALIZED = 0
const PREMONOMORPHIC = 1
const MONOMORPHIC = 2
const RECOMPUTE_HANDLER = 3
const POLYMORPHIC = 4
const MEGAMORPHIC = 5
const GENERIC = 6

function parseIcState(s) {
  switch (s) {
    case '0': return UNINITIALIZED
    case '.': return PREMONOMORPHIC
    case '1': return MONOMORPHIC
    case '^': return RECOMPUTE_HANDLER
    case 'P': return POLYMORPHIC
    case 'N': return MEGAMORPHIC
    case 'G': return GENERIC
    default: throw new Error('parse: unknown ic code state: ' + s)
  }
}

function nameIcState(state) {
  switch (state) {
    case UNINITIALIZED     : return 'unintialized'
    case PREMONOMORPHIC    : return 'premonomorphic'
    case MONOMORPHIC       : return 'monomorphic'
    case RECOMPUTE_HANDLER : return 'recompute handler'
    case POLYMORPHIC       : return 'polymorphic'
    case MEGAMORPHIC       : return 'megamorphic'
    case GENERIC           : return 'generic'
    default: throw new Error('name: unknown ic code state : ' + state)
  }
}

function severityIcState(state) {
  switch (state) {
    case UNINITIALIZED     : return 1
    case PREMONOMORPHIC    : return 1
    case MONOMORPHIC       : return 1
    case RECOMPUTE_HANDLER : return 1
    case POLYMORPHIC       : return 2
    case MEGAMORPHIC       : return 3
    case GENERIC           : return 3
    default: throw new Error('severity: unknown ic code state : ' + state)
  }
}

module.exports = {
    parseIcState
  , nameIcState
  , severityIcState
}
