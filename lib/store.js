var cls = require('continuation-local-storage');
var debug = require('debug')('xtrace:store');

module.exports = {
  getInstance: function () {
    var store = cls.getNamespace('xtrace-store');
    if(!store) {
      debug('create ns');
      store = cls.createNamespace('xtrace-store');
    }
    return store;
  }
};
