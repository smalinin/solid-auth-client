"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openIdpSelector = exports.startPopupServer = exports.appOriginHandler = exports.loginHandler = exports.storageHandler = void 0;

var _ipc = require("./ipc");

var _urlUtil = require("./url-util");

const popupAppRequestHandler = (store, options, foundSessionCb) => (0, _ipc.combineHandlers)(storageHandler(store), loginHandler(options, foundSessionCb), appOriginHandler);

const storageHandler = store => req => {
  const id = req.id,
        method = req.method,
        args = req.args;

  switch (method) {
    case 'storage/getItem':
      return store.getItem(...args).then(item => ({
        id,
        ret: item
      }));

    case 'storage/setItem':
      return store.setItem(...args).then(() => ({
        id,
        ret: null
      }));

    case 'storage/removeItem':
      return store.removeItem(...args).then(() => ({
        id,
        ret: null
      }));

    default:
      return null;
  }
};

exports.storageHandler = storageHandler;

const loginHandler = (options, foundSessionCb) => req => {
  const id = req.id,
        method = req.method,
        args = req.args;

  switch (method) {
    case 'getLoginOptions':
      return Promise.resolve({
        id,
        ret: {
          popupUri: options.popupUri,
          callbackUri: options.callbackUri
        }
      });

    case 'foundSession':
      foundSessionCb(args[0]);
      return Promise.resolve({
        id,
        ret: null
      });

    default:
      return null;
  }
};

exports.loginHandler = loginHandler;

const appOriginHandler = req => {
  const id = req.id,
        method = req.method;
  return method === 'getAppOrigin' ? Promise.resolve({
    id,
    ret: window.location.origin
  }) : null;
};

exports.appOriginHandler = appOriginHandler;

const startPopupServer = (store, childWindow, options) => {
  return new Promise((resolve, reject) => {
    if (!(options.popupUri && options.callbackUri)) {
      return reject(new Error('Cannot serve a popup without both "options.popupUri" and "options.callbackUri"'));
    }

    const popupServer = (0, _ipc.server)(childWindow, (0, _urlUtil.originOf)(options.popupUri || ''))(popupAppRequestHandler(store, options, session => {
      popupServer.stop();
      resolve(session);
    }));
    popupServer.start();
  });
};

exports.startPopupServer = startPopupServer;

const openIdpSelector = options => {
  if (!(options.popupUri && options.callbackUri)) {
    throw new Error('Cannot open IDP select UI.  Must provide both "options.popupUri" and "options.callbackUri".');
  }

  const width = 650;
  const height = 400;
  const w = window.open(options.popupUri, '_blank', `width=${width},height=${height},left=${(window.innerWidth - width) / 2},top=${(window.innerHeight - height) / 2}`);
  return w;
};

exports.openIdpSelector = openIdpSelector;