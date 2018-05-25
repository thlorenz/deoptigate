'use strict'

const React = require('react')
const { Component } = React
const { render } = require('react-dom')
const { deoptigate } = require('../')

const { CodesView } = require('./components/code')
const { SummariesView } = require('./components/summary')
const { ToolbarView } = require('./components/toolbar')

function app() {
  // makes React happy
  document.body.innerHTML = ''
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

function getInfo() {
  return require('../results/data+files.json')
}

class MainView extends Component {
  constructor(props) {
    super(props)
    this.state = { selectedLocation: 2, includeAllSeverities: false }
    this._bind()
  }

  _bind() {
    this._onlocationSelected = this._onlocationSelected.bind(this)
    this._onincludeAllSeveritiesChanged = this._onincludeAllSeveritiesChanged.bind(this)
  }

  render() {
    const { groups, files } = this.props
    const { selectedLocation, includeAllSeverities } = this.state
    return (
      <div>
        <ToolbarView
          className='flex flex-row'
          includeAllSeverities={includeAllSeverities}
          onincludeAllSeveritiesChanged={this._onincludeAllSeveritiesChanged} />
        <div className='flex flex-row justify-center ma2'>
          <CodesView
            className='flex-column vh-100 overflow-scroll codes-view'
            groups={groups}
            files={files}
            selectedLocation={selectedLocation}
            includeAllSeverities={includeAllSeverities}
            onmarkerClicked={this._onlocationSelected} />
          <SummariesView
            className='flex-column vh-100 overflow-scroll'
            groups={groups}
            selectedLocation={selectedLocation}
            includeAllSeverities={includeAllSeverities}
            onsummaryClicked={this._onlocationSelected} />
        </div>
      </div>
    )
  }

  _onlocationSelected(id) {
    this.setState(Object.assign(this.state, { selectedLocation: id }))
  }

  _onincludeAllSeveritiesChanged(includeAllSeverities) {
    this.setState(Object.assign(this.state, { includeAllSeverities, selectedLocation: null }))
  }
}

(async () => {
  try {
    const info = getInfo()
    const filesMap = new Map(info.files)
    const { groups, files } = await deoptigate({ data: info.data, files: filesMap })

    render(
      <MainView groups={groups} files={files} />
    , app()
    )
  } catch (err) {
    console.error(err)
  }
})()
