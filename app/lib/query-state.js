'use strict'

/* global location */
const qs = require('qs')

function parseNum(s) {
  return s === '' ? null : parseInt(s)
}

function parseBool(s) {
  return s === 'true'
}

function stateFromUrl() {
  if (location.search == null || location.search.length < 2) return null
  const query = location.search.slice(1)
  const queryState = qs.parse(query)
  const state = {
    highlightCode: parseBool(queryState.highlightCode),
    includeAllSeverities: parseBool(queryState.includeAllSeverities),
    selectedFileIdx: parseNum(queryState.selectedFileIdx),
    selectedLocation: parseNum(queryState.selectedLocation),
    selectedTabIdx: parseNum(queryState.selectedTabIdx),
    selectedSummaryTabIdx: parseNum(queryState.selectedSummaryTabIdx),
  }
  return state
}

function urlFromState(state) {
  const rootUrl = location.origin
  const path = location.pathname
  const queryString = qs.stringify(state)
  const url = `${rootUrl}${path}?${queryString}`
  return url
}

module.exports = {
  stateFromUrl,
  urlFromState,
}
