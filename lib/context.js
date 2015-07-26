var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var debug = require('debug')('xtrace:context');
var EE = require('events').EventEmitter;
var util = require('util');

var Context = function () {
  EE.call(this);
};
util.inherits(Context, EE);

var proto = Context.prototype;

proto.configure = function (options) {
  if(!options) {//try rc files
    try {
      var rc = path.join(process.cwd(), '.xtrace');
      if(fs.existsSync(rc)) {
        options = JSON.parse(fs.readFileSync(rc, 'utf8'));
      }
    } catch(e) {
      debug(e);
    }
  }
  options = _.defaultsDeep(options || {}, {
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
