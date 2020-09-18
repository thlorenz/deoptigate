'use strict'

const fs = require('fs')
const mainCss = fs.readFileSync(
  require.resolve('../build/deoptigate.css'),
  'utf8'
)
const mainJs = fs.readFileSync(
  require.resolve('../build/deoptigate.js'),
  'utf8'
)

function createPage() {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>deoptigate</title>
    <style async type="text/css" media="screen">
      ${mainCss}
    </style>
    <script async type="text/javascript" charset="utf-8">
      ${mainJs}
    </script>
  </head>
  <body>
    <script async src="deoptigate.render-data.js"></script>
  </body>
</html>
`
}

module.exports = createPage
