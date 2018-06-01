'use strict'

const React = require('react')
const { Component } = React
const { render } = require('react-dom')
const { deoptigate } = require('../')

const { CodeView } = require('./components/code')
const { SummaryView } = require('./components/summary')
const { ToolbarView } = require('./components/toolbar')
const { FilesView } = require('./components/files')

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
    }
    this._bind()
  }

  _bind() {
    this._onlocationSelected = this._onlocationSelected.bind(this)
    this._onincludeAllSeveritiesChanged = this._onincludeAllSeveritiesChanged.bind(this)
    this._onfileClicked = this._onfileClicked.bind(this)
  }

  render() {
    const { groups } = this.props
    const { selectedFile, includeAllSeverities } = this.state
    const fileDetailsClassName = 'flex flex-row justify-center ma2'
    const fileDetails = this._renderFileDetails(fileDetailsClassName)
    return (
      <div className='flex-column center mw8'>
        <ToolbarView
          className='flex flex-row justify-center'
          includeAllSeverities={includeAllSeverities}
          onincludeAllSeveritiesChanged={this._onincludeAllSeveritiesChanged} />
        <FilesView
          className='flex flex-row justify-center'
          selectedFile={selectedFile}
          groups={groups}
          onfileClicked={this._onfileClicked}
        />
        {fileDetails}
      </div>
    )
  }

  _renderFileDetails(className) {
    const { groups, files } = this.props
    const { selectedFile, selectedLocation, includeAllSeverities } = this.state
    if (selectedFile == null || !groups.has(selectedFile)) {
      return (
        <div className={className}>Please selecte a file in the above table</div>
      )
    }
    const { ics, icLocations, deopts, deoptLocations } = groups.get(selectedFile)
    const code = files.get(selectedFile).src

    return (
      <div className={className}>
        <CodeView
          className='flex-column vh-85 w-50 overflow-scroll code-view'
          selectedLocation={selectedLocation}
          code={code}
          ics={ics}
          icLocations={icLocations}
          deopts={deopts}
          deoptLocations={deoptLocations}
          includeAllSeverities={includeAllSeverities}
          onmarkerClicked={this._onlocationSelected} />
        <SummaryView
          className='flex-column vh-85 w-50 overflow-scroll'
          file={selectedFile}
          selectedLocation={selectedLocation}
          ics={ics}
          icLocations={icLocations}
          deopts={deopts}
          includeAllSeverities={includeAllSeverities}
          deoptLocations={deoptLocations}
          onsummaryClicked={this._onlocationSelected} />
      </div>
    )
  }
  _onlocationSelected(id) {
    this.setState(Object.assign(this.state, { selectedLocation: id }))
  }

  _onincludeAllSeveritiesChanged(includeAllSeverities) {
    this.setState(Object.assign(this.state, { includeAllSeverities, selectedLocation: null }))
  }

  _onfileClicked(file) {
    this.setState(Object.assign(this.state, { selectedFile: file }))
  }
}

async function deoptigateRender(info) {
  try {
    const filesMap = new Map(info.files)
    const { groups, files } = await deoptigate({ data: info.data, files: filesMap })

    render(
      <MainView groups={groups} files={files} />
    , app()
    )
  } catch (err) {
    console.error(err)
  }
}

module.exports = deoptigateRender
