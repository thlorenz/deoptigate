'use strict'

function mapByFile(data) {
  const { ics, deopts, files } = data
  const acc = new Map()
  for (const ic of ics) {
    const { file } = ic
    if (file == null || !files.has(file)) continue
    if (!acc.has(file)) {
      acc.set(file, { ics: [], deopts: [], ...files.get(ic.file) })
    }
    const { ics } = acc.get(file)
    ics.push(ic)
  }
  for (const deopt of deopts) {
    const { file } = deopt
    if (file == null || !files.has(file)) continue
    if (!acc.has(file)) {
      acc.set(file, { ics: [], deopts: [], ...files.get(deopt.file) })
    }
    const { deopts } = acc.get(file)
    deopts.push(deopt)
  }
  return acc
}

module.exports = mapByFile
