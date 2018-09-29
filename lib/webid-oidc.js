"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchWithCredentials = exports.requiresAuth = exports.getRegisteredRp = exports.logout = exports.currentSession = exports.login = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var authorization = _interopRequireWildcard(require("auth-header"));

var _oidcRp = _interopRequireDefault(require("@solid/oidc-rp"));

var _PoPToken = _interopRequireDefault(require("@solid/oidc-rp/lib/PoPToken"));

var _urlUtil = require("./url-util");

var _storage = require("./storage");

/* global RequestInfo, Response */
const login = async (idp, options) => {
  try {
    const rp = await getRegisteredRp(idp, options);
    await saveAppHashFragment(options.storage);
    return sendAuthRequest(rp, options);
  } catch (err) {
    console.warn('Error logging in with WebID-OIDC');
    console.error(err);
    return null;
  }
};

exports.login = login;

const currentSession = async (storage = (0, _storage.defaultStorage)()) => {
  try {
    const rp = await getStoredRp(storage);

    if (!rp) {
      return null;
    }

    const url = (0, _urlUtil.currentUrl)();

    if (!url || !url.includes('#access_token=')) {
      return null;
    }

    const storeData = await (0, _storage.getData)(storage);
    const session = await rp.validateResponse(url, storeData);

    if (!session) {
      return null;
    }

    await restoreAppHashFragment(storage);
    return (0, _objectSpread2.default)({}, session, {
      webId: session.idClaims.sub,
      idp: session.issuer
    });
  } catch (err) {
    console.warn('Error finding a WebID-OIDC session');
    console.error(err);
    return null;
  }
};

exports.currentSession = currentSession;

const logout = storage => getStoredRp(storage).then(rp => rp ? rp.logout() : undefined).catch(err => {
  console.warn('Error logging out of the WebID-OIDC session');
  console.error(err);
});

exports.logout = logout;

const getRegisteredRp = (idp, options) => getStoredRp(options.storage).then(rp => {
  if (rp && rp.provider.url === idp) {
    return rp;
  }

  return registerRp(idp, options).then(rp => storeRp(options.storage, idp, rp));
});

exports.getRegisteredRp = getRegisteredRp;

async function getStoredRp(storage) {
  const data = await (0, _storage.getData)(storage);
  const rpConfig = data.rpConfig;

  if (rpConfig) {
    rpConfig.store = storage;
    return _oidcRp.default.from(rpConfig);
  } else {
    return null;
  }
}

async function storeRp(storage, idp, rp) {
  await (0, _storage.updateStorage)(storage, data => (0, _objectSpread2.default)({}, data, {
    rpConfig: rp
  }));
  return rp;
}

const registerRp = (idp, {
  storage,
  callbackUri
}) => {
  const responseType = 'id_token token';
  const registration = {
    issuer: idp,
    grant_types: ['implicit'],
    redirect_uris: [callbackUri],
    response_types: [responseType],
    scope: 'openid profile'
  };
  const options = {
    defaults: {
      authenticate: {
        redirect_uri: callbackUri,
        response_type: responseType
      }
    },
    store: storage
  };
  return _oidcRp.default.register(idp, registration, options);
};

const sendAuthRequest = async (rp, {
  callbackUri,
  storage
}) => {
  const data = await (0, _storage.getData)(storage);
  const url = await rp.createRequest({
    redirect_uri: callbackUri
  }, data);
  await (0, _storage.updateStorage)(storage, () => data);
  return (0, _urlUtil.navigateTo)(url);
};

const saveAppHashFragment = store => (0, _storage.updateStorage)(store, data => (0, _objectSpread2.default)({}, data, {
  appHashFragment: window.location.hash
}));

const restoreAppHashFragment = store => (0, _storage.updateStorage)(store, data => {
  window.location.hash = data.appHashFragment;
  delete data.appHashFragment;
  return data;
});
/**
 * Answers whether a HTTP response requires WebID-OIDC authentication.
 */


const requiresAuth = resp => {
  if (resp.status !== 401) {
    return false;
  }

  const wwwAuthHeader = resp.headers.get('www-authenticate');

  if (!wwwAuthHeader) {
    return false;
  }

  const auth = authorization.parse(wwwAuthHeader);
  return auth.scheme === 'Bearer' && auth.params && auth.params.scope === 'openid webid';
};
/**
 * Fetches a resource, providing the WebID-OIDC ID Token as authentication.
 * Assumes that the resource has requested those tokens in a previous response.
 */


exports.requiresAuth = requiresAuth;

const fetchWithCredentials = session => async (fetch, input, options) => {
  const popToken = await _PoPToken.default.issueFor((0, _urlUtil.toUrlString)(input), session);
  const authenticatedOptions = (0, _objectSpread2.default)({}, options, {
    credentials: 'include',
    headers: (0, _objectSpread2.default)({}, options && options.headers ? options.headers : {}, {
      authorization: `Bearer ${popToken}`
    })
  });
  return fetch(input, authenticatedOptions);
};

exports.fetchWithCredentials = fetchWithCredentials;