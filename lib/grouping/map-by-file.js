'use strict'

function mapByFile(data, files) {
  const { ics, deopts, codes } = data
  const acc = new Map()
  for (const ic of ics) {
    const { file } = ic
    if (file == null || !files.has(file)) continue
    if (!acc.has(file)) {
      acc.set(file, Object.assign({ ics: [], deopts: [], codes: [] }, files.get(ic.file)))
    }
    const { ics } = acc.get(file)
    ics.push(ic)
  }
  for (const deopt of deopts) {
    const { file } = deopt
    if (file == null || !files.has(file)) continue
    if (!acc.has(file)) {
      acc.set(file, Object.assign({ ics: [], deopts: [], codes: [] }, files.get(deopt.file)))
    }
    const { deopts } = acc.get(file)
    deopts.push(deopt)
  }
  for (const code of codes) {
    const { file } = code
    if (file == null || !files.has(file)) continue
    if (!acc.has(file)) {
      acc.set(file, Object.assign({ ics: [], deopts: [], codes: [] }, files.get(code.file)))
    }
    const { codes } = acc.get(file)
    codes.push(code)
  }
  return acc
}

module.exports = mapByFile
