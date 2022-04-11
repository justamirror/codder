module.exports = class scope {
    constructor(vars = {}, args = [], parent, g) {
        this.parent = parent
        this.globals = new Set()
        this.vars = vars
        this.nonlocals = new Set()
        this.global_vars = g
        this.args = args
    }
    unlocal(name) {
        if (this.parent === undefined) { return }
        this.nonlocals.add(name)
    }
    set_global(name) {
        if (this.global_vars === undefined) { return }
        this.globals.add(name)
    }
    get(name) {
        if (this.globals.has(name)) { return this.global_vars.get(name) }
        if (this.nonlocals.has(name)) { return this.parent.get(name) }
        var r = this.vars[name]
        if (r !== undefined) {
            return r
        } else {
            if (this.parent === undefined) {

            } else {
                return this.parent.get(name)
            }
        }
    }
    set(name, v) {
        if (this.globals.has(name)) {
            return this.global_vars.set(name, v)
        }
        if (this.nonlocals.has(name)) { return this.parent.set(name, v) }
        this.vars[name] = v
    }
}