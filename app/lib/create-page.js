'use strict'

const fs = require('fs')
const mainCss = fs.readFileSync(require.resolve('../build/deoptigate.css'), 'utf8')
const mainJs = fs.readFileSync(require.resolve('../build/deoptigate.js'), 'utf8')

function createPage(json) {
  const miniJSON = JSON.stringify(JSON.parse(json))
return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>deoptigate</title>
    <style type="text/css" media="screen">
      ${mainCss}
    </style>
    <script type="text/javascript" charset="utf-8">
      ${mainJs}
    </script>
    <script type="application/json" id="deoptigate-data" charset="utf-8">
    </script>
  </head>
  <body>
    <script>
      const info = ${miniJSON}
      deoptigateRender(info)
    </script>
  </body>
</html>
`
}

module.exports = createPage
