const scope = require(__dirname+'/scope.js')
const fs = require('fs')

var cmds = {}
function cmd(func, name) {
    if (name === undefined) name = func.name
    cmds[name] = func
    return cmd
}
function leach(name, jsObj) {
    cmds[name] = new Proxy(jsObj, {
        get: function(n) {
            var v = jsObj[n]
            if (typeof v === 'function') {
                return function (t, ...args) {
                    return v.apply(jsObj, args)
                }
            }
            return v
        }
    })
}
var builtins = cmd
eval(fs.readFileSync(__dirname+'/builtins.js').toString())

class interpreter{
    constructor(parsed, s){
        this.ast = parsed
        if (s===undefined) {
            s = new scope(cmds)
        }
        this.globals = s
        this.local = this.globals
        this.r = this.eval(this.ast)
        this.exports = this.globals.get('exports')
    }
    enterscope(vars={}, args=[]){
        this.local = new scope(vars, args, this.local, this.globals)
    }
    exitscope() {
        this.local = this.local.parent || this.globals
    }
    call(name, a){
        var f = get(this,name)
        if (!(typeof f === 'function')){
            throw Error("nooeeee")
            return
        }
        
        var args = []
        for (var arg of a) {
            args.push(this.eval(arg))
        }
        if (f.body === undefined){
            args.unshift(this)
        }
        return f(...args)
    }
    runfunc(f, args){
        this.enterscope({}, args)
        for (let v of f['body']){
            this.eval(v)
        }
        this.exitscope()
    }
    eval(node){
        if (!node instanceof Object){
            return node
        }
        if (node['type'] == 'program'){
            var r = undefined
            for (var v of node['body']){
                r = this.eval(v)
            }
            return r
        } else if (node['type'] == 'funcdef') {
            var f = (...args)=>this.runfunc(node, ...args)
            f.body = node['body']
            return f
        } else if (node['type'] == 'number' || node['type'] == 'string'){
            return node['value']
        } else if (node['type'] == 'cmd'){
            return this.call(node['name'], node['args'])
        } else {
            return node
        }
    }
}

module.exports = interpreter