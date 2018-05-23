'use strict'

const peacock = require('peacock')
const { classes } = peacock

function identity(s) { return s }

class ThemeBrowser {
  constructor(markerResolver) {
    this._markerResolver = markerResolver
  }

  _processToken(className) {
    className = className == null ? '' : className
    function mark(s, info) {
      const element = `<span class=${className}>${s}</span>`
      const { tokens, tokenIndex } = info
      const token = tokens[tokenIndex]
      const loc = token.loc.end
      if (loc == null) return element

      return element + this._markerResolver.resolve(loc)
    }
    return mark.bind(this)
  }

  get theme() {
    const x = this._processToken.bind(this)
    return {
      'Boolean': {
        'true'   :  undefined
      , 'false'  :  undefined
      , _default :  x(classes['Keyword.Constant'])
      }

    , 'Identifier': {
        'Date': x(classes['Literal.Date'])
      , 'Error': x(classes['Generic.Error'])
      , _default: x(classes.Name.Other)
      }

    , 'Null': {
        _default :  x(classes['Keyword.Constant'])
      }

    , 'Numeric': {
        _default: x(classes.Number)
      }

    , 'String': {
        _default: x(classes.String)
      }

    , 'Keyword': {
        'break'       :  undefined

      , 'case'        :  undefined
      , 'catch'       :  undefined
      , 'class'       :  undefined
      , 'const'       :  undefined
      , 'continue'    :  undefined

      , 'debugger'    :  undefined
      , 'default'     :  undefined
      , 'delete'      :  undefined
      , 'do'          :  undefined

      , 'else'        :  undefined
      , 'enum'        :  undefined
      , 'export'      :  undefined
      , 'extends'     :  undefined

      , 'finally'     :  undefined
      , 'for'         :  undefined
      , 'function'    :  undefined

      , 'if'          :  undefined
      , 'implements'  :  undefined
      , 'import'      :  undefined
      , 'in'          :  undefined
      , 'instanceof'  :  undefined

      , 'new'         :  undefined

      , 'package'     :  undefined
      , 'private'     :  undefined
      , 'protected'   :  undefined
      , 'public'      :  undefined

      , 'return'      :  undefined

      , 'static'      :  undefined
      , 'super'       :  undefined
      , 'switch'      :  undefined

      , 'this'        :  undefined
      , 'throw'       :  undefined
      , 'try'         :  undefined
      , 'typeof'      :  undefined

      , 'var'         :  undefined
      , 'void'        :  undefined

      , 'while'       :  undefined
      , 'with'        :  undefined
      , 'yield'       :  undefined
      , _default      :  x(classes.Keyword)
    }
    , 'Punctuator': {
        ';': x(classes.Punctuation)
      , '.': x(classes.Punctuation)
      , ',': x(classes.Punctuation)

      , '{': x(classes.Punctuation)
      , '}': x(classes.Punctuation)
      , '(': x(classes.Punctuation)
      , ')': x(classes.Punctuation)
      , '[': x(classes.Punctuation)
      , ']': x(classes.Punctuation)

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
      , '>>>=': undefined
      , '...': undefined
      , '**=': undefined

      , _default: x(classes.Operator)
    }
    , Line: {
        _default: x(classes['Comment.Single'])
      }

    , Block: {
        _default: x(classes.Comment)
      }

      // JSX
      , JSXAttribute: {
          _default: undefined
        }
      , JSXClosingElement: {
          _default: undefined
        }
      , JSXElement: {
          _default: undefined
        }
      , JSXEmptyExpression: {
          _default: undefined
        }
      , JSXExpressionContainer: {
          _default: undefined
        }
      , JSXIdentifier: {
          // many more identifies are possible, div, table, etc.
            className: x(classes['Name.Class'])
          , _default: x(classes['Name.Tag'])
        }
      , JSXMemberExpression: {
          _default: undefined
        }
      , JSXNamespacedName: {
          _default: undefined
        }
      , JSXOpeningElement: {
          _default: undefined
        }
      , JSXSpreadAttribute: {
          _default: undefined
        }
      , JSXText: {
          _default: undefined
        }

      , _default: x(identity)
    }
  }
}

module.exports = ThemeBrowser
