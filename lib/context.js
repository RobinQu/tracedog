var _ = require('lodash');

var Context = function () {};

var proto = Context.prototype;

proto.configure = function (options) {
  _.defaultsDeep(options || {}, {
    reporter: {
      type: 'console'
    }
  });
  var Reporter = require('./reporters/' + options.reporter.type);
  this.reporter = new Reporter(options.reporter);
};

Context.get = Context.getInstance = function () {
  if(!Context.instance) {
    Context.instance = new Context();
  }
  return Context.instance;
};

module.exports = Context;
