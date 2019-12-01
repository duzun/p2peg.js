// Karma configuration
// Generated on Tue Nov 25 2014 00:56:18 GMT+0200 (GTB Standard Time)

/*globals module, process*/
module.exports = function(config) {
  var configuration = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
        // JASMINE,
        // JASMINE_ADAPTER,
        // REQUIRE,
        // REQUIRE_ADAPTER,

      {pattern: 'lib/*.js', included: false},
      {pattern: 'p2peg.js', included: false},
      {pattern: 'spec/*.spec.js', included: false},
      'spec/test-main.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
        'Chrome'
      , 'Firefox'
      // , 'PhantomJS'
      // , 'IE'
    ],

    customLaunchers: {
        Chrome_travis_ci: {
            base: 'Chrome',
            flags: ['--no-sandbox']
        }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  };

    if ( process.env.TRAVIS ) {
        configuration.browsers = ['Chrome_travis_ci', 'Firefox'/*, 'PhantomJS'*/];
        configuration.singleRun = true;
    }

    config.set(configuration);
};
