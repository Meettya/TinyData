'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = require('./type_detector');

var _type_detector2 = _interopRequireDefault(_type_detector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function doExtendObject(original, addon) {
  var addonType = void 0;
  var result = {};

  if ((0, _type_detector2.default)(original) !== 'HASH') {
    throw TypeError('must called with object, but get |' + original + '|');
  }
  if ((0, _type_detector2.default)(addon) !== 'HASH') {
    return original;
  }
  Object.keys(original).forEach(function (key) {
    addonType = (0, _type_detector2.default)(addon[key]);
    if (!(addonType === 'NULL' || addonType === 'UNDEFINED')) {
      result[key] = addon[key];
    } else {
      result[key] = original[key];
    }
  });
  return result;
} /*
   * Object Extender, sort of Object.assign
   */
exports.default = doExtendObject;