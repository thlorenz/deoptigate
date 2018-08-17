#!/bin/sh

git clone https://github.com/thlorenz/deoptigate-examples.git data

echo "window.deoptigateRender = require('./main')" > client.js
echo "require('./data/xml2js/03_object-assign/deoptigate.render-data.js')" >> client.js
