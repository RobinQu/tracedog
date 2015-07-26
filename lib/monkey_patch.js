var EE = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var path = require('path');
var assert = require('assert');

var debug = require('debug')('xtrace:monkey_patch');

var moduleProto = module.constructor.prototype;
var realRequire = moduleProto.require;

var Aspect = function (mod, options) {
  this.require = moduleProto.require.bind(mod);
  options = options || {};
  this.name = options.name || 'aspect';
  this.path = options.path;
  assert(this.path, 'should provide a path to the patch');
  var def = realRequire(this.path);
  this.take = def.take;
  mod['patched_by_xtrace'] = true;
};

Aspect.isPatched = function (mod) {
  return mod['patched_by_xtrace'];
};

var MonkeyPatch = function () {
  debug('construct');
  this.patches = {};
  this.aspects = {};

};
util.inherits(MonkeyPatch, EE);

MonkeyPatch.prototype.register = function (name, location) {
  debug('register %s', name, location);
  this.patches[name] = location;
  this.emit('register', name, location);
  return this;
};

MonkeyPatch.prototype.unregister = function (name) {
  debug('unregister %s', name);
  delete this.patches[name];
  this.emit('unregister', name);
  return this;
};

MonkeyPatch.prototype.enable = function () {
  moduleProto.require = this.makeRequire();
  return this;
};

MonkeyPatch.prototype.disable = function () {
  moduleProto.require = realRequire;
  return this;
};

MonkeyPatch.prototype.has = function (name) {
  return this.patches.hasOwnProperty(name);
};

MonkeyPatch.prototype.makeAspect = function (name, mod) {
  if(!this.aspects[name]) {
    var aspect = new Aspect(mod, {name: name, path: this.patches[name]});
    this.aspects[name] = aspect;
  }
  return aspect;
};

MonkeyPatch.prototype.makeRequire = function () {
  var self = this;
  return function (name) {//assume to be run in the context of a module
    var mod = realRequire.call(this, name);
    if(mod && self.has(name) && !Aspect.isPatched(mod)) {
      debug('patch %s', name);
      var modPath = Module._resolveFilename(name, this);
      var patched = self.makeAspect(name, this).take(mod);
      if(require.cache[modPath]) {
        require.cache[modPath] = patched;
      }
      mod = patched;
    }
    return mod;
  };
};

MonkeyPatch.prototype.defaults = function () {
  debug('load defaults');
  var self = this;
  var defaultAspectsPath = path.join(__dirname, 'aspects');
  var ptrn = /^(.*)+\.js$/;
  fs.readdirSync(defaultAspectsPath).forEach(function (name) {
    var matched = name.match(ptrn);
    if(matched && matched.length === 2) {
      var aspectName = matched[1];
      self.register(aspectName, path.join(__dirname, 'aspects', name));
    }
  });
  return this;
};

module.exports = new MonkeyPatch();
