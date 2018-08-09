'use strict'

const React = require('react')
const { Component } = React
const { render } = require('react-dom')
const { deoptigate } = require('../')

const { ToolbarView } = require('./components/toolbar')
const { FilesView } = require('./components/files')
const { FileDetailsView } = require('./components/file-details')

const FILES_TAB_IDX = 0
const DETAILS_TAB_IDX = 1

function app() {
  // makes React happy
  document.body.innerHTML = ''
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

class MainView extends Component {
  constructor(props) {
    super(props)
    this.state = {
        selectedFile: null
      , selectedLocation: 2
      , includeAllSeverities: false
      , highlightCode: true
      , selectedTabIdx: FILES_TAB_IDX
    }
    this._bind()
  }

  _bind() {
    this._onlocationSelected = this._onlocationSelected.bind(this)
    this._onincludeAllSeveritiesChanged = this._onincludeAllSeveritiesChanged.bind(this)
    this._onhighlightCodeChanged = this._onhighlightCodeChanged.bind(this)
    this._onfileClicked = this._onfileClicked.bind(this)
  }

  render() {
    const { includeAllSeverities, highlightCode } = this.state

    const tabs = this._renderTabs()
    return (
      <div className='center mw9 pa2'>
        <div className='flex flex-row'>
          {this._renderTabHeader('Files', FILES_TAB_IDX)}
          {this._renderTabHeader('Details', DETAILS_TAB_IDX)}
          <ToolbarView
            className='flex flex-column self-center ml4 pl4 bl bw1 b--silver'
            includeAllSeverities={includeAllSeverities}
            highlightCode={highlightCode}
            onincludeAllSeveritiesChanged={this._onincludeAllSeveritiesChanged}
            onhighlightCodeChanged={this._onhighlightCodeChanged} />
        </div>
        {tabs}
      </div>
    )
  }

  /*
   * Tabs
   */

  _renderTabHeader(label, idx) {
    const { selectedTabIdx } = this.state
    const selected = idx === selectedTabIdx
    const baseClass = 'flex flex-column ttu dib link pa3 bt outline-0 tab-header'
    const selectedClass = 'b--blue blue'
    const unselectedClass = 'black b--white'
    const className = selected ? `${baseClass} ${selectedClass}` : `${baseClass} ${unselectedClass}`

    return <a className={className} href='#' onClick={() => this._ontabHeaderClicked(idx)}>{label}</a>
  }

  _renderTabs() {
    const { selectedTabIdx } = this.state
    const files = this._renderFiles(selectedTabIdx === FILES_TAB_IDX)
    const details = this._renderFileDetails(selectedTabIdx === DETAILS_TAB_IDX)
    return (
      <div className='flex flex-row vh-100 overflow-scroll'>
        {files}
        {details}
      </div>
    )
  }

  /*
   * Contents
   */
  _renderFiles(selected) {
    const { groups } = this.props
    const { selectedFile, includeAllSeverities } = this.state
    const display = selected ? 'flex' : 'dn'
    const className = `${display} flex-row justify-center vh-90 overflow-scroll`

    return (
      <FilesView
        className={className}
        selectedFile={selectedFile}
        groups={groups}
        includeAllSeverities={includeAllSeverities}
        onfileClicked={this._onfileClicked} />
    )
  }

  _renderFileDetails(selected) {
    const { groups } = this.props
    const { selectedFile, selectedLocation, includeAllSeverities, highlightCode } = this.state
    const display = selected ? 'flex' : 'dn'
    const className = `${display} flex-row justify-center ma2`
    if (selectedFile == null || !groups.has(selectedFile)) {
      return (
        <div className={className}>Please select a file in the Files table</div>
      )
    }

    return (
      <FileDetailsView
        groups={groups}
        selectedFile={selectedFile}
        selectedLocation={selectedLocation}
        includeAllSeverities={includeAllSeverities}
        highlightCode={highlightCode}
        className={className}
        onmarkerClicked={this._onlocationSelected}
        onsummaryClicked={this._onlocationSelected}
      />
    )
  }

  /*
   * Events
   */
  _ontabHeaderClicked(idx) {
    this.setState(Object.assign(this.state, { selectedTabIdx: idx }))
  }

  _onlocationSelected(id) {
    this.setState(Object.assign(this.state, { selectedLocation: id }))
  }

  _onincludeAllSeveritiesChanged(includeAllSeverities) {
    this.setState(Object.assign(this.state, { includeAllSeverities, selectedLocation: null }))
  }

  _onhighlightCodeChanged(highlightCode) {
    this.setState(Object.assign(this.state, { highlightCode }))
  }

  _onfileClicked(file) {
    this.setState(Object.assign(this.state, {
        selectedFile: file
      , selectedLocation: null
      // auto open details view when file is sected
      , selectedTabIdx: DETAILS_TAB_IDX
    }))
  }
}

async function deoptigateRender(groupedByFile) {
  try {
    const groupedByFileAndLocation = deoptigate(groupedByFile)

    render(
      <MainView groups={groupedByFileAndLocation} />
    , app()
    )
  } catch (err) {
    console.error(err)
  }
}

module.exports = deoptigateRender
