/**
 * Compile JS files using Closure-Compiler service
 */

/*jshint node: true*/

var fs = require('fs');
var gccs = require('gccs');

var hashes = ['p2peg', 'lib/sha1', 'lib/sha256', 'lib/sha512', 'lib/base64', 'lib/crypto_hash'];

var dir = __dirname;

if ( !fs.existsSync(dir += '/dist') ) {
    fs.mkdir(dir);
}
if ( !fs.existsSync(dir += '/lib') ) {
    fs.mkdir(dir);
}

hashes.forEach(function (name) {
    gcc(__dirname + '/' + name + '.js', __dirname + '/dist/' + name + '.js');
});

// Helpers
function gcc(src, dest, opt) {
    if ( !opt ) opt = {};
    opt.out_file = dest;
    gccs.file(src, opt, function (err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        log_green(dest);
    });
}

function log_green(txt) {
    console.log("\x1b[32m%s\x1b[0m", txt);
}
