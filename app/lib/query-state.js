'use strict'

/* global location */
const qs = require('qs')

function stateFromUrl() {
  if (location.search == null || location.search.length < 2) return null
  const query = location.search.slice(1)
  return qs.parse(query)
}

function urlFromState(state) {
  const rootUrl = location.origin
  const path = location.pathname
  const queryString = qs.stringify(state)
  const url = `${rootUrl}${path}?${queryString}`
  return url
}

module.exports = {
    stateFromUrl
  , urlFromState
}
