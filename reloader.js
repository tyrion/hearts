var fs = require('fs');

// hack
require('express');
var methods = require.cache[require.resolve('express')].require('methods');

var reloader = {

    init: function(app, options) {
        this._app = app;

        function Proxy(module) {
            this.module = module;
        };
        Proxy.prototype = Object.create(app);
        methods.forEach(function(method) {
            Proxy.prototype[method] = function(path) {
                console.log('registering route %s', path);
                process.nextTick(function() { console.dir(app.routes); });
                arguments[0] = new String(path);
                arguments[0]._reloader_module = this.module;
                return app[method].apply(app, arguments);
            }
        });

        this.Proxy = Proxy;
    },

    app: function(module) {
        var app = this._app;
        if (app === undefined)
            throw new Error("ImproperlyConfigured: app not set.");
        console.log('creating "app" for module "%s"', module.filename); 
        var watcher = fs.watch(module.filename, function(event, filename) {
            if (event == 'rename') return;
            watcher.close();
            console.log('%s changed (%s), reloading it now!', filename, event);
            for (var method in app.routes) {
                app.routes[method].forEach(function(route, i, routes) {
                    if (route.path._reloader_module === module)
                        Array.remove(routes, i);
                });
            }
            console.dir(app.routes);
            // FIXME si potrebbe implementare l'ambaradam come require.
            delete require.cache[module.id];
            require(module.id);
        });
        return new this.Proxy(module);
    }

};


exports = module.exports = function (app) { reloader.init(app); };
exports.app = reloader.app.bind(reloader);

// Array Remove - By John Resig (MIT Licensed)
Array.remove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};

/*
var fs = require('fs'),
    require('express');

var methods = require.cache[require.resolve('express')].require('methods');

exports = module.exports = function(app, files) {

    var fakeApp = Object.create(app);
    methods.forEach(function(method) {
        fakeApp[method] = function(path) {
            path._reloader_module = this.module;
            return app[method].apply(app, arguments);
        };
    });

    files.forEach(function(file) {
        var routes = require(file),
            path = require.resolve(file);
        
        fakeApp.module = require.cache[path];
        routes(fakeApp);


        fs.watch(path, function(event, filename) {
            if (event == 'rename') return;
            console.log(filename);
        });
    });

};
*/
