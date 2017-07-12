'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = require('./type_detector');

var _type_detector2 = _interopRequireDefault(_type_detector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * This method parse arg and may ensure its type
 */
function argParser(arg, argName, strictType) {
  var parsedArg = void 0;
  var argType = (0, _type_detector2.default)(arg);
  var errFormatter = function errFormatter(errString, argType) {
    return errString + '\n|argName| = |' + argName + '|\n|type| = |' + argType + '|\n|arg| = |#{arg}|';
  };

  switch (argType) {
    case 'STRING':
      try {
        parsedArg = ['REGEXP', RegExp(arg)];
      } catch (e) {
        throw SyntaxError(errFormatter('cant compile this String to RegExp', argType));
      }
      break;
    case 'REGEXP':
      parsedArg = ['REGEXP', arg];
      break;
    case 'FUNCTION':
      parsedArg = ['FUNCTION', arg];
      break;
    default:
      throw TypeError(errFormatter('argument must be String, RegExp or Function, but got', argType));
  }

  if (strictType && parsedArg[0] !== strictType.toUpperCase()) {
    throw TypeError(errFormatter('argument must be ' + strictType + ', but got', argType));
  }
  return parsedArg;
} /*
   * This is argument parser helper
   */
exports.default = argParser;