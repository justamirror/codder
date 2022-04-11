const scope = require(__dirname+'/scope.js')

var cmds = {}
function cmd(func) {
    cmds[func.name] = func
    return cmd
}
cmd(function out(t, ...args){
    return console.log(...args)
})
cmd(function run(t, f, ...args){
    return t.runfunc(f, args)
})    
cmd(function arg(t, n){
    return t.local.args[n]
})

cmd(function set(t, name, value){
    return t.local.set(name, value)
})
cmd(function get(t, name){
    return t.local.get(name)
})
cmd(function nonlocal(t, name){
    return t.local.unlocal(name)
})
cmd(function global(t, name){
    return t.local.set_global(name)
})
module.exports = class interpreter{
    constructor(parsed){
        this.ast = parsed
        this.globals = new scope(cmds)
        this.local = this.globals
        this.r = this.eval(this.ast)
        return this.r
    }
    enterscope(vars={}, args=[]){
        this.local = new scope(vars, args, this.local, this.globals)
    }
    exitscope() {
        this.local = this.local.parent || this.globals
    }
    call(name, a){
        var f = this.local.get(name)
        if (!typeof f === 'function'){
            throw Error("nooeeee")
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