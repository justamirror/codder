const lexer = require(__dirname+'/lexer')
const Path = require('path')
// MODULES
cmd(function _import(t, path){
    function import_codder(p) {
        return new interpreter(new lexer(fs.readFileSync(p).toString())).exports
    }
    function import_js(p) {
        return require(p)
    }
    if (path.startsWith('./')) {
        return import_codder(path)
    } else {
        path = Path.join(__dirname, 'modules', path)
        if (fs.existsSync(path)) {
            if (path.endsWith('.cod')) {
                return import_codder(path)
            } else {
                return import_js(path)
            }
        } else if (fs.existsSync(path+'.js')) {
            return import_js(path+'.js')
        } else if (fs.existsSync(path+'.cod')) {
            import_js(path+'.cod')
        } else {
            throw Error("cannot import module "+path)
        }
    }
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