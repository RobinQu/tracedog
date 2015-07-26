// var delegate = require('delegates');
var Store = require('./store');
var debug = require('debug')('xtrace:event');
var Context = require('./context');
var _ = require('lodash');

var prop = Object.defineProperty;

var Event = function (layer, label, parent) {
  //trace id
  this.opId = parent ? parent.opId : crypto.pseudoRandomBytes(16).toString('hex');
  this.taskId = crypto.pseudoRandomBytes(16).toString('hex');

  //special properties
  this.parent = parent;
  this.edges = [];
  this.label = label;
  this.layer = layer;
  this.data = {};
  this.async = false;

  this.init();
};

var proto = Event.prototype;

proto.init = function () {
  debug('init');
  var self = this;

  prop(this, 'error', {
    configurable: false,
    enumerable: true,
    set: function (e) {
      self.data.error.errorName = e.constructor.name;
      self.data.error.message = e.message;
      self.data.backtrace = e.stack;
    },
    get: function () {
      return self.data;
    }
  });

  prop(this, 'id', {
    configurable: false,
    enumerable: true,
    get: function () {
      return self.opId + self.taskId;
    }
  });
};

proto.toString = function () {
  return this.id;
};

proto.inspect = function () {
  return 'xTrace Event ' + this.id;
};

proto.send = function () {
  debug('send');
  if(this.sent) {
    return;
  }
  Event.last = this;
  var self = this;
  Context.get().reporter.send(this, function () {
    self.sent = true;
  });
};

proto.set = function (data) {
  debug('set');
  _.extend(this.data, data);
};

prop(Event, 'last', {
  configurable: false,
  enumerable: false,
  get: function () {
    Store.getInstance().get('lastEvent');
  },
  set: function (v) {
    Store.getInstance().set('lastEvent', v);
  }
});
