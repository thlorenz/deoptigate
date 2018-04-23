'use strict'

const {
    keyLocation
  , byLocationKey
} = require('./location')

function byTimeStamp(a, b) {
  return a.timestamp < b.timestamp ? -1 : 1
}

function getLocationGroups(data) {
  const { ics, deopts } = data
  const icsByLocation = new Map()
  const deoptsByLocation = new Map()

  const deoptLocations = new Set()
  const icLocations = new Set()
  let id = 1

  for (const deopt of deopts) {
    const locationKey = keyLocation(deopt)
    if (deoptsByLocation.has(locationKey)) {
      deoptsByLocation.get(locationKey).push(deopt)
    } else {
      const info = [ deopt ]
      info.id = id++
      deoptsByLocation.set(locationKey, info)
      deoptLocations.add(locationKey)
    }
  }

  for (const ic of ics) {
    const locationKey = keyLocation(ic)
    if (icsByLocation.has(locationKey)) {
      icsByLocation.get(locationKey).push(ic)
    } else {
      const info = [ ic ]
      info.id = id++
      icsByLocation.set(locationKey, info)
      icLocations.add(locationKey)
    }
  }

  for (const arr of deoptsByLocation.values()) {
    arr.sort(byTimeStamp)
  }

  const sortedIcLocations = Array.from(icLocations).sort(byLocationKey)
  const sortedDeoptLocations = Array.from(deoptLocations).sort(byLocationKey)
  return {
      ics: icsByLocation
    , deopts: deoptsByLocation
    , icLocations: sortedIcLocations
    , deoptLocations: sortedDeoptLocations
  }
}

function groupByLocation(byFile) {
  const acc = new Map()
  for (const [ file, data ] of byFile) {
    const grouped = getLocationGroups(data)
    acc.set(file, grouped)
  }
  return acc
}

module.exports = groupByLocation
