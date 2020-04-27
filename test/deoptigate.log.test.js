'use strict'

const path = require('path')
const test = require('tape')

const { deoptigateLog } = require('../deoptigate.log')

test('adders.v8.log', async (t) => {
  const addersSrcFile = '/tmp/deoptigate/examples/simple/adders.js'

  const logPath = path.join(__dirname, 'logs', 'adders.v8.log')
  const result = await deoptigateLog(logPath)
  const fileData = result.get(addersSrcFile)
  const deoptLocation = fileData.deoptLocations[0]
  const deoptData = fileData.deopts.get(deoptLocation)
  const updateData = deoptData.updates[2]

  t.plan(8)
  t.equal(result.size, 1, 'number of files')
  t.equal(fileData.fullPath, addersSrcFile, 'fullPath')
  t.equal(fileData.ics.size, 33, 'number of ics')
  t.equal(fileData.deopts.size, 7, 'number of deopts')
  t.equal(fileData.codes.size, 16, 'number of codes')
  t.equal(deoptLocation, 'addAny:93:27', 'first deoptLocation')
  t.equal(deoptData.file, addersSrcFile, 'deopt file path')
  t.equal(updateData.bailoutType, 'eager', 'deopt update bailout type')
})

test('two-modules.v8.log', async (t) => {
  const twoModulesSrcFiles = [
    '/tmp/deoptigate/examples/two-modules/adders.js',
    '/tmp/deoptigate/examples/two-modules/objects.js',
  ]

  const logPath = path.join(__dirname, 'logs', 'two-modules.v8.log')
  const result = await deoptigateLog(logPath)
  const fileData = result.get(twoModulesSrcFiles[1])
  const icLocation = fileData.icLocations[0]
  const icData = fileData.ics.get(icLocation)
  const updateData = icData.updates[0]

  t.plan(8)
  t.equal(result.size, 2, 'number of files')
  t.equal(fileData.fullPath, twoModulesSrcFiles[1], 'fullPath')
  t.equal(fileData.ics.size, 25, 'number of ics')
  t.equal(fileData.deopts.size, 0, 'number of deopts')
  t.equal(fileData.codes.size, 8, 'number of codes')
  t.equal(icLocation, 'Object1:3:12', 'first icLocation')
  t.equal(icData.file, twoModulesSrcFiles[1], 'ics file path')
  t.equal(updateData.map, '37cdf3b7a811', 'ics update map')
})
