num = '0123456789'
alpha = 'abcdefghijklmnopqrstuvwxyz'
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
            throw "EOF"
        }
        if (check !== undefined){
            if (!check(next)){
                throw 'Unexpected'
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
        while (true){
            try {
                name+=this.next((x)=>alphnum.includes(x))
            } catch {
                break
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
        while (true) {
            try {
                name+=this.next((x) => alphnum.includes(x))
            } catch {break}
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
                } else if ([" ", '\n', '\t', ',', '='].includes(curr)) {
                } else if (['{', '}', '(', ')'].includes(curr)) {
                    //console.log(curr)
                    return {
                        'type': 'body-int', 
                        'value': curr
                    }
                } else if (alpha.includes(curr)) {
                    return t.command()
                } else {
                    throw 'wat is this'+' '+curr
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