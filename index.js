codder = require('./codder')
codder(`set arg2 = 'a'
set myf = f{
    set arg = arg(0)
    out(arg)
    global('arg2')
    set arg2 = 'c'
}
myf('b')
out(arg2)`)