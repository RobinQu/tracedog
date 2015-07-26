var debug = require('debug')('xtrace:reporter:console');

var ConsoleReporter = function (options) {
  debug('construct');
  options = options || {};
  this.console = options.console || console;
  this.level = options.level;
};

ConsoleReporter.prototype.send = function (event, callback) {
  this.console[this.level]('xtrace', JSON.stringify(event));
  if(callback) {
    callback();
  }
};

module.exports = ConsoleReporter;
