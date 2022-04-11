const lexer = require('./lexer.js')
const interpreter = require('./interpreter.js')

module.exports = function(code) {
    return (new interpreter(new lexer(code))).r
}