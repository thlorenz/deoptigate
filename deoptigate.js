'use strict'

/* eslint-disable camelcase */

const LogReader = require('v8-tools-core/logreader')
const { Profile } = require('v8-tools-core/profile')
const { highlight } = require('cardinal')

const IcEntry = require('./lib/log-processing/ic-entry')
const DeoptEntry = require('./lib/log-processing/deopt-entry')
const CodeEntry = require('./lib/log-processing/code-entry')
const { parseOptimizationState } = require('./lib/log-processing/optimization-state')

const groupByFileAndLocation = require('./lib/grouping/group-by-file-and-location')

const Theme = require('./lib/rendering/theme.terminal')
const SummaryRenderer = require('./lib/rendering/render-summary.terminal')
const MarkerResolver = require('./lib/rendering/marker-resolver')

function maybeNumber(s) {
  if (s == null) return -1
  return parseInt(s)
}

function formatName(entry) {
  if (!entry) return '<unknown>'
  const name = entry.func.getName()
  const re = /(.*):([0-9]+):([0-9]+)$/
  const array = re.exec(name)
  if (!array) return { fnFile: name, line: -1, column: -1 }
  return {
      fnFile: array[1]
    , line: maybeNumber(array[2])
    , column: maybeNumber(array[3])
  }
}

function locationKey(file, line, column) {
  return `${file}:${line}:${column}`
}

const propertyICParser = [
  parseInt, parseInt, parseInt, null, null, parseInt, null, null, null
]

class DeoptProcessor extends LogReader {
  constructor(root, { silentErrors = true } = {}) {
    super()
    this._root = root
    this._silentErrors = silentErrors

    // pasing dispatch table that references `this` before invoking super
    // doesn't work, so we set it afterwards
    this.dispatchTable_ = {

        // Collect info about CRUD of code
        'code-creation': {
            parsers: [
              null, parseInt, parseInt, parseInt, parseInt, null, 'var-args'
            ]
          , processor: this._processCodeCreation.bind(this)
        }
      , 'code-move': {
            parsers: [ parseInt, parseInt ]
          , processor: this._processCodeMove.bind(this)
        }
      , 'code-delete': {
            parsers: [ parseInt ]
          , processor: this._processCodeDelete.bind(this)
        }
      , 'sfi-move': {
            parsers: [ parseInt, parseInt ]
          , processor: this._processFunctionMove.bind(this)
        }

      // Collect deoptimization info
      , 'code-deopt': {
            parsers: [
              parseInt, parseInt, parseInt, parseInt, parseInt, null, null, null
            ]
          , processor: this._processCodeDeopt.bind(this)
        }

      // Collect IC info
      , 'LoadIC': {
            parsers : propertyICParser
          , processor: this._processPropertyIC.bind(this, 'LoadIC')
        }
      , 'StoreIC': {
            parsers : propertyICParser
          , processor: this._processPropertyIC.bind(this, 'StoreIC')
        }
      , 'KeyedLoadIC': {
            parsers : propertyICParser
          , processor: this._processPropertyIC.bind(this, 'KeyedLoadIC')
        }
      , 'KeyedStoreIC': {
            parsers : propertyICParser
          , processor: this._processPropertyIC.bind(this, 'KeyedStoreIC')
        }
      , 'StoreInArrayLiteralIC': {
            parsers : propertyICParser
          , processor: this._processPropertyIC.bind(this, 'StoreInArrayLiteralIC')
        }
    }

    this._deserializedEntriesNames = []
    this._profile = new Profile()

    this.entriesIC = new Map()
    this.entriesDeopt = new Map()
    this.entriesCode = new Map()
  }

  functionInfo(pc) {
    const entry = this._profile.findEntry(pc)
    if (entry == null) return { fnFile: '', state: -1 }
    const { fnFile, line, column } = formatName(entry)
    return { fnFile, line, column, state: entry.state }
  }

  _processPropertyIC(
      type
    , pc
    , line
    , column
    , old_state
    , new_state
    , map
    , propertyKey
    , modifier
    , slow_reason
  ) {
    const { fnFile, state } = this.functionInfo(pc)
    const key = locationKey(fnFile, line, column)
    if (!this.entriesIC.has(key)) {
      const entry = new IcEntry(fnFile, line, column)
      this.entriesIC.set(key, entry)
    }
    const icEntry = this.entriesIC.get(key)
    icEntry.addUpdate(type, old_state, new_state, propertyKey, map, state)
  }

  // timestamp is in micro seconds
  // https://cs.chromium.org/chromium/src/v8/src/log.cc?l=892&rcl=8fecf0eff7357c1bee222f76c4e2f6fdd8759797
  _processCodeDeopt(
      timestamp
    , size
    , code
    , inliningId
    , scriptOffset
    , bailoutType
    , sourcePositionText
    , deoptReasonText
  ) {
    const { fnFile, state } = this.functionInfo(code)
    const { file, line, column } = DeoptEntry.disassembleSourcePosition(sourcePositionText)

    const key = locationKey(file, line, column)
    if (!this.entriesDeopt.has(key)) {
      const entry = new DeoptEntry(fnFile, file, line, column)
      this.entriesDeopt.set(key, entry)
    }
    const deoptEntry = this.entriesDeopt.get(key)
    deoptEntry.addUpdate(timestamp, bailoutType, deoptReasonText, state, inliningId)
  }

  _processCodeCreation(
    type, kind, timestamp, start, size, name, maybe_func
  ) {
    name = this._deserializedEntriesNames[start] || name

    if (maybe_func.length) {
      const funcAddr = parseInt(maybe_func[0])
      const state = parseOptimizationState(maybe_func[1])
      this._profile.addFuncCode(
        type, name, timestamp, start, size, funcAddr, state
      )
      const isScript = type === 'Script'
      const isUserFunction = type === 'LazyCompile'
      if (isUserFunction || isScript) {
        let { fnFile, line, column } = this.functionInfo(start)

        // only interested in Node.js anonymous wrapper function
        // (function (exports, require, module, __filename, __dirname) {
        const isNodeWrapperFunction = (line === 1 && column === 1)
        if (isScript && !isNodeWrapperFunction) return

        const key = locationKey(fnFile, line, column)
        if (!this.entriesCode.has(key)) {
          this.entriesCode.set(key, new CodeEntry({ fnFile, line, column, isScript }))
        }
        const code = this.entriesCode.get(key)
        code.addUpdate(timestamp, state)
      }
    } else {
      this._profile.addCode(type, name, timestamp, start, size)
    }
  }

  _processCodeMove(from, to) {
    this._profile.moveCode(from, to)
  }

  _processCodeDelete(start) {
    this._profile.deleteCode(start)
  }

  _processFunctionMove(from, to) {
    this._profile.moveFunc(from, to)
  }

  // @override
  printError(msg) {
    if (this._silentErrors) return
    console.trace()
    console.error(msg)
  }

  processString(string) {
    var end = string.length
    var current = 0
    var next = 0
    var line
    while (current < end) {
      next = string.indexOf('\n', current)
      if (next === -1) break
      line = string.substring(current, next)
      current = next + 1
      this.processLogLine(line)
    }
  }

  filterIcStateChanges() {
    for (const entry of this.entriesIC.values()) {
      entry.filterIcStateChanges()
    }
  }

  toObject() {
    const ics = []
    for (const entry of this.entriesIC.values()) {
      ics.push(entry.hashmap)
    }
    const deopts = []
    for (const entry of this.entriesDeopt.values()) {
      deopts.push(entry.hashmap)
    }
    const codes = []
    for (const entry of this.entriesCode.values()) {
      codes.push(entry.hashmap)
    }
    return { ics, deopts, codes, root: this._root }
  }

  toJSON(indent = 2) {
    return JSON.stringify(this.toObject(), null, indent)
  }
}

function processLogContent(txt, root) {
  const deoptProcessor = new DeoptProcessor(root)
  deoptProcessor.processString(txt)
  deoptProcessor.filterIcStateChanges()

  return deoptProcessor
}

function deoptigate(groupedByFile) {
  const groupedByFileAndLocation = groupByFileAndLocation(groupedByFile)
  return groupedByFileAndLocation
}

function render({ files, groups }, {
    isterminal = true
  , deoptsOnly = true
  , filerFilter = null
} = {}) {
  const results = []
  for (const [ file, info ] of groups) {
    let { ics, deopts, icLocations, deoptLocations } = info
    if (deoptsOnly) {
      ics = null
      icLocations = null
    }
    const code = files.get(file).src
    const markerResolver = new MarkerResolver({
        deopts
      , deoptLocations
      , ics
      , icLocations
      , isterminal
    })
    const summaryRenderer = new SummaryRenderer({
        deopts
      , deoptLocations
      , ics
      , icLocations
    })
    const theme = new Theme(markerResolver).theme
    const highlightedCode = highlight(code, { theme, linenos: true })
    const summary = summaryRenderer.render()

    results.push({ file, highlightedCode, summary })
  }
  return results
}

module.exports = {
    processLogContent
  , render
  , deoptigate
}
