'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = require('./type_detector');

var _type_detector2 = _interopRequireDefault(_type_detector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildEmitCollector(resultObj) {
  return function (key, value) {
    var keyType = (0, _type_detector2.default)(key);
    var valueType = (0, _type_detector2.default)(value);

    if (!(keyType === 'NULL' || keyType === 'UNDEFINED' || valueType === 'NULL' || valueType === 'UNDEFINED')) {
      if (!resultObj[key]) {
        resultObj[key] = [];
      }
      resultObj[key].push(value);
    }
  };
} /*
   * This is Collector mixin - its create layout for object walker and result collection
   */


function buildCollectorLayout(workFn) {
  return function (inObj) {
    var result = {};
    var argType = (0, _type_detector2.default)(inObj);
    var emit = buildEmitCollector(result);

    switch (argType) {
      case 'ARRAY':
        inObj.forEach(function (item) {
          workFn(item, emit);
        });
        break;
      case 'HASH':
        Object.keys(inObj).forEach(function (key) {
          workFn(key, inObj[key], emit);
        });
        break;
      default:
        throw Error('cant work with object type |' + argType + '|');
    }
    return result;
  };
}

exports.default = buildCollectorLayout;