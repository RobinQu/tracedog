var debug = require('debug')('xtrace:reporter:console');
var _ = require('lodash');

var ConsoleReporter = function (options) {
  debug('construct');
  options = _.defaults(options, {
    console: console,
    level: 'info'
  });
  this.console = options.console;
  this.level = options.level;
};

ConsoleReporter.prototype.send = function (event, callback) {
  debug('send');
  this.console[this.level]('xtrace', JSON.stringify(event));
  if(callback) {
    callback();
  }
};

module.exports = ConsoleReporter;
