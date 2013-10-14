var express = require('express')
    , cons = require('consolidate')
    , jade = require('jade')
    , path = require('path')
    , fs = require('fs')
    , Q = require('q')

var app = express()

app.engine('jade', cons.jade)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(express.static(path.join(__dirname, 'public')));

var temp = {
    s1: jade.compile(fs.readFileSync(path.join(__dirname, 'views', 's1.jade')))
    , s2: jade.compile(fs.readFileSync(path.join(__dirname, 'views', 's2.jade')))
}

//var getData = {
//    d1: function () {
//        var d = Q.defer();
//        setTimeout(function () {
//            d.resolve("Hello, I'm the first section.")
//        }, 8000);
//        return d.promise;
//    }
//    , d2: function () {
//        var d = Q.defer();
//        setTimeout(function () {
//            d.resolve("Hello, I'm the second section.")
//        }, 5000);
//        return d.promise;
//    }
//}

function getFirst () {
    var d = Q.defer();
    setTimeout(function () {
        d.resolve({ content: "Hello, I'm the first section."})
    }, 8000);
    return d.promise;
}

function getSecond () {
    var d = Q.defer();
    setTimeout(function () {
        d.resolve({ content: "Hello, I'm the second section."})
    }, 5000);
    return d.promise;
}


var resProto = require('express/lib/response')
resProto.pipe = function (selector, html, replace) {
    this.write('<script>' + '$("' + selector + '").' +
        (replace === true ? 'replaceWith' : 'html') +
        '("' + html.replace(/"/g, '\\"').replace(/<\/script>/g, '<\\/script>') +
        '")</script>')
}
function PipeName (res, name) {
    res.pipeCount = res.pipeCount || 0
    res.pipeMap = res.pipeMap || {}
    if (res.pipeMap[name]) return
    res.pipeCount++
    res.pipeMap[name] = this.id = ['pipe', Math.random().toString().substring(2), (new Date()).valueOf()].join('_')
    this.res = res
    this.name = name
}
resProto.pipeName = function (name) {
    return new PipeName(this, name)
}
resProto.pipeLayout = function (view, options) {
    var res = this
    Object.keys(options).forEach(function (key) {
        if (options[key] instanceof PipeName) options[key] = '<span id="' + options[key].id + '"></span>'
    })
    res.render(view, options, function (err, str) {
        if (err) return res.req.next(err)
        res.setHeader('content-type', 'text/html; charset=utf-8')
        res.write(str)
        if (!res.pipeCount) res.end()
    })
}
resProto.pipePartial = function (name, view, options) {
    var res = this
    res.render(view, options, function (err, str) {
        if (err) return res.req.next(err)
        res.pipe('#'+res.pipeMap[name], str, true)
        --res.pipeCount || res.end()
    })
}
app.use(function (req, res) {
    res.pipeLayout('index', {
        s1: res.pipeName('s1name')
        , s2: res.pipeName('s2name')
    })
    getFirst().then(function (data) {
        res.pipePartial('s1name', 's1', data)
    })
    getSecond().then(function (data) {
        res.pipePartial('s2name', 's2', data)
    })
})

app.listen(3000)