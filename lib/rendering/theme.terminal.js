'use strict'

const colors = require('ansicolors')
// eslint-disable-next-line no-unused-vars
function inspect(obj, { depth = 5, colors = true, maxArrayLength = 10 } = {}) {
  console.error(require('util').inspect(obj, { depth, colors, maxArrayLength }))
}

class ThemeTerminal {
  constructor(markerResolver) {
    this._markerResolver = markerResolver
  }

  _processToken(colorizer) {
    function mark(s, info) {
      const colorized = colorizer(s)
      const { tokens, tokenIndex } = info
      const token = tokens[tokenIndex]
      const loc = token.loc.end
      if (loc == null) return colorized

      const { insertBefore, insertAfter } = this._markerResolver.resolve(loc)
      return insertBefore + colorized + insertAfter
    }
    return mark.bind(this)
  }

  get theme() {
    const x = this._processToken.bind(this)
    // TODO: fix missing xs in Identifier and add jsx rules
    // also add x for root undefined via identity functin
    return {
      'Boolean': {
        'true'   :  undefined
      , 'false'  :  undefined
      , _default :  x(colors.brightRed)
      }

    , 'Identifier': {
        'undefined' :  x(colors.brightBlack)
      , 'self'      :  colors.brightRed
      , 'console'   :  x(colors.blue)
      , 'log'       :  colors.blue
      , 'warn'      :  x(colors.red)
      , 'error'     :  colors.brightRed
      , _default    :  x(colors.white)
      }

    , 'Null': {
        _default: x(colors.brightBlack)
      }

    , 'Numeric': {
        _default: x(colors.blue)
      }

    , 'String': {
        _default: function stringDefault(s, info) {
          var nextToken = info.tokens[info.tokenIndex + 1]

          // show keys of object literals and json in different color
          return (nextToken && nextToken.type === 'Punctuator' && nextToken.value === ':')
            ? colors.green(s)
            : colors.brightGreen(s)
        }
      }

    , 'Keyword': {
        'break'       :  undefined

      , 'case'        :  undefined
      , 'catch'       :  x(colors.cyan)
      , 'class'       :  undefined
      , 'const'       :  undefined
      , 'continue'    :  undefined

      , 'debugger'    :  undefined
      , 'default'     :  undefined
      , 'delete'      :  x(colors.red)
      , 'do'          :  undefined

      , 'else'        :  undefined
      , 'enum'        :  undefined
      , 'export'      :  undefined
      , 'extends'     :  undefined

      , 'finally'     :  x(colors.cyan)
      , 'for'         :  undefined
      , 'function'    :  undefined

      , 'if'          :  undefined
      , 'implements'  :  undefined
      , 'import'      :  undefined
      , 'in'          :  undefined
      , 'instanceof'  :  undefined
      , 'let'         :  undefined
      , 'new'         :  x(colors.red)
      , 'package'     :  undefined
      , 'private'     :  undefined
      , 'protected'   :  undefined
      , 'public'      :  undefined
      , 'return'      :  x(colors.red)
      , 'static'      :  undefined
      , 'super'       :  undefined
      , 'switch'      :  undefined

      , 'this'        :  x(colors.brightRed)
      , 'throw'       :  undefined
      , 'try'         :  x(colors.cyan)
      , 'typeof'      :  undefined

      , 'var'         :  x(colors.green)
      , 'void'        :  undefined

      , 'while'       :  undefined
      , 'with'        :  undefined
      , 'yield'       :  undefined
      , _default      :  x(colors.brightBlue)
    }
    , 'Punctuator': {
        '': x(colors.brightBlack)
      , '.': x(colors.green)
      , ',': x(colors.green)

      , '{': x(colors.yellow)
      , '}': x(colors.yellow)
      , '(': x(colors.brightBlack)
      , ')': x(colors.brightBlack)
      , '[': x(colors.yellow)
      , ']': x(colors.yellow)

      , '<': undefined
      , '>': undefined
      , '+': undefined
      , '-': undefined
      , '*': undefined
      , '%': undefined
      , '&': undefined
      , '|': undefined
      , '^': undefined
      , '!': undefined
      , '~': undefined
      , '?': undefined
      , ':': undefined
      , '=': undefined

      , '<=': undefined
      , '>=': undefined
      , '==': undefined
      , '!=': undefined
      , '++': undefined
      , '--': undefined
      , '<<': undefined
      , '>>': undefined
      , '&&': undefined
      , '||': undefined
      , '+=': undefined
      , '-=': undefined
      , '*=': undefined
      , '%=': undefined
      , '&=': undefined
      , '|=': undefined
      , '^=': undefined
      , '/=': undefined
      , '=>': undefined
      , '**': undefined

      , '===': undefined
      , '!==': undefined
      , '>>>': undefined
      , '<<=': undefined
      , '>>=': undefined
      , '...': undefined
      , '**=': undefined

      , '>>>=': undefined

      , _default: x(colors.brightYellow)
    }

      // line comment
    , Line: {
      _default: x(colors.brightBlack)
      }

      /* block comment */
    , Block: {
      _default: x(colors.brightBlack)
      }

    , _default: undefined
    }
  }
}

module.exports = ThemeTerminal
