# deoptigate

Investigates v8/Node.js function deoptimizations.

```js
deoptigate app.js
```

[![vector](assets/vector.png)](https://thlorenz.com/deoptigate/vector/)

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

## License

MIT
