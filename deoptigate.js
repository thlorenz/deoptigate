'use strict'

/* eslint-disable camelcase */

const { promisify } = require('util')
const fs = require('fs')
const readFile = promisify(fs.readFile)

const IcProcessor  = require('v8-ic-processor')

class Entry {
  constructor(
      type
    , fn_file
    , line
    , column
    , key
    , oldState
    , newState
    , map
    , reason
    , additional
  ) {
    this.type = type

    const parts = fn_file.split(' ')
    this.functionName = parts[0]
    this.file = parts[1]
    this.line = line
    this.column = column

    this.oldState = oldState
    this.newState = newState

    this.key = key
    this.map = map.toString(16)
    this.reason = reason
    this.additional = additional
  }

  get category() {
    if (this.type.indexOf('Store') !== -1) {
      return 'Store'
    } else if (this.type.indexOf('Load') !== -1) {
      return 'Load'
    } else {
      return 'other'
    }
  }

  get hashmap() {
    return {
        functionName : this.functionName
      , file         : this.file
      , line         : this.line
      , column       : this.column
      , oldState     : this.oldState
      , newState     : this.newState
      , key          : this.key
      , map          : this.map
      , reason       : this.reason
      , additional   : this.additional
    }
  }
}

class DeoptIcProcessor extends IcProcessor {
  constructor() {
    super()
    this.entries = []
  }

  functionName(pc) {
    let entry = this.profile_.findEntry(pc)
    return this.formatName(entry)
  }

  processPropertyIC(
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
    const fnName = this.functionName(pc)
    this.entries.push(
      new Entry(
          type
        , fnName
        , line
        , column
        , key
        , old_state
        , new_state
        , map
        , slow_reason
      )
    )
  }

  filterStateChanges() {
    const entriesChangingState = []
    for (const entry of this.entries) {
      if (entry.oldState !== entry.newState) {
        entriesChangingState.push(entry)
      }
    }
    this.entries = entriesChangingState
  }

  toJSON(indent = 2) {
    const acc = []
    for (const entry of this.entries) {
      acc.push(entry.hashmap)
    }
    return JSON.stringify(acc, null, indent)
  }
}

function processLogContent(txt) {
  const icProcessor = new DeoptIcProcessor()
  icProcessor.processString(txt)
  return icProcessor
}

async function processLog(p, { stateChangesOnly = true } = {}) {
  const txt = await readFile(p, 'utf8')
  const processed = processLogContent(txt)
  if (stateChangesOnly) processed.filterStateChanges()
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
    const v8log = path.join(__dirname, '..', 'v8-ic-processor', 'tmp', 'v8.log')
    const processed = await processLog(v8log)
    console.log(processed.toJSON())
  } catch (err) {
    console.error(err)
  }
})()
}
