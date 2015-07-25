var cls = require('continuation-local-storage');

module.exports = {
  getInstance: function () {
    return cls.getNamespace('xtrace-store') || cls.createNamespace('xtrace-store');
  }
};
