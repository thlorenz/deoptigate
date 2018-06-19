'use strict'

const {
    keyLocation
  , byLocationKey
} = require('./location')

class FileLocationGrouper {
  constructor(fileGroup) {
    this._id = 0
    this._fileGroup = fileGroup
  }

  locationsForFileGroup() {
    this._icsByLocation = new Map()
    this._deoptsByLocation = new Map()
    this._codesByLocation = new Map()

    this._deoptLocations = new Set()
    this._icLocations = new Set()
    this._codeLocations = new Set()

    const { ics, deopts, codes } = this._fileGroup
    const {
        dataByLocation: icsByLocation
      , locations: icLocations
    } = this._extractLocations(ics)
    const {
        dataByLocation: deoptsByLocation
      , locations: deoptLocations
    } = this._extractLocations(deopts)
    const {
        dataByLocation: codesByLocation
      , locations: codeLocations
    } = this._extractLocations(codes)

    const sortedIcLocations = Array.from(icLocations).sort(byLocationKey)
    const sortedDeoptLocations = Array.from(deoptLocations).sort(byLocationKey)
    const sortedCodeLocations = Array.from(codeLocations).sort(byLocationKey)
    return {
        icsByLocation
      , deoptsByLocation
      , codesByLocation
      , icLocations    : sortedIcLocations
      , deoptLocations : sortedDeoptLocations
      , codeLocations  : sortedCodeLocations
    }
  }

  _extractLocations(dataPoints) {
    const dataByLocation = new Map()
    const locations = new Set()
    for (const dataPoint of dataPoints) {
      const { functionName, line, column } = dataPoint
      const locationKey = keyLocation({ functionName, line, column })
      locations.add(locationKey)
      dataPoint.id = this._id++
      dataByLocation.set(locationKey, dataPoint)
    }
    return { dataByLocation, locations }
  }
}

function groupByFileAndLocation(groupedByFile) {
  const groupedByFileAndLocation = new Map()
  for (const [ file, fileGroup ] of groupedByFile) {
    const fileLocationGrouper = new FileLocationGrouper(fileGroup)

    const {
        icsByLocation
      , deoptsByLocation
      , codesByLocation
      , deoptLocations
      , icLocations
      , codeLocations
    } = fileLocationGrouper.locationsForFileGroup()

    groupedByFileAndLocation
      .set(file, Object.assign(fileGroup, {
        ics    : icsByLocation
      , deopts : deoptsByLocation
      , codes  : codesByLocation
      , deoptLocations
      , icLocations
      , codeLocations
    }))
  }

  return groupedByFileAndLocation
}

module.exports = groupByFileAndLocation
