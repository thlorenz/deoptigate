'use strict'

/** @jsx h */

const { h, Component, render } = require('preact')
const assert = require('assert')
const { deoptigate } = require('../')

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
    const { ics, icLocations, deopts, deoptLocations } = this.props
    return (
      <div>
        Summary View Coming up ...
      </div>
    )
  }
}

class CodeView extends Component {

}

class MainView extends Component {
  render() {
    const { groups, files } = this.props
    const { ics, icLocations, deopts, deoptLocations } = Array.from(groups.values())[0]
    return (
      <SummaryView
        ics={ics}
        icLocations={icLocations}
        deopts={deopts}
        deoptLocations={deoptLocations} />
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
    , document.body
    )
  } catch (err) {
    console.error(err)
  }
})()
