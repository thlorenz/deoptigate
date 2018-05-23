'use strict'

const React = require('react')
const { Component } = React
const { render } = require('react-dom')
const { deoptigate } = require('../')

const { CodesView } = require('./components/code')
const { SummariesView } = require('./components/summary')

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
    this.state = { selectedLocation: 2 }
    this._bind()
  }

  _bind() {
    this._onlocationSelected = this._onlocationSelected.bind(this)
  }

  render() {
    const { groups, files } = this.props
    const { selectedLocation } = this.state
    return (
      <div className='flex flex-row justify-center ma2'>
        <CodesView
          className='flex-column vh-100 overflow-scroll codes-view'
          groups={groups}
          files={files}
          selectedLocation={selectedLocation}
          onmarkerClicked={this._onlocationSelected} />
        <SummariesView
          className='flex-column vh-100 overflow-scroll'
          groups={groups}
          selectedLocation={selectedLocation}
          onsummaryClicked={this._onlocationSelected} />
      </div>
    )
  }

  _onlocationSelected(id) {
    this.setState(Object.assign(this.state, { selectedLocation: id }))
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
