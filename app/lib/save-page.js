'use strict'

const fs = require('fs')
const path = require('path')
const os = require('os')

const tmpdir = os.tmpdir()

function savePage(html) {
  const dest = path.join(tmpdir, 'deoptigate.html')
  fs.writeFileSync(dest, html, 'utf8')
  return dest
}

module.exports = savePage
