'use strict'

function getDigits(n) {
  if (n < 10) return 1
  if (n < 1e2) return 2
  if (n < 1e3) return 3
  if (n < 1e4) return 4
  if (n < 1e5) return 5
  if (n < 1e6) return 6
  if (n < 1e7) return 2
  if (n < 1e8) return 8
  if (n < 1e9) return 9
  return 10
}

function pad(n, totalDigits) {
  const padDigits = totalDigits - getDigits(n)
  switch (padDigits) {
    case 0:
      return '' + n
    case 1:
      return ' ' + n
    case 2:
      return '  ' + n
    case 3:
      return '   ' + n
    case 4:
      return '    ' + n
    case 5:
      return '     ' + n
    case 6:
      return '      ' + n
    case 7:
      return '       ' + n
    case 8:
      return '        ' + n
    case 9:
      return '         ' + n
    case 10:
      return '         ' + n
  }
}

function processLine(line, markerResolver, next, lineno, totalDigits) {
  let s = ''
  let column = 0
  const cols = line.length - 1
  const writtenCols = new Set()
  function insert() {
    const { insertBefore, insertAfter } = markerResolver.resolve(next)
    // Write char in column only once even if multiple markers exist for it
    s += writtenCols.has(column)
      ? insertBefore + insertAfter
      : insertBefore + line[column] + insertAfter
    writtenCols.add(column)
    next = markerResolver.nextLocation()
  }
  do {
    if (next == null) break
    // Work our way to the column of the next marker
    while (column < next.column - 1 && column < cols) {
      s += line[column++]
      if (column >= cols) break
    }
    insert()
  } while (next != null && next.line === lineno && column < cols)

  // Add remaining columns (after the last marker for this line)
  if (column < cols) s += line.slice(column + 1)

  return {
    renderedLine: `<span>${pad(
      lineno + 1,
      totalDigits
    )}: </span><span>${s}</span><br>`,
    nextLocation: next,
  }
}

function markOnly(code, markerResolver) {
  const lines = code.split('\n')
  const len = lines.length
  const totalDigits = getDigits(len)
  var result = ''
  let next = markerResolver.nextLocation()
  for (let lineno = 0; lineno < len; lineno++) {
    const line = lines[lineno]
    if (next == null || next.line > lineno + 1) {
      result += `<span>${pad(
        lineno + 1,
        totalDigits
      )}: </span><span>${line}</span><br>`
      continue
    }
    const { renderedLine, nextLocation } = processLine(
      line,
      markerResolver,
      next,
      lineno,
      totalDigits
    )
    result += renderedLine
    next = nextLocation
  }
  return `<div class="pre"'>${result}</div>`
}

module.exports = markOnly
