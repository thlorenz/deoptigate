# deoptigate

<a href="https://www.patreon.com/bePatron?u=8663953"><img alt="become a patron" src="https://c5.patreon.com/external/logo/become_a_patron_button.png" height="35px"></a>

```js
deoptigate app.js
```

[![xml2js](assets/xml2js.png)](https://thlorenz.com/deoptigate-examples/xml2js/01_start/?selectedFileIdx=31&selectedLocation=157&includeAllSeverities=false&highlightCode=true&selectedTabIdx=1&selectedSummaryTabIdx=1)

## What Performance Experts Say About Deoptigate

<table>
  <thead>
  <tr>
    <td>
      Jason Miller aka
      <a href="https://twitter.com/_developit">@_developit</a>, creator of
      <a href="https://preactjs.com/">preact</a>.
    </td>
    <td>
    John-David Dalton aka
      <a href="https://twitter.com/jdalton">@jdalton</a>, creator of
      <a href="https://lodash.com/">lodash</a>.
    </td>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>
      <img alt="developit" src="assets/developit.png">
    </td>
    <td>
      <img alt="jdalton" src="assets/jdalton.png">
    </td>
  </tr>
  </tbody>
</table>

## Blogposts about Deoptigate

<table>
  <body>
  <tr>
    <td>
      <a href="https://nodesource.com/blog/why-the-new-v8-is-so-damn-fast">
        <span>Why the New V8 is so Damn Fast</span>
        <img alt="damn-fast" src="assets/damn-fast.png">
      </a>
    </td>
    <td>
      <a href="https://nodesource.com/blog/tracking-down-performance-bottlenecks-nsolid-deoptigate">
        <span>Tracking Down and Fixing Performance Bottlenecks with N|Solid and Deoptigate</span>
        <img alt="damn-fast" src="assets/tracking-down.png">
      </a>
    </td>
  </tr>
  </tbody>
</table>

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

### To capture a browser session

Launch a Chromium-based browser with the necessary tracing flags. For example,
here running on localhost and writing the log file to the `/temp/trace` directory.

```
%browser_exe% --no-sandbox --js-flags="--trace-ic --nologfile-per-isolate --logfile=/temp/trace/v8.log" http://localhost:8000/
```

When running with no sandbox, you can also load pages directly from disk, e.g.

```
%browser_exe% --no-sandbox --disable-extensions --js-flags="--trace-ic --nologfile-per-isolate --logfile=/temp/trace/v8.log" c:\temp\trace\default.html
```

With the directory containing the log file as the current directory, run `deoptigate`.

_Note: The JavaScript files to analyze must be laid out in the current directory
as they are in the URL path. For example, if the browser loaded a file at
`http://localhost:8000/js/app.js` above, then the file should exist at `/temp/tracing/js/app.js`.
If the local copy does not exist, it will not appear in the analysis._

## License

MIT
