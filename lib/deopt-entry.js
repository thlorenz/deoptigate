'use strict'

/* eslint-disable camelcase */

const { nameOptimizationState, prefixesName } = require('./optimization-state')

// <../examples/adders.js:93:27
const sourcePositionRx = /[<]([^:]+):(\d+):(\d+)[>]/

function disassembleSourcePosition(sourcePosition) {
  const m = sourcePositionRx.exec(sourcePosition)
  if (m == null) return { file: null, line: 0, column: 0 }
  return { file: m[1], line: m[2], column: m[3] }
}

class DeoptEntry {
  constructor(
      timestamp
    , fnFile
    , inliningId
    , sourcePositionText
    , bailoutType
    , deoptReasonText
    , state
  ) {
    const inlined = inliningId !== -1
    const { file, line, column } = disassembleSourcePosition(sourcePositionText)

    const parts = fnFile.split(' ')
    const functionName = prefixesName(state) ? parts[0].slice(1) : parts[0]
    const optimizationState = nameOptimizationState(state)

    this.timestamp = timestamp
    this.functionName = functionName
    this.file = file
    this.line = line
    this.column = column
    this.inlined = inlined
    this.bailoutType = bailoutType
    this.deoptReason = deoptReasonText
    this.optimizationState = optimizationState
  }

  get hashmap() {
    return {
        timestamp         : this.timestamp
      , functionName      : this.functionName
      , file              : this.file
      , line              : this.line
      , column            : this.column
      , inlined           : this.inlined
      , bailoutType       : this.bailoutType
      , deoptReason       : this.deoptReason
      , optimizationState : this.optimizationState
    }
  }
}

module.exports = DeoptEntry
