'use strict'

const { spawn } = require('ispawn')
const { tmpdir } = require('os')
const fs = require('fs')
const { F_OK } = fs.constants
const { promisify } = require('util')
const access = promisify(fs.access)
const mkdir = promisify(fs.mkdir)
const stat = promisify(fs.stat)

const { brightBlack } = require('ansicolors')

function determineArgs(args) {
  const __index = args.indexOf('--')
  if (__index < 0) {
    return { argv: args, extraExecArgv: [] }
  }
  // For now we ignore any args before the -- as those would be for deoptigate
  // At this point deoptigate doesn't consume any flags
  const afterDashes = args.slice(__index + 1)

  const first = afterDashes[0]
  if (first == null) return { execArgv: [] }

  if (first[0] === '-') {
    throw Error(
      `The node binary must immediately follow the double dash (--)
  deoptigate -- node [nodeFlags] script.js [scriptFlags]
    `)
  }
  const afterDashesArgs = afterDashes.slice(1)

  // Piece together execArgv and argv in cases as
  // deoptigate -- node --allow-natives-syntax app.js --log
  // to be: [ --allow-natives-syntax ] and [ app.js, --log ]
  // Not super important as ispawn concatentates them anyways, but for correctness
  const extraExecArgv = []
  const argv = []
  let sawApp = false

  for (const arg of afterDashesArgs) {
    if (sawApp) argv.push(arg)
    if (!arg.startsWith('-')) {
      sawApp = true
      argv.push(arg)
      continue
    }
    extraExecArgv.push(arg)
  }

  return (
    first === 'node'
    ? { argv, extraExecArgv }
    : { argv, extraExecArgv, nodeExecutable: first }
  )
}

async function createDirIfMissing(dir) {
  // assumes that parent dir exists for our use case
  try {
    await access(dir, F_OK)
  } catch (err) {
    // didn't exist (or at least we don't have access), try to create it
    return mkdir(dir)
  }

  // It did exist, ensure it is a directory
  const statInfo = await stat(dir)
  if (!statInfo.isDirectory()) {
    throw new Error(`Found ${dir}, but it wasn't a directory, please remove it.`)
  }
}

async function createLog(args, head, simpleHead) {
  const { extraExecArgv, argv,  nodeExecutable } = determineArgs(args)

  const logDir = `${tmpdir()}/deoptigate`
  await createDirIfMissing(logDir)

  const logFile = `${tmpdir()}/deoptigate/v8.log`

  const execArgv = [
      '--trace-ic'
    , `--logfile=${logFile}`
    , '--no-logfile-per-isolate'
  ].concat(extraExecArgv)

  const spawnArgs = { execArgv, argv }
  if (nodeExecutable != null) spawnArgs.node = nodeExecutable

  const { termination } = spawn(spawnArgs)
  const code = await termination
  const terminationMsg = (code == null
    ? 'process was interrupted'
    : 'process completed with code ' + code
  )
  console.log(`\n${head} ${brightBlack(terminationMsg)}`)
  console.log(`${simpleHead} ${brightBlack('logfile written to ' + logFile)}`)
  return logFile
}

module.exports = createLog
