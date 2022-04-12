// using js highlighting helps here
set arg2 = 'a'
set myf = f { // comment test 
    set arg = arg(0)
    out(arg)
    global('arg2')
    /*
        test 2
    */
    set arg2 = 'c'
}
myf('b');
println(arg2)
set module = import('./export_test.js')
out(module.test)
set a = import('testmodule')
out(a.hi)