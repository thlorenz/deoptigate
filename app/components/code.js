'use strict'

const React = require('react')
const { Component } = React

const Theme = require('../theme.browser')
const MarkerResolver = require('../../lib/marker-resolver')
const { highlight } = require('peacock')

class CodeView extends Component {
  render() {
    const { file, code, ics, deopts, icLocations, deoptLocations } = this.props
    const markerResolver = new MarkerResolver({
        deopts
      , deoptLocations
      , ics
      , icLocations
      , isterminal: false
    })

    const theme = new Theme(markerResolver).theme
    const highlightedCode = highlight(code, { theme, linenos: false })
    return (
      <div dangerouslySetInnerHTML={{__html: highlightedCode}} />
    )
  }
}

class CodesView extends Component {
  render() {
    const { files, groups, selectedId } = this.props
    return Array.from(groups)
      .map(([ file, { ics, icLocations, deopts, deoptLocations } ], idx) => {
        const code = files.get(file).src
        return (
          <CodeView
            key={file}
            selectedId={selectedId}
            file={file}
            code={code}
            ics={ics}
            icLocations={icLocations}
            deopts={deopts}
            deoptLocations={deoptLocations} />
        )
      })
  }
}

module.exports = {
  CodesView
}
