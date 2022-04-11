const lexer = require('./lexer.js')
const prompt = require('./prompt.js')
const interpreter = require('./interpreter.js')
const fs = require('fs')

function run(code, scope=undefined) {
    return (new interpreter(new lexer(code), scope))
}
function runfile(filename) {
    return run(fs.readFileSync(filename).toString())
}
var filename = process.argv.slice(2)[0]
if (filename === undefined) {
    var scope = undefined
    while (true) {
        var p = prompt('>>> ')
        if (p.startsWith('?')) {
            var args = p.slice(1).split(' ')
            if (args[0] === 'exit'){
                return
            } else if (args[0] === 'run') {
                if (args[1] === undefined) {
                    console.log('You must supply a filename')
                } else {
                    runfile(args[1])
                }
            } else {
                console.log('Not a console command. Use ? to see them all.')
            }
            continue
        }
        try {
            let r = run(p, scope)
            scope = r.globals
            console.log(r.r)
        } catch (e) {
            console.log(e.toString())
        }
    }
} else {
    runfile(filename)
}