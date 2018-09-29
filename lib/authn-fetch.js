"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authnFetch = authnFetch;

require("isomorphic-fetch");

var _urlUtil = require("./url-util");

var _host = require("./host");

var _session = require("./session");

var WebIdOidc = _interopRequireWildcard(require("./webid-oidc"));

/* global fetch, RequestInfo, Response */
// Store the global fetch, so the user can safely override it
const globalFetch = fetch;

function authnFetch(storage) {
  return async (input, options) => {
    options = options || {};
    const session = await (0, _session.getSession)(storage);
    const shouldShareCreds = await shouldShareCredentials(storage)(input);

    if (session && shouldShareCreds) {
      return fetchWithCredentials(session, input, options);
    }

    const resp = await globalFetch(input, options);

    if (resp.status === 401) {
      await (0, _host.updateHostFromResponse)(storage)(resp);
      const shouldShareCreds = await shouldShareCredentials(storage)(input);

      if (session && shouldShareCreds) {
        return fetchWithCredentials(session, input, options);
      }
    }

    return resp;
  };
}

function shouldShareCredentials(storage) {
  return async input => {
    const session = await (0, _session.getSession)(storage);

    if (!session) {
      return false;
    }

    const requestHost = await (0, _host.getHost)(storage)((0, _urlUtil.toUrlString)(input));
    return requestHost != null && requestHost.requiresAuth;
  };
}

const fetchWithCredentials = async (session, input, options) => {
  return WebIdOidc.fetchWithCredentials(session)(globalFetch, input, options);
};