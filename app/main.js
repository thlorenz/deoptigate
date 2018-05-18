'use strict'

const React = require('react')
const { Component } = React
const { render } = require('react-dom')
const assert = require('assert')
const { deoptigate } = require('../')

const severityClassNames = [
    'green i'
  , 'blue'
  , 'red b'
]

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

class ToolbarView extends Component {

}

class SummaryView extends Component {
  constructor(props) {
    super(props)
    const { ics, icLocations, deopts, deoptLocations } = props

    assert(ics == null || icLocations != null, 'need to provide locations for ics')
    assert(deopts == null || deoptLocations != null, 'need to provide locations for deopts')
  }

  render() {
    const { ics, icLocations, deopts, deoptLocations, file } = this.props
    const renderedDeopts = this._renderDeopts(deopts, deoptLocations)

    return (
      <div>
        {renderedDeopts}
      </div>
    )
  }

  _renderDeopts(deopts, deoptLocations) {
    if (deopts == null) return null
    const { selectedId } = this.props
    const rendered = []
    for (const loc of deoptLocations) {
      const infos = deopts.get(loc)
      const highlightedClass = selectedId === infos.id ? 'b--blue bw2' : 'bw1'
      const className = `${highlightedClass} ba br2 ma3 pa2 bg-light-gray`
      rendered.push(
        <div className={className} key={infos.id}>
          {this._summary(infos)}
          {this._renderDeopt(infos)}
        </div>
      )
    }
    return rendered
  }

  _summary(infos) {
    const { id } = infos
    const {
        functionName
      , file
      , line
      , column
    } = infos[0]
    const locationEl = <span className='dark-blue f5 mr2'>{id}</span>
    const fullLoc = (
      <a href='#' className='i gray'>{functionName} at {file}:{line}:{column}</a>
    )
    return (
      <div>
        {locationEl}
        {fullLoc}
      </div>
    )
  }

  _renderDeopt(infos) {
    const rows = []
    for (const info of infos) {
      rows.push(this._deoptRow(info))
    }
    return (
      <table key={infos.id}>
        <thead className='f5 b tc'>
          <tr>
            <td>Timestamp</td>
            <td>Bailout</td>
            <td>Reason</td>
            <td>Inlined</td>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }

  _deoptRow(info) {
    const {
        inlined
      , bailoutType
      , deoptReason
      , timestamp
      , severity
    } = info
    const bailoutClassName = severityClassNames[severity - 1]
    const timeStampMs = (timestamp / 1E3).toFixed()
    return (
      <tr key={timestamp}>
        <td>{timeStampMs}ms</td>
        <td className={bailoutClassName}>{bailoutType}</td>
        <td className='tr'>{deoptReason}</td>
        <td className='gray tr'>{inlined ? 'yes' : 'no'}</td>
      </tr>
    )
  }
}

class SummariesView extends Component {
  render() {
    const { groups, selectedId } = this.props
    return Array.from(groups)
      .map(([ key, { ics, icLocations, deopts, deoptLocations } ], idx) =>
        <SummaryView
          key={idx}
          selectedId={selectedId}
          file={key}
          ics={ics}
          icLocations={icLocations}
          deopts={deopts}
          deoptLocations={deoptLocations} />
      )
  }
}

class CodeView extends Component {

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
      <SummariesView groups={groups} selectedId={selectedId} />
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
