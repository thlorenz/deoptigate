'use strict'

const escapeRegex = require('escape-string-regexp')
const fs = require('fs')
const path = require('path')
const test = require('tape')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const { deoptigateLog } = require('../deoptigate.log')

function repoRoot(...args) {
  return path.join(__dirname, '..', ...args)
}

/**
 * Replace the temporary paths to source files with the real path
 * to the source files
 * @param {string} srcLog The path to the log file to prepare
 * @param {string[][]} replacements An array of [template, realPath]
 */
async function prepareLogFile(srcLog, replacements) {
  let contents = await readFile(srcLog, 'utf8')

  // Windows + Git shenanigans
  contents = contents.replace(/\r\n/g, '\n');
  for (const [template, realPath] of replacements) {
    contents = contents.replace(
      new RegExp(escapeRegex(template), 'g'),
      realPath
    )
  }

  const destLog = srcLog.replace(/\.v8\.log$/g, '.prepared.v8.log')
  await writeFile(destLog, contents, 'utf8')
  return destLog
}

test('adders.v8.log', async (t) => {
  t.plan(8)

  const replacements = [
    [
      '/tmp/deoptigate/examples/simple/adders.js',
      repoRoot('examples/simple/adders.js'),
    ],
  ]
  const addersSrcFile = replacements[0][1]
  const srcLogPath = path.join(__dirname, 'logs', 'adders.v8.log')
  const destLogPath = await prepareLogFile(srcLogPath, replacements)

  const result = await deoptigateLog(destLogPath)
  t.equal(result.size, 1, 'number of files')

  const fileData = result.get(addersSrcFile)
  t.equal(fileData.fullPath, addersSrcFile, 'fullPath')
  t.equal(fileData.ics.size, 33, 'number of ics')
  t.equal(fileData.deopts.size, 7, 'number of deopts')
  t.equal(fileData.codes.size, 16, 'number of codes')

  const deoptLocation = fileData.deoptLocations[0]
  t.equal(deoptLocation, 'addAny:93:27', 'first deoptLocation')

  const deoptData = fileData.deopts.get(deoptLocation)
  t.equal(deoptData.file, addersSrcFile, 'deopt file path')

  const updateData = deoptData.updates[2]
  t.equal(updateData.bailoutType, 'eager', 'deopt update bailout type')
})

test('two-modules.v8.log', async (t) => {
  t.plan(8)

  const replacements = [
    [
      '/tmp/deoptigate/examples/two-modules/adders.js',
      repoRoot('examples/two-modules/adders.js'),
    ],
    [
      '/tmp/deoptigate/examples/two-modules/objects.js',
      repoRoot('examples/two-modules/objects.js'),
    ],
  ]

  const srcFile = replacements[1][1]
  const srcLogPath = path.join(__dirname, 'logs', 'two-modules.v8.log')
  const destLogPath = await prepareLogFile(srcLogPath, replacements)

  const result = await deoptigateLog(destLogPath)
  t.equal(result.size, 2, 'number of files')

  const fileData = result.get(srcFile)
  t.equal(fileData.fullPath, srcFile, 'fullPath')
  t.equal(fileData.ics.size, 25, 'number of ics')
  t.equal(fileData.deopts.size, 0, 'number of deopts')
  t.equal(fileData.codes.size, 8, 'number of codes')

  const icLocation = fileData.icLocations[0]
  t.equal(icLocation, 'Object1:3:12', 'first icLocation')

  const icData = fileData.ics.get(icLocation)
  t.equal(icData.file, srcFile, 'ics file path')

  const updateData = icData.updates[0]
  t.equal(updateData.map, '37cdf3b7a811', 'ics update map')
})
