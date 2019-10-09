'use strict'

/* eslint-disable camelcase */

const { MIN_SEVERITY } = require('../severities')
const parseSourcePosition = require('./source-position')

const SOFT = MIN_SEVERITY
const LAZY = MIN_SEVERITY + 1
const EAGER = MIN_SEVERITY + 2

const sourcePositionRx = /^<(.+?)>(?: inlined at <(.+?)>)?$/;

function getSeverity(bailoutType) {
  switch (bailoutType) {
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
      fnFile
    , file
    , line
    , column
  ) {
    const parts = fnFile.split(' ')
    const functionName = parts[0]

    this.functionName = functionName
    this.file = file
    this.line = line
    this.column = column

    this.updates = []
  }

  addUpdate(timestamp, bailoutType, deoptReason, optimizationState, inliningId) {
    bailoutType = unquote(bailoutType)
    deoptReason = unquote(deoptReason)

    const inlined = inliningId !== -1
    const severity = getSeverity(bailoutType)

    this.updates.push({
        timestamp
      , bailoutType
      , deoptReason
      , optimizationState
      , inlined
      , severity
    })
  }

  get hashmap() {
    return {
        functionName : this.functionName
      , file         : this.file
      , line         : this.line
      , column       : this.column
      , updates      : this.updates
    }
  }

  static disassembleSourcePosition(sourcePosition) {
    const m = sourcePositionRx.exec(sourcePosition);
    if (m) {
      const source = parseSourcePosition(m[1]);
      if (m[2]) {
        source.inlinedAt = parseSourcePosition(m[2]);
      }
      return source;
    }
    return parseSourcePosition(sourcePosition)
  }
}

module.exports = DeoptEntry
