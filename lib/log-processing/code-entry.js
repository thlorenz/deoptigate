'use strict'

const { severityOfOptimizationState }  = require('./optimization-state')
const parseSourcePosition = require('./source-position')

function normalizeFile(file) {
  // Node.js adds :line:column to the end
  return parseSourcePosition(file).file
}

class CodeEntry {
  constructor({ fnFile, line, column, isScript }) {
    const parts = fnFile.split(' ')
    this._functionName = parts[0]
    this._file = normalizeFile(parts[1])
    this._line = line
    this._column = column
    this._isScript = isScript

    this.updates = []
  }

  addUpdate(timestamp, state) {
    const severity = severityOfOptimizationState(state)
    this.updates.push({ timestamp, state, severity })
  }

  get hashmap() {
    return {
        functionName: this._functionName
      , file: this._file
      , line: this._line
      , column: this._column
      , isScript: this._isScript
      , updates: this.updates
    }
  }
}

module.exports = CodeEntry
