var debug = require('debug')('xtrace:layer');
var Event = require('./event');
var Store = require('./store');
var prop = Object.defineProperty;
var Context = require('./context');

var Layer = function (name, parent, data) {
  debug('construct');
  this.name = name;
  var entry = new Event(name, 'entry', parent);
  var exit = new Event(name, 'exit', entry);
  entry.set(data);
  this.events = {
    entry: entry,
    exit: exit
  };
  this.init();
};

var proto = Layer.prototype;

proto.init = function () {
  debug('init');
  var self = this;
  //async mark
  var async = false;
  prop(this, 'async', {
    enumerable: true,
    configurable: false,
    get: function () {
      return async;
    },
    set: function (v) {
      async = self.events.entry.async = !!v;
    }
  });
};

proto.descend = function (name, data) {
  debug('descending %s from %s', this.name, name);
  var layer = new Layer(name, Event.last, data);
  layer.descended = true;
  return layer;
};

proto.run = function (fn) {
  this.async = fn.length === 1;
  var self = this;
  var invoke = function (method) {
    if(!self.descended || self.async) {
      Store.getInstance().run(method);
    } else {
      method();
    }
  };

  //run
  if(this.async) {
    return invoke(function () {
      self.enter();
      return fn.call(self, function (cb, handler) {
        handler = handler || function (e) {
          if (e && e instanceof Error) {
            self.events.exit.error = e;
          }
          self.exit();
        };

        return Store.getInstance().bind(function () {
          handler.apply(this, arguments);
          return cb.apply(this, arguments);
        });
      });
    });
  }

  return invoke(function () {
    self.enter();
    try {
      return fn.call(self);
    } catch (e) {
      if (e instanceof Error) {
        self.events.exit.error = e;
      }
      throw e;
    } finally {
      self.exit();
    }
  });
};

proto.enter = function (data) {
  debug('layer %s entered', this.name);
  Layer.last = this;
  var entry = this.events.entry;
  entry.set(data);
  entry.send();
  Context.get().emit('layer:enter', this, data);
};

proto.exit = function (data) {
  debug('layer %s exited', this.name);
  var exit = this.events.exit;
  var last = Event.last;
  if (!this.async && last && last !== this.events.entry) {
    exit.addEdge(last);
  } else {
    debug(exit + ' no extra edge found');
  }
  exit.set(data);
  exit.send();
  Context.get().emit('layer:exit', this, data);
};

proto.info = function (data) {
  debug(name);
  var entry = this.events.entry;
  var exit = this.events.exit;
  var event = new Event(entry.layer, 'info', entry);
  exit.edges.push(event);
  exit.set(data);
  event.send();
};

prop(Layer, 'last', {
  configurable: false,
  enumerable: true,
  get: function () {
    return Store.getInstance().get('lastLayer');
  },
  set: function (v) {
    Store.getInstance().set('lastLayer', v);
  }
});

module.exports = Layer;
