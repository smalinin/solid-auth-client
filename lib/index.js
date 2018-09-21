'use strict';

var _getOwnPropertyNames = require('babel-runtime/core-js/object/get-own-property-names');

var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);

var _solidAuthClient = require('./solid-auth-client');

var _solidAuthClient2 = _interopRequireDefault(_solidAuthClient);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Export a singleton instance of SolidAuthClient
var auth = new _solidAuthClient2.default();

// Bind methods to instance, so they can be invoked as regular functions
// (e.g., to pass around the fetch function)
(0, _getOwnPropertyNames2.default)(_solidAuthClient2.default.prototype).forEach(function (property) {
  var value = auth[property];
  if (typeof value === 'function') {
    auth[property] = value.bind(auth);
  }
});

// Export the instance as an object for backward compatibility
// (should become a default export of auth)
module.exports = auth;

// Expose window.SolidAuthClient for backward compatibility
if (typeof window !== 'undefined') {
  var warned = false;
  Object.defineProperty(window, 'SolidAuthClient', {
    enumerable: true,
    get: function get() {
      if (!warned) {
        warned = true;
        console.warn('window.SolidAuthClient has been deprecated.');
        console.warn('Please use window.solid.auth instead.');
      }
      return auth;
    }
  });
}