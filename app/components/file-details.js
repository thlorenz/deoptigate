'use strict'

const React = require('react')
const { Component } = React

const { CodeView } = require('./code')
const { SummaryView } = require('./summary')

const assert = require('assert')

class FileDetailsView extends Component {
  constructor(props) {
    super(props)

    const { onsummaryTabIdxChanged } = props
    assert.equal(typeof onsummaryTabIdxChanged, 'function', 'need to pass onsummaryTabIdxChanged function')

    this._bind()
  }

  _bind() {
    this._onmarkerClicked = this._onmarkerClicked.bind(this)
    this._onsummaryTabHeaderClicked = this._onsummaryTabHeaderClicked.bind(this)
  }

  render() {
    const {
        groups
      , selectedFile
      , selectedLocation
      , includeAllSeverities
      , highlightCode
      , className = ''
      , selectedSummaryTabIdx
      , onsummaryClicked
    } = this.props

    const {
        ics
      , icLocations
      , deopts
      , deoptLocations
      , codes
      , codeLocations
      , src
      , relativePath
    } = groups.get(selectedFile)

    return (
      <div className={className}>
        <CodeView
          className='flex-column vh-85 w-50 code-view'
          selectedLocation={selectedLocation}
          fileName={selectedFile}
          code={src}
          ics={ics}
          icLocations={icLocations}
          deopts={deopts}
          deoptLocations={deoptLocations}
          codes={codes}
          codeLocations={codeLocations}
          includeAllSeverities={includeAllSeverities}
          highlightCode={highlightCode}
          onmarkerClicked={this._onmarkerClicked} />
        <SummaryView
          className='flex-column vh-85 w-50 summary-view'
          file={selectedFile}
          relativePath={relativePath}
          selectedLocation={selectedLocation}
          ics={ics}
          icLocations={icLocations}
          deopts={deopts}
          deoptLocations={deoptLocations}
          codes={codes}
          codeLocations={codeLocations}
          includeAllSeverities={includeAllSeverities}
          selectedTabIdx={selectedSummaryTabIdx}
          ontabHeaderClicked={this._onsummaryTabHeaderClicked}
          onsummaryClicked={onsummaryClicked} />
      </div>
    )
  }

  _onmarkerClicked(id, type) {
    const {
        onmarkerClicked
      , onsummaryTabIdxChanged
      , selectedSummaryTabIdx
    } = this.props
    const markerSummaryTabIdx = (
        type === 'code' ? SummaryView.OPT_TAB_IDX
      : type === 'deopt' ? SummaryView.DEOPT_TAB_IDX
      : SummaryView.ICS_TAB_IDX
    )
    onmarkerClicked(id)
    if (markerSummaryTabIdx !== selectedSummaryTabIdx) {
      onsummaryTabIdxChanged(markerSummaryTabIdx)
    }
  }

  _onsummaryTabHeaderClicked(idx) {
    const { onsummaryTabIdxChanged } = this.props
    onsummaryTabIdxChanged(idx)
  }
}

module.exports = { FileDetailsView }
