'use strict'

const {
    parseIcState
  , severityIcState
} = require('./ic-state')

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

function unquote(s) {
  // for some reason Node.js double quotes the file names
  return s.replace(/^"/, '').replace(/"$/, '')
}

class IcEntry {
  constructor(
      fnFile
    , line
    , column
  ) {
    fnFile = unquote(fnFile)
    const parts = fnFile.split(' ')
    const functionName = parts[0]
    const file = normalizeFile(parts[1])

    this.functionName = functionName
    this.file = file
    this.line = line
    this.column = column
    this.updates = []
  }

  addUpdate(type, oldState, newState, key, map, optimizationState) {
    map = map.toString(16)
    oldState = parseIcState(oldState)
    newState = parseIcState(newState)
    const severity = severityIcState(newState)

    this.updates.push({
        type
      , oldState
      , newState
      , key
      , map
      , optimizationState
      , severity
    })
  }

  filterIcStateChanges() {
    this.updates = this.updates.filter(x => x.oldState !== x.newState)
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
}

module.exports = IcEntry
