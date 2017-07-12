'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeDetect = require('type-detect');

var _typeDetect2 = _interopRequireDefault(_typeDetect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getItType(val) {
  // for some reason 'type-detect' dont do it
  if (val === false || val === true) {
    return 'BOOLEAN';
  }
  switch ((0, _typeDetect2.default)(val)) {
    case 'Object':
      return 'HASH';
    case 'Array':
      return 'ARRAY';
    case 'string':
      return 'STRING';
    case 'number':
      return 'NUMBER';
    case 'null':
      return 'NULL';
    case 'undefined':
      return 'UNDEFINED';
    case 'function':
      return 'FUNCTION';
    case 'RegExp':
      return 'REGEXP';
    case 'Date':
      return 'DATE';
    case 'Arguments':
      return 'ARGUMENTS';
    default:
      return 'OTHER';
  }
} /*
   * This is type detector for any JS type.
   */
exports.default = getItType;