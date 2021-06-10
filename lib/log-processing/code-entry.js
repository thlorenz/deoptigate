'use strict'

const { severityOfOptimizationState }  = require('./optimization-state')

function normalizeFile(file) {
  // When tracing from the browser, additional filename formats need to be handled:
  //  - Web servers will have a format like: http://localhost:8000/app.js (needs to be just app.js)
  //  - Files from Windows something like: file:///C:/temp/app.js (needs to be just /temp/app.js)
  //  - Files from Linux something like: file:///home/bill/app.js (needs to be just /home/bill/app.js)
  const webPrefix = /((https?:\/\/[^\/]*\/)|(file:\/\/\/[a-zA-Z]:)|(file:\/\/))/
  file = file.replace(webPrefix, "")

  // Location includes :line:column to the end. Note that browser traces include
  // psuedo-filenames like "extensions::SafeBuiltins", so only consider the last
  // two colons for a match.
  const re = /(.*):([0-9]+):([0-9]+)$/
  const array = re.exec(file)
  if (!array) return file
  return array[1]
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
