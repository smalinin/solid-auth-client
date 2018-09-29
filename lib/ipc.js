"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineHandlers = exports.server = exports.client = void 0;

var _v = _interopRequireDefault(require("uuid/v4"));

const NAMESPACE = 'solid-auth-client';

const namespace = data => ({
  [NAMESPACE]: data
});

const getNamespacedPayload = eventData => {
  if (!eventData || typeof eventData !== 'object') {
    return null;
  }

  const payload = eventData[NAMESPACE];

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return payload;
};

const getResponse = eventData => {
  const resp = getNamespacedPayload(eventData);

  if (!resp) {
    return null;
  }

  const id = resp.id,
        ret = resp.ret;
  return id != null && typeof id === 'string' && resp.hasOwnProperty('ret') ? {
    id,
    ret
  } : null;
};

const getRequest = eventData => {
  const req = getNamespacedPayload(eventData);

  if (!req) {
    return null;
  }

  const id = req.id,
        method = req.method,
        args = req.args;
  return id != null && typeof id === 'string' && typeof method === 'string' && Array.isArray(args) ? {
    id,
    method,
    args
  } : null;
};

const client = (serverWindow, serverOrigin) => request => {
  return new Promise((resolve, reject) => {
    const reqId = (0, _v.default)();

    const responseListener = event => {
      const data = event.data,
            origin = event.origin;
      const resp = getResponse(data);

      if (serverOrigin !== '*' && origin !== serverOrigin || !resp) {
        return;
      }

      if (resp.id !== reqId) {
        return;
      }

      resolve(resp.ret);
      window.removeEventListener('message', responseListener);
    };

    window.addEventListener('message', responseListener);
    serverWindow.postMessage({
      'solid-auth-client': {
        id: reqId,
        method: request.method,
        args: request.args
      }
    }, serverOrigin);
  });
};

exports.client = client;

const server = (clientWindow, clientOrigin) => handle => {
  const messageListener = async event => {
    const data = event.data,
          origin = event.origin;
    const req = getRequest(data);

    if (!req) {
      return;
    }

    if (origin !== clientOrigin) {
      console.warn(`SECURITY WARNING: solid-auth-client is listening for messages from ${clientOrigin}, ` + `but received a message from ${origin}.  Ignoring the message.`);
      return;
    }

    const resp = await handle(req);

    if (resp) {
      clientWindow.postMessage(namespace(resp), clientOrigin);
    }
  };

  const _server = {
    start: () => {
      window.addEventListener('message', messageListener);
      return _server;
    },
    stop: () => {
      window.removeEventListener('message', messageListener);
      return _server;
    }
  };
  return _server;
};

exports.server = server;

const combineHandlers = (...handlers) => req => handlers.map(handler => handler(req)).find(promise => promise !== null);

exports.combineHandlers = combineHandlers;