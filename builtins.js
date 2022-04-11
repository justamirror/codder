const lexer = require(__dirname+'/lexer')
// MODULES
cmd(function _import(t, path){
    return new interpreter(new lexer(fs.readFileSync(path).toString())).exports
}, 'import')

// MISC
cmd(function run(t, f, ...args){
    return t.runfunc(f, args)
})    
cmd(function arg(t, n){
    return t.local.args[n]
})

// CONSOLE
cmd(function println(t, ...args){
    return console.log(args.join(' '))
})
cmds.out = cmds.println
cmd(function print(t, ...args){
    return process.stdout.write(args.join(' '))
})

// VARS
function get(t, name){
    var nparts = name.split('.')
    if (nparts.length === 1) {
        return t.local.get(name)
    } else {
        var item = t.local.get(nparts[0])
        if (!(item instanceof Object)) {
            throw Error("not supported just yet")
        }
        nparts = nparts.slice(1)
        for (let part of nparts) {
            item = item[part]
        }
        return item
    }
}
cmd(function set(t, name, value){
    var nparts = name.split('.')
    if (nparts.length === 1) {
        return t.local.set(name, value)
    } else {
        var item = get(t, nparts.slice(0, -1).join('.'))
        item[nparts[nparts.length-1]] = value
    }
})
cmd(get)
cmd(function nonlocal(t, name){
    return t.local.unlocal(name)
})
cmd(function global(t, name){
    return t.local.set_global(name)
})

// EQUALITY
cmd(function equal(t,  s1, s2){
    return s1 === s2
})
cmd(function looselyequal(t, s1, s2){
    return s1 == s2
})
cmd(function not(t, s){
    return !s
})

cmds.math = {
    
}


cmds.exports = {}