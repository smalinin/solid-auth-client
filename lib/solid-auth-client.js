'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _authnFetch = require('./authn-fetch');

var _popup = require('./popup');

var _session = require('./session');

var _storage = require('./storage');

var _urlUtil = require('./url-util');

var _webidOidc = require('./webid-oidc');

var WebIdOidc = _interopRequireWildcard(_webidOidc);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultLoginOptions = function defaultLoginOptions(url) {
  return {
    callbackUri: url ? url.split('#')[0] : '',
    popupUri: '',
    storage: (0, _storage.defaultStorage)()
  };
};
/* global RequestInfo, Response */

var SolidAuthClient = function (_EventEmitter) {
  (0, _inherits3.default)(SolidAuthClient, _EventEmitter);

  function SolidAuthClient() {
    (0, _classCallCheck3.default)(this, SolidAuthClient);
    return (0, _possibleConstructorReturn3.default)(this, (SolidAuthClient.__proto__ || (0, _getPrototypeOf2.default)(SolidAuthClient)).apply(this, arguments));
  }

  (0, _createClass3.default)(SolidAuthClient, [{
    key: 'fetch',
    value: function fetch(input, options) {
      return (0, _authnFetch.authnFetch)((0, _storage.defaultStorage)())(input, options);
    }
  }, {
    key: 'login',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(idp, options) {
        var webIdOidcLogin;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                options = (0, _extends3.default)({}, defaultLoginOptions((0, _urlUtil.currentUrlNoParams)()), options);
                _context.next = 3;
                return WebIdOidc.login(idp, options);

              case 3:
                webIdOidcLogin = _context.sent;
                return _context.abrupt('return', webIdOidcLogin);

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function login(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return login;
    }()
  }, {
    key: 'popupLogin',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(options) {
        var childWindow, session;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                options = (0, _extends3.default)({}, defaultLoginOptions(), options);
                if (!/https?:/.test(options.popupUri)) {
                  options.popupUri = new URL(options.popupUri || '/.well-known/solid/login', window.location).toString();
                }
                if (!options.callbackUri) {
                  options.callbackUri = options.popupUri;
                }
                childWindow = (0, _popup.openIdpSelector)(options);
                _context2.next = 6;
                return (0, _popup.startPopupServer)(options.storage, childWindow, options);

              case 6:
                session = _context2.sent;

                this.emit('login', session);
                this.emit('session', session);
                return _context2.abrupt('return', session);

              case 10:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function popupLogin(_x3) {
        return _ref2.apply(this, arguments);
      }

      return popupLogin;
    }()
  }, {
    key: 'currentSession',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var storage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _storage.defaultStorage)();
        var session;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return (0, _session.getSession)(storage);

              case 2:
                session = _context3.sent;

                if (session) {
                  _context3.next = 18;
                  break;
                }

                _context3.prev = 4;
                _context3.next = 7;
                return WebIdOidc.currentSession(storage);

              case 7:
                session = _context3.sent;
                _context3.next = 13;
                break;

              case 10:
                _context3.prev = 10;
                _context3.t0 = _context3['catch'](4);

                console.error(_context3.t0);

              case 13:
                if (!session) {
                  _context3.next = 18;
                  break;
                }

                this.emit('login', session);
                this.emit('session', session);
                _context3.next = 18;
                return (0, _session.saveSession)(storage)(session);

              case 18:
                return _context3.abrupt('return', session);

              case 19:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[4, 10]]);
      }));

      function currentSession() {
        return _ref3.apply(this, arguments);
      }

      return currentSession;
    }()
  }, {
    key: 'trackSession',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(callback) {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.t0 = callback;
                _context4.next = 3;
                return this.currentSession();

              case 3:
                _context4.t1 = _context4.sent;
                (0, _context4.t0)(_context4.t1);

                this.on('session', callback);

              case 6:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function trackSession(_x5) {
        return _ref4.apply(this, arguments);
      }

      return trackSession;
    }()
  }, {
    key: 'logout',
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
        var storage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _storage.defaultStorage)();
        var session;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return (0, _session.getSession)(storage);

              case 2:
                session = _context5.sent;

                if (!session) {
                  _context5.next = 17;
                  break;
                }

                _context5.prev = 4;
                _context5.next = 7;
                return WebIdOidc.logout(storage);

              case 7:
                this.emit('logout');
                this.emit('session', null);
                _context5.next = 15;
                break;

              case 11:
                _context5.prev = 11;
                _context5.t0 = _context5['catch'](4);

                console.warn('Error logging out:');
                console.error(_context5.t0);

              case 15:
                _context5.next = 17;
                return (0, _session.clearSession)(storage);

              case 17:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this, [[4, 11]]);
      }));

      function logout() {
        return _ref5.apply(this, arguments);
      }

      return logout;
    }()
  }]);
  return SolidAuthClient;
}(_events2.default);

exports.default = SolidAuthClient;