"use strict";

var _popup = require("../popup");

var _specHelpers = require("./spec-helpers");

var _storage = require("../storage");

/* eslint-env jest */
beforeEach(_specHelpers.polyfillWindow);
afterEach(_specHelpers.polyunfillWindow);
describe('storageHandler', () => {
  let store;
  let handler;
  beforeEach(() => {
    store = (0, _storage.defaultStorage)();
    handler = (0, _popup.storageHandler)(store);
  });
  it('implements getItem', async () => {
    expect.assertions(1);
    await store.setItem('foo', 'bar');
    const resp = await handler({
      id: '12345',
      method: 'storage/getItem',
      args: ['foo']
    });
    expect(resp).toEqual({
      id: '12345',
      ret: 'bar'
    });
  });
  it('implements setItem', async () => {
    expect.assertions(2);
    const resp = await handler({
      id: '12345',
      method: 'storage/setItem',
      args: ['foo', 'bar']
    });
    expect(resp).toEqual({
      id: '12345',
      ret: null
    });
    expect((await store.getItem('foo'))).toEqual('bar');
  });
  it('implements removeItem', async () => {
    expect.assertions(2);
    await store.setItem('foo', 'bar');
    const resp = await handler({
      id: '12345',
      method: 'storage/removeItem',
      args: ['foo']
    });
    expect(resp).toEqual({
      id: '12345',
      ret: null
    });
    expect((await store.getItem('foo'))).toEqual(null);
  });
  it('ignores unknown methods', async () => {
    expect.assertions(1);
    const resp = await handler({
      id: '12345',
      method: 'unknown_method',
      args: ['a', 'b', 'c']
    });
    expect(resp).toBeNull();
  });
});
describe('loginHandler', () => {
  const options = {
    popupUri: 'https://localhost/select-idp',
    callbackUri: 'https://localhost/callback',
    storage: (0, _storage.defaultStorage)()
  };
  it('returns the loginOptions', async () => {
    expect.assertions(1);
    const handler = (0, _popup.loginHandler)(options, () => {});

    const _options = await handler({
      id: '12345',
      method: 'getLoginOptions',
      args: []
    });

    expect(_options).toEqual({
      id: '12345',
      ret: {
        popupUri: options.popupUri,
        callbackUri: options.callbackUri
      }
    });
  });
  it('captures a found session', async () => {
    expect.assertions(3);
    const mockCallback = jest.fn();
    const handler = (0, _popup.loginHandler)(options, mockCallback);
    const session = {
      idp: 'https://example.com',
      webId: 'https://me.example.com/profile#me'
    };

    const _sessionResp = await handler({
      id: '12345',
      method: 'foundSession',
      args: [session]
    });

    expect(_sessionResp).toEqual({
      id: '12345',
      ret: null
    });
    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.calls[0][0]).toEqual(session);
  });
  it('ignores unknown methods', async () => {
    expect.assertions(1);
    const handler = (0, _popup.loginHandler)(options, () => {});
    const resp = await handler({
      id: '12345',
      method: 'unknown_method',
      args: ['a', 'b', 'c']
    });
    expect(resp).toBeNull();
  });
});
describe('appOriginHandler', () => {
  it('responds with the window origin', async () => {
    expect.assertions(1);
    const resp = await (0, _popup.appOriginHandler)({
      id: '12345',
      method: 'getAppOrigin',
      args: []
    });
    expect(resp).toEqual({
      id: '12345',
      ret: 'https://app.biz'
    });
  });
  it('ignores unknown methods', async () => {
    expect.assertions(1);
    const resp = await (0, _popup.appOriginHandler)({
      id: '12345',
      method: 'somethingCompletelyDifferent',
      args: []
    });
    expect(resp).toBeNull();
  });
});
describe('startPopupServer', () => {
  it('rejects if loginOptions does not include both popupUri and callbackUri', async () => {
    expect.assertions(1);
    const store = (0, _storage.defaultStorage)();
    await expect((0, _popup.startPopupServer)(store, window, {
      popupUri: '',
      callbackUri: '',
      storage: store
    })).rejects.toBeInstanceOf(Error);
  });
  it('resolves to the captured session once it captures the "foundSession" method', async () => {
    expect.assertions(1);
    const store = (0, _storage.defaultStorage)();
    const session = {
      idp: 'https://localhost',
      webId: 'https://localhost/profile#me'
    };
    const sessionPromise = (0, _popup.startPopupServer)(store, window, {
      popupUri: 'https://app.biz/select-idp',
      callbackUri: 'https://app.biz/callback',
      storage: store
    });
    window.postMessage({
      'solid-auth-client': {
        id: '12345',
        method: 'foundSession',
        args: [session]
      }
    }, window.location.origin);
    const resolvedSession = await sessionPromise;
    expect(resolvedSession).toEqual(session);
  });
});