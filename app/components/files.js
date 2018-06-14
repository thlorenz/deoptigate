'use strict'

const React = require('react')
const { Component } = React
const summarizeFile = require('../../lib/grouping/summarize-file')
const assert = require('assert')

const severityClassNames = [
    'green i'
  , 'blue'
  , 'red b'
]

const underlineTdClass = ' bb b--silver pt2 pb2'

function coloredTds(arr) {
  return arr.map((x, idx) => {
    const className = x > 0
      ? severityClassNames[idx] + ' tr' + underlineTdClass
      : 'silver i tr' + underlineTdClass
    return <td key={idx} className={className}>{x}</td>
  })
}

function bySeverityScoreDesc({ summary: s1 }, { summary: s2 }) {
  return s1.severityScore < s2.severityScore ? 1 : -1
}

class FilesView extends Component {
  constructor(props) {
    super(props)
    const { onfileClicked } = props
    assert.equal(typeof onfileClicked, 'function', 'need to pass onfileClicked function')
  }

  render() {
    const { groups, includeAllSeverities, className = '' } = this.props
    const tableHeader = this._renderTableHeader()
    const rows = []
    const filesSeverities = Array.from(groups)
      .map(([ file, info ]) => {
        const { deopts, ics, codes } = info
        const summary = summarizeFile({ ics, deopts, codes })
        return { file, summary }
      })
      .filter(({ summary }) => includeAllSeverities || summary.hasCriticalSeverities)
      .sort(bySeverityScoreDesc)

    for (const { file, summary } of filesSeverities) {
      const { icSeverities, deoptSeverities, codeStates } = summary
      const { relativePath } = groups.get(file)
      const rendered = this._renderFile({
          file
        , relativePath
        , icSeverities
        , deoptSeverities
        , codeStates
      })
      rows.push(rendered)
    }
    return (
      <div className={className}>
        <table cellSpacing='0'>
          {tableHeader}
          <tbody>{rows}</tbody>
        </table>
      </div>
    )
  }

  _renderTableHeader() {
    const topHeaderClass = 'bt br bl bw1 b--silver bg-light-green tc br1'
    const subHeaderClass = 'bb br bl bw1 b--silver br1'
    return (
      <thead>
        <tr>
          <td className={topHeaderClass + ' bb'} rowSpan='2'>File</td>
          <td colSpan='3' className={topHeaderClass}>Optimizations</td>
          <td colSpan='3' className={topHeaderClass}>Deoptimizations</td>
          <td colSpan='3' className={topHeaderClass}>Inline Caches</td>
        </tr>
        <tr>
          <td className={subHeaderClass}>Optimized</td>
          <td className={subHeaderClass}>Optimizable</td>
          <td className={subHeaderClass}>Compiled</td>
          <td className={subHeaderClass}>Severity 1</td>
          <td className={subHeaderClass}>Severity 2</td>
          <td className={subHeaderClass}>Severity 3</td>
          <td className={subHeaderClass}>Severity 1</td>
          <td className={subHeaderClass}>Severity 2</td>
          <td className={subHeaderClass}>Severity 3</td>
        </tr>
      </thead>
    )
  }

  _renderFile({ file, relativePath, deoptSeverities, icSeverities, codeStates }) {
    const { selectedFile } = this.props

    // Optimized = 3, Compile = 0, but we show them in order of serverity, so we reverse
    const codeColumns = coloredTds(codeStates.reverse())
    const deoptColumns = coloredTds(deoptSeverities.slice(1))
    const icColumns = coloredTds(icSeverities.slice(1))

    const onfileClicked = this._onfileClicked.bind(this, file)
    const selectedClass = file === selectedFile ? 'bg-light-yellow' : ''
    return (
      <tr key={relativePath} className={'bb b--silver ' + selectedClass}>
        <td>
          <a className={'i silver' + underlineTdClass}
            href='#'
            onClick={onfileClicked}>
            {relativePath}
          </a>
        </td>
        {codeColumns}
        {deoptColumns}
        {icColumns}
      </tr>
    )
  }

  _onfileClicked(file) {
    const { onfileClicked } = this.props
    onfileClicked(file)
  }
}

module.exports = { FilesView }
