'use strict'

const ispawnRx = /ispawn\/preload\/\S+\.js$/

function ignoreFile(files, file) {
  // For now we only include user code for which we resolved the file
  // Additionally we ignore files that were used by ispawn to control the process
  return file == null || !files.has(file) || ispawnRx.test(file)
}

function getOrCreateFileGroup(files, groups, file) {
  if (!groups.has(file)) {
    groups.set(
      file,
      Object.assign({ ics: [], deopts: [], codes: [] }, files.get(file))
    )
  }
  return groups.get(file)
}

function handleDataPoints(groups, files, dataPoints, key) {
  for (const dataPoint of dataPoints) {
    const { file } = dataPoint
    if (ignoreFile(files, file)) continue
    const group = getOrCreateFileGroup(files, groups, file)
    group[key].push(dataPoint)
  }
}

function mapByFile(data, files) {
  const { ics, deopts, codes } = data
  const groups = new Map()
  handleDataPoints(groups, files, ics, 'ics')
  handleDataPoints(groups, files, deopts, 'deopts')
  handleDataPoints(groups, files, codes, 'codes')
  return groups
}

module.exports = mapByFile
