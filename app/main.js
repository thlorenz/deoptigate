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
    this.state = { selectedId: 2 }
  }
  render() {
    const { groups, files } = this.props
    const { selectedId } = this.state
    return (
      <div>
        <CodesView groups={groups} files={files} selectedId={selectedId} />
        <SummariesView groups={groups} selectedId={selectedId} />
      </div>
    )
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
