/*jshint
    node: true
*/

module.exports = {
  // testEnvironment: 'node', // jsdom | node
  transformIgnorePatterns: [],
  testPathIgnorePatterns: [
      '/node_modules/',
  ],
  testMatch: [
      "**/__tests__/**/*.?(m)js",
      "**/?(*.)(spec|test).?(m)js",
  ],
};
