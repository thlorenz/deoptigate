'use strict'

function keyLocation({ functionName, line, column }) {
  // need to customize key since Objects get different key
  // per instance even if line + column are the same
  return `${functionName}:${line}:${column}`
}

function unkeyLocation(key) {
  if (key == null) return null
  const [functionName, line, column] = key.split(':')
  return { functionName, line: parseInt(line), column: parseInt(column) }
}

function byLocation(a, b) {
  if (a.line < b.line) return -1
  if (a.line > b.line) return 1
  if (a.column < b.column) return -1
  if (a.column > b.column) return 1
  return 0
}

function byLocationKey(ka, kb) {
  const a = unkeyLocation(ka)
  const b = unkeyLocation(kb)
  return byLocation(a, b)
}

module.exports = {
  keyLocation,
  unkeyLocation,
  byLocation,
  byLocationKey,
}
