# deoptigate

Investigates v8/Node.js function deoptimizations.

```js
deoptigate app.js
```

[![xml2js](assets/xml2js.png)](https://thlorenz.com/deoptigate-examples/xml2js/01_start/?selectedFileIdx=31&selectedLocation=157&includeAllSeverities=false&highlightCode=true&selectedTabIdx=1&selectedSummaryTabIdx=1)

## Installation

    npm install -g deoptigate

## Usage

### Deoptigate your App in one Step

```
deoptigate app.js
```

Override Node.js executable and/or pass it custom arguments

```
deoptigate -- /bin/mynode app.js
```

```
deoptigate -- node --allow-natives-syntax app.js
```

### Deoptigate existing `*-v8.log`

Simply run `deoptigate` from the directory that contains the log file(s).

### Deoptigate existing `*.log`

Run `deoptigate --open path/to/file.log`. You may also use `-o`.

## License

MIT
