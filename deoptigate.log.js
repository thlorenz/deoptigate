'use strict'

const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const readFile = promisify(fs.readFile)

const { processLogContent, deoptigate } = require('./')
const resolveFiles = require('./lib/grouping/resolve-files')
const groupByFile = require('./lib/grouping/group-by-file')

async function extractDataFromLog(p, { icStateChangesOnly }) {
  const txt = await readFile(p, 'utf8')
  const root = path.dirname(p)
  const processed = processLogContent(txt, root)
  if (icStateChangesOnly) processed.filterIcStateChanges()
  return processed
}

async function processLog(p, { icStateChangesOnly = true } = {}) {
  const extracted = await extractDataFromLog(p, { icStateChangesOnly })
  const data = extracted.toObject()
  const files = await resolveFiles(data)
  const groupedByFile = groupByFile(data, files)
  return groupedByFile
}

async function logToJSON(p, { icStateChangesOnly = true } = {}) {
  const groupedByFile = await processLog(p, { icStateChangesOnly })
  return JSON.stringify(Array.from(groupedByFile), null, 2)
}

async function deoptigateLog(p, { icStateChangesOnly = true } = {}) {
  const groupedByFile = await processLog(p, { icStateChangesOnly })
  return deoptigate(groupedByFile)
}

module.exports = {
    processLog
  , logToJSON
  , deoptigateLog
}
