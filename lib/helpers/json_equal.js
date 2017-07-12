"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * Simply equality checker
 *
 * not fast, but dont get it
 */

function jsonEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

exports.default = jsonEqual;