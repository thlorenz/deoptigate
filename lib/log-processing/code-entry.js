'use strict'

function normalizeFile(file) {
  // Node.js adds :line:column to the end
  return file.split(':')[0]
}

class CodeEntry {
  constructor({ fnFile, line, column }) {
    const parts = fnFile.split(' ')
    this._functionName = parts[0]
    this._file = normalizeFile(parts[1])
    this._line = line
    this._column = column
    this.updates = []
  }

  addUpdate(timestamp, state) {
    this.updates.push({ timestamp, state })
  }

  get hashmap() {
    return {
        functionName: this._functionName
      , file: this._file
      , line: this._line
      , column: this._column
      , updates: this.updates
    }
  }
}

module.exports = CodeEntry
