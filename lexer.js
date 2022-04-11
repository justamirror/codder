num = '0123456789'
alpha = 'abcdefghijklmnopqrstuvwxyz'
alpha+=alpha.toUpperCase()
alphnum = alpha+num
module.exports = class lexer {
    constructor(code) {
        this.code = code
        this.cursor = 0
        this.tokens = []
        this.parse()
        return {
            'type': 'program',
            'body': this.tokens
        }
    }
    next(check) {
        var next = this.code[this.cursor+1]
        if (next === undefined) {
            throw Error("EOF")
        }
        if (check !== undefined){
            ///console.log(check(next))
            if (!check(next)){
                throw Error('Unexpected "'+next+'"')
            }
        }
        this.cursor+=1
        return next
    }
    eof() {
        return this.cursor > this.code.length-1
    }
    _var() {
        this.cursor+= 2
        var name = this.code[this.cursor]
        var dotallowed = true
        var cont = true
        while (cont) {
            try {
                
                if (!dotallowed) {
                    name+=this.next((x)=>alphnum.includes(x))
                    dotallowed = true
                } else {
                    name+=this.next((x)=>(alphnum+'.').includes(x))
                    //console.log(name)
                    if (name[name.length-1] === '.') {
                        dotallowed = false
                    }
                }
            } catch {
                cont = false
            }
        }
        try {
            this.next((x)=>[' ', '\t'].includes(x))
        } catch {}
        this.next((x) =>x == '=')
        try {
            this.next((x)=>[' ', '\t'].includes(x))
        } catch {}
        this.cursor+=1
        var v = this.parseone()
        this.cursor-=1
        return {
            'type': 'cmd',
            'name': 'set',
            'args': [name, v],
        } 
    }
    command() {
        var name = this.code[this.cursor]
        var dotallowed = true
        var cont = true
        while (cont) {
            try {
                
                if (!dotallowed) {
                    name+=this.next((x)=>alphnum.includes(x))
                    dotallowed = true
                } else {
                    name+=this.next((x)=>(alphnum+'.').includes(x))
                    //console.log(name)
                    if (name[name.length-1] === '.') {
                        dotallowed = false
                    }
                }
            } catch {
                cont = false
            }
        }
        if (name == 'set') {
            return this._var()
        }
        try {
            this.next((x) => x == '(')
        } catch {
            return {
                'type': 'cmd',
                'name': 'get',
                'args': [name]
            }
        }
        var args = []
        while (true) {
            var r = this.parseone()
            if (r === undefined) {
                continue
            }
            args.push(r)
            
            if (r['type'] === 'body-int' && r['value'] === ')') {
                break
            }
        }
        this.cursor-=1
        return {
            'type': 'cmd',
            'name': name,
            'args': args.slice(1, -1)
        }
    }
    funcdef() {
        try{
            this.next((x)=>[' ', '\t'].includes(x))
        } catch {}
        this.next((x) => x === '{')
        var body = []
        while (true) {
            var r = this.parseone()
            if (r === undefined) {
                continue
            }
            body.push(r)
            //console.log(r)
            if (r['type'] === 'body-int' && r['value'] === '}') {
                break
            }
        }
        return {
            'type': 'funcdef',
            'body': body.slice(1, -1)
        }
    }
    number() {
        var curr = this.code[this.cursor]
        while (true){
            try {
                curr+=this.next((x)=> num.includes(x))
            } catch {
                break
            }
        }
        curr = Number(curr)
        return {
            'type': 'number',
            'value': curr
        }
    }
    string() {
        var mode = this.code[this.cursor]
        var curr = ''
        while (true) {
            try {
                curr+=this.next((x) => x !== mode)
            } catch {break}
        }
        this.cursor+=1
        if (curr[curr.length-1] === '/'){
            curr = curr.slice(0, -1)
        }
        if( mode == "'"){
            curr = '"'+curr.replace(/\"/g, '"').replace(/"/g, '\\"')+'"'
        } else {
            curr = mode+curr+mode
        }
        return {
            'type': 'string',
            'value': JSON.parse(curr)
        }
    }
    commentsingle() {
        while (this.next() !== '\n') {}
        this.cursor-=1
    }
    commentmulitple() {
        var s = ''
        while (true) {
            s+=this.next()
            if (s.slice(s.length-2) === '*/') {
                break
            }
        }
        //this.cursor+=2
    }
    parseone() {
        if (this.eof()) {throw Error('eee')}
        var t = this
        function f() {
                var curr = t.code[t.cursor]
                if (curr === undefined){
                    return
                }
               //  console.log(curr, t.cursor)
            
                if (['"', "'"].includes(curr)) {
                    return t.string()
                } else if (curr === 'f') {
                    return t.funcdef()
                } else if (num.includes(curr)) {
                    return t.number()
                } else if ([" ", '\n', '\t', ',', '=', ';'].includes(curr)) {
                } else if (curr === '/' && t.code[t.cursor+1] === '/') {
                    // comments (single line)
                    return t.commentsingle()
                } else if (curr === '/' && t.code[t.cursor+1] === '*') {
                    // comments (multi line)
                    return t.commentmulitple()
                } else if (['{', '}', '(', ')'].includes(curr)) {
                    //console.log(curr)
                    return {
                        'type': 'body-int', 
                        'value': curr
                    }
                } else if (alpha.includes(curr)) {
                    return t.command()
                } else {
                    throw Error('wat is this'+' '+curr)
                }
        }
        var r = f()
        this.cursor+=1
        return r
    }
    parse() {
        while (!this.eof()){
            var r = this.parseone()
            if (r !== undefined) {
                this.tokens.push(r)
            }
        }
    }
}