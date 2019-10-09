'use strict'

// allow DOS disk paths (i.e. 'C:\path\to\file')
const lineColumnRx = /:(\d+):(\d+)$/

function safeToInt(x) {
  if (x == null) return 0
  return parseInt(x)
}

function parseSourcePosition(sourcePosition) {
  const m = lineColumnRx.exec(sourcePosition)
  if (m) {
    return { file: sourcePosition.slice(0, m.index), line: safeToInt(m[1]), column: safeToInt(m[2]) }
  }
  return { file: sourcePosition, line: 0, column: 0 }
}

module.exports = parseSourcePosition