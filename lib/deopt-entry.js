'use strict'

/* eslint-disable camelcase */

const { nameOptimizationState, prefixesName } = require('./optimization-state')

// <../examples/adders.js:93:27
const sourcePositionRx = /[<]([^:]+):(\d+):(\d+)[>]/

function safeToInt(x) {
  if (x == null) return 0
  return parseInt(x)
}

function disassembleSourcePosition(sourcePosition) {
  const m = sourcePositionRx.exec(sourcePosition)
  if (m == null) return { file: null, line: 0, column: 0 }
  return { file: m[1], line: safeToInt(m[2]), column: safeToInt(m[3]) }
}

const SOFT = 1
const LAZY = 2
const EAGER = 3

function severity(deoptReason) {
  switch (deoptReason) {
    case 'soft': return SOFT
    case 'lazy': return LAZY
    case 'eager': return EAGER
  }
}

function unquote(s) {
  // for some reason Node.js double quotes the string, i.e. ""eager""
  return s.replace(/^"/, '').replace(/"$/, '')
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
    this.bailoutType = unquote(bailoutType)
    this.deoptReason = unquote(deoptReasonText)
    this.optimizationState = optimizationState
    this.severity = severity(this.bailoutType)
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
      , severity          : this.severity
    }
  }
}

module.exports = DeoptEntry
