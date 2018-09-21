'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.getHost = getHost;
exports.saveHost = saveHost;
exports.updateHostFromResponse = updateHostFromResponse;

var _session = require('./session');

var _storage = require('./storage');

var _webidOidc = require('./webid-oidc');

var WebIdOidc = _interopRequireWildcard(_webidOidc);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getHost(storage) {
  var _this = this;

  return function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(url) {
      var _ref2, host, session, _ref3, hosts;

      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _ref2 = new URL(url), host = _ref2.host;
              _context.next = 3;
              return (0, _session.getSession)(storage);

            case 3:
              session = _context.sent;

              if (!(session && host === new URL(session.idp).host)) {
                _context.next = 6;
                break;
              }

              return _context.abrupt('return', { url: host, requiresAuth: true });

            case 6:
              _context.next = 8;
              return (0, _storage.getData)(storage);

            case 8:
              _ref3 = _context.sent;
              hosts = _ref3.hosts;
              return _context.abrupt('return', hosts && hosts[host]);

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();
}
/* globalRequest, Response, URL */
function saveHost(storage) {
  var _this2 = this;

  return function () {
    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref4) {
      var url = _ref4.url,
          requiresAuth = _ref4.requiresAuth;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return (0, _storage.updateStorage)(storage, function (data) {
                return (0, _extends4.default)({}, data, {
                  hosts: (0, _extends4.default)({}, data.hosts, (0, _defineProperty3.default)({}, url, { requiresAuth: requiresAuth }))
                });
              });

            case 2:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this2);
    }));

    return function (_x2) {
      return _ref5.apply(this, arguments);
    };
  }();
}

function updateHostFromResponse(storage) {
  var _this3 = this;

  return function () {
    var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(resp) {
      var _ref7, _host;

      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!WebIdOidc.requiresAuth(resp)) {
                _context3.next = 4;
                break;
              }

              _ref7 = new URL(resp.url), _host = _ref7.host;
              _context3.next = 4;
              return saveHost(storage)({ url: _host, requiresAuth: true });

            case 4:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this3);
    }));

    return function (_x3) {
      return _ref6.apply(this, arguments);
    };
  }();
}