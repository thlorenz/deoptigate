'use strict'

/* eslint-disable camelcase */

const { MIN_SEVERITY } = require('../severities')

// <../examples/adders.js:93:27
const sourcePositionRx = /[<]([^>]*):([0-9]+):([0-9]+)[>]$/

function normalizeFile(file) {
  // Web servers will have a prefix like: http://localhost:8000/app.js (needs to be just app.js)
  // Files from Windows something like: file:///C:/temp/app.js (needs to be just /temp/app.js)
  // Files from Linux something like: file:///home/bill/app.js (needs to be just /home/bill/app.js)
  const webPrefix = /((https?:\/\/[^\/]*\/)|(file:\/\/\/[a-zA-Z]:)|(file:\/\/))/
  file = file.replace(webPrefix, "")

  // Location includes :line:column to the end
  const re = /(.*):([0-9]+):([0-9]+)$/
  const array = re.exec(file)
  if (!array) return file
  return array[1]
}

function safeToInt(x) {
  if (x == null) return 0
  return parseInt(x)
}

const SOFT = MIN_SEVERITY
const LAZY = MIN_SEVERITY + 1
const EAGER = MIN_SEVERITY + 2

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
    const m = sourcePositionRx.exec(sourcePosition)
    if (m == null) return { file: null, line: 0, column: 0 }
    return { file: normalizeFile(m[1]), line: safeToInt(m[2]), column: safeToInt(m[3]) }
  }
}

module.exports = DeoptEntry
