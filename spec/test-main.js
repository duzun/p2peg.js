var allTestFiles = [];

(function (files, hop) {
    var TEST_REGEXP = /(spec|test)\.js$/i;

    var pathToModule = function(path) {
      return path.replace(/^\/base\//, '').replace(/\.js$/, '');
    };

    for(var file in files) if(hop.call(files, file)) {
        if (TEST_REGEXP.test(file)) {
            // Normalize paths to RequireJS module names.
            allTestFiles.push(pathToModule(file));
        }
    }
}(window.__karma__.files, ({}).hasOwnProperty));

require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',

    // paths: {
        // 'jquery': '../lib/jquery',
        // 'underscore': '../lib/underscore',
    // },

    // shim: {
        // 'underscore': {
            // exports: '_'
        // }
    // },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
