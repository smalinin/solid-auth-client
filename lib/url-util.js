'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/* eslint-env browser */

var currentUrl = exports.currentUrl = function currentUrl() {
  return window.location.href;
};

var currentUrlNoParams = exports.currentUrlNoParams = function currentUrlNoParams() {
  return window.location.origin + window.location.pathname;
};

var navigateTo = exports.navigateTo = function navigateTo(url) {
  window.location.href = url;
};

var originOf = exports.originOf = function originOf(url) {
  return new URL(url).origin;
};

var toUrlString = exports.toUrlString = function toUrlString(url) {
  if (typeof url !== 'string') {
    url = 'url' in url ? url.url : url.toString();
  }
  return new URL(url, currentUrl()).toString();
};