/**
 *   Compile JS files using Closure-Compiler service
 */
var http = require('http');
var fs = require('fs');
var querystring = require('querystring');

var hashes = ['p2peg', 'lib/sha1', 'lib/sha512', 'lib/base64'];

var dir = __dirname;

if ( !fs.existsSync(dir += '/dist') ) {
    fs.mkdir(dir)
}
if ( !fs.existsSync(dir += '/lib') ) {
    fs.mkdir(dir)
}

hashes.forEach(function (name) {
    var filename = __dirname + '/' + name + '.js';
    fs.readFile(filename, {encoding:'utf-8'}, function (err, data) {
        if (err) {
            console.log('can\'t read '+filename + '. ' + e.message);
        }
        else {
            compile(data, function (data) {
                if ( data ) {
                    var filename = __dirname + '/dist/' + name + '.js';
                    fs.writeFile(filename, data.trim(), function (err) {
                        if (err) throw err;
                        console.log("\x1b[32m%s\x1b[0m", filename);
                    })
                }
            })
        }
    });
});

function compile(script, cb) {
    var options = {
        output_info: 'compiled_code'
      , output_format: 'text'
      , compilation_level: 'SIMPLE_OPTIMIZATIONS'
      , warning_level: 'QUIET'
      , js_code: script
    };

    var data = querystring.stringify(options);

    var req = http.request({
      hostname: 'closure-compiler.appspot.com'
      , port: 80
      , path: '/compile'
      , method: 'POST'
      , headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data)
      }
    }, function(res) {
      // console.log('STATUS: ' + res.statusCode);
      var body = [];
      res.setEncoding('utf8');
      res.on('data', function (chunk) { body.push(chunk) });
      res.on('end', function () { cb(body.join(''), res) });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
      cb(null,null,e)
    });

    req.write(data);
    req.end();
}

