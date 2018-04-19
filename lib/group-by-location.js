'use strict'

const Translocator = require('translocator')

function byTimeStamp(a, b) {
  return a.timestamp < b.timestamp ? -1 : 1
}

function byNumber(a, b) {
  return a < b ? -1 : 1
}

function getLocationGroups(data) {
  const { src, ics, deopts } = data
  const translocator = new Translocator(src)
  const icsByLocation = new Map()
  const deoptsByLocation = new Map()

  const locations = new Set()

  for (const ic of ics) {
    const location = translocator.index(ic)
    locations.add(location)
    if (icsByLocation.has(location)) {
      icsByLocation.get(location).push(ic)
    } else {
      icsByLocation.set(location, [ ic ])
    }
  }

  for (const deopt of deopts) {
    const location = translocator.index(deopt)
    locations.add(location)
    if (deoptsByLocation.has(location)) {
      deoptsByLocation.get(location).push(deopt)
    } else {
      deoptsByLocation.set(location, [ deopt ])
    }
  }

  for (const arr of deoptsByLocation.values()) {
    arr.sort(byTimeStamp)
  }

  const sortedLocations = Array.from(locations).sort(byNumber)
  return {
      ics: icsByLocation
    , deopts: deoptsByLocation
    , locations: sortedLocations
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
