'use strict'

const { promisify } = require('util')
const fs = require('fs')

const open = promisify(fs.open)
const fstat = promisify(fs.fstat)
const read = promisify(fs.read)
const close = promisify(fs.close)

let _50_MEGABYTES = 50 * 1024 * 1024;
async function* lineReader(path, encoding) {
  const fd = await open(path, 'r')
  const stats = await fstat(fd)
  const fileSize = stats.size
  const maxBufferSize = _50_MEGABYTES
  let bytesRead = 0
  let remainingString = ''

  while (bytesRead < fileSize) {
    let bufferSize = maxBufferSize
    if ((bytesRead + maxBufferSize) > fileSize) {
      bufferSize = fileSize - bytesRead
    }

    const buffer = Buffer.alloc(bufferSize)

    const chunk = await read(fd, buffer, 0, bufferSize, bytesRead);
    let current = 0
    while (current < bufferSize) {
      const next = chunk.buffer.indexOf('\n', current)
      if (next === -1) break
      const line = remainingString + chunk.buffer.subarray(current, next).toString(encoding)
      yield line
      current = next + 1
    }
    bytesRead += current
  }
  await close(fd)
}

module.exports = lineReader
