'use strict'

/* eslint-disable camelcase */

const { promisify } = require('util')
const fs = require('fs')
const readFile = promisify(fs.readFile)

const IcEntry = require('./lib/ic-entry')
const DeoptEntry = require('./lib/deopt-entry')
const LogReader = require('v8-tools-core/logreader')
const { Profile } = require('v8-tools-core/profile')
const { parseOptimizationState } = require('./lib/optimization-state')

function formatName(entry) {
  if (!entry) return '<unknown>'
  const name = entry.func.getName()
  const re = /(.*):[0-9]+:[0-9]+$/
  const array = re.exec(name)
  if (!array) return name
  return entry.getState() + array[1]
}

const propertyICParser = [
  parseInt, parseInt, parseInt, null, null, parseInt, null, null, null
]

class DeoptProcessor extends LogReader {
  constructor() {
    super()
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

    this.entriesIC = []
    this.entriesDeopt = []
  }

  functionInfo(pc) {
    const entry = this._profile.findEntry(pc)
    if (entry == null) return { fnFile: '', state: -1 }
    const fnFile = formatName(entry)
    return { fnFile, state: entry.state }
  }

  _processPropertyIC(
      type
    , pc
    , line
    , column
    , old_state
    , new_state
    , map
    , key
    , modifier
    , slow_reason
  ) {
    const { fnFile, state } = this.functionInfo(pc)
    this.entriesIC.push(
      new IcEntry(
          type
        , fnFile
        , line
        , column
        , key
        , old_state
        , new_state
        , map
        , slow_reason
        , state
      )
    )
  }

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
    this.entriesDeopt.push(
      new DeoptEntry(
          timestamp
        , fnFile
        , inliningId
        , sourcePositionText
        , bailoutType
        , deoptReasonText
        , state
      )
    )
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
    console.trace()
    console.error(msg)
  }

  filterIcStateChanges() {
    const entriesICChangingState = []
    for (const entry of this.entriesIC) {
      if (entry.oldState !== entry.newState) {
        entriesICChangingState.push(entry)
      }
    }
    this.entriesIC = entriesICChangingState
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

  toJSON(indent = 2) {
    const ics = []
    for (const entry of this.entriesIC) {
      ics.push(entry.hashmap)
    }
    const deopts = []
    for (const entry of this.entriesDeopt) {
      deopts.push(entry.hashmap)
    }
    return JSON.stringify({ ics, deopts }, null, indent)
  }
}

function processLogContent(txt) {
  const deoptProcessor = new DeoptProcessor()
  deoptProcessor.processString(txt)
  return deoptProcessor
}

async function processLog(p, { stateChangesOnly = true } = {}) {
  const txt = await readFile(p, 'utf8')
  const processed = processLogContent(txt)
  if (stateChangesOnly) processed.filterIcStateChanges()
  return processed
}

// eslint-disable-next-line no-unused-vars
function inspect(obj, { depth = 5, colors = true, maxArrayLength = 10 } = {}) {
  console.error(require('util').inspect(obj, { depth, colors, maxArrayLength }))
}

// Test
if (!module.parent && typeof window === 'undefined') {
(async () => {
  try {
    const path = require('path')
    const v8log = path.join(__dirname, 'tmp', 'v8.log')
    const processed = await processLog(v8log)
    console.log(processed.toJSON())
  } catch (err) {
    console.error(err)
  }
})()
}
