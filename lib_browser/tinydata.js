(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("TinyData", [], factory);
	else if(typeof exports === 'object')
		exports["TinyData"] = factory();
	else
		root["TinyData"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeDetect = __webpack_require__(5);

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
module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = __webpack_require__(0);

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
module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = __webpack_require__(0);

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
module.exports = exports['default'];

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This is tiny data-mining engine
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * work as mapReduce, but in some different way and use RegExp as path pointer
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regexp_dot_forger = __webpack_require__(4);

var _regexp_dot_forger2 = _interopRequireDefault(_regexp_dot_forger);

var _stringificator = __webpack_require__(7);

var _stringificator2 = _interopRequireDefault(_stringificator);

var _finalizer = __webpack_require__(9);

var _finalizer2 = _interopRequireDefault(_finalizer);

var _log_state = __webpack_require__(10);

var _log_state2 = _interopRequireDefault(_log_state);

var _arg_parser = __webpack_require__(1);

var _arg_parser2 = _interopRequireDefault(_arg_parser);

var _collector = __webpack_require__(2);

var _collector2 = _interopRequireDefault(_collector);

var _object_extender = __webpack_require__(11);

var _object_extender2 = _interopRequireDefault(_object_extender);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// internal delimiter, as "special symbol"
var dotInternal = '\uFE45';
var dotExternal = '.';

var TinyData = function () {
  function TinyData() {
    var originalObj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, TinyData);

    this.originalObj = originalObj;
    this.options = options;
    // take user RegExp (as string or RegExp) and replace dots to dotInternal, not applied to function !!!!
    this.isConvertIncomePatterns = true;
    // this is logger status parser and keeper
    this.logger = new _log_state2.default(options);
    // to transform path delimiter
    this.dotForger = new _regexp_dot_forger2.default(dotInternal, { log: this.logger.mustDo('logging') });
    this.doTransormRegExp = this.doTransormRegExp.bind(this);
    this.stringificator = new _stringificator2.default(originalObj, dotInternal, this.doTransormRegExp, { log: this.logger.mustDo('logging') });
    this.finalizer = new _finalizer2.default(dotInternal, dotExternal);
  }

  /*
   * This method proceed 'seeking' through all stringifyed object and do some thing,
   * then may do some finalization code
   * Builded for common case of usage,
   * when rule is RegExp and we are want to map matched result in direct order:
   * first capture -> key
   * second capture -> value
   */


  _createClass(TinyData, [{
    key: 'search',
    value: function search(inRule, finalizeFunc, interpSequence) {
      var sequence = (0, _object_extender2.default)({ key: 1, value: 2 }, interpSequence);

      if (this.logger.mustDo('warning') && sequence.key >= sequence.value) {
        console.warn('for reverse interpretation direction it would be better to use #searchBack()\n|key_order| = |' + sequence.key + '|\n|value_order| = |' + sequence.value + '|');
      }
      return this.seekOutAny(inRule, finalizeFunc, sequence);
    }

    /*
     * This method proceed 'seeking' through all stringifyed object and do some thing,
     * then may do some finalization code
     * Builded for common case of usage,
     * when rule is RegExp and we are want to map matched result in reverse order:
     * first capture -> value
     * second capture -> key
     */

  }, {
    key: 'searchBack',
    value: function searchBack(inRule, finalizeFunc, interpSequence) {
      var sequence = (0, _object_extender2.default)({ key: 2, value: 1 }, interpSequence);

      if (this.logger.mustDo('warning') && sequence.value >= sequence.key) {
        console.warn('for direct interpretation direction it would be better to use #search()\n|key_order| = |' + sequence.key + '|\n|value_order| = |' + sequence.value + '|');
      }
      return this.seekOutAny(inRule, finalizeFunc, sequence);
    }

    /*
     * For backward compatibility
     */

  }, {
    key: 'seekOut',
    value: function seekOut(inRule, finalizeFunc, interpSequence) {
      return this.search(inRule, finalizeFunc, interpSequence);
    }
  }, {
    key: 'seekOutVerso',
    value: function seekOutVerso(inRule, finalizeFunc, interpSequence) {
      return this.searchBack(inRule, finalizeFunc, interpSequence);
    }

    /*
     * Timing counter
     */

  }, {
    key: 'timeOnDemand',
    value: function timeOnDemand(label, fn) {
      var res = void 0;
      var isTimed = this.logger.mustDo('timing');

      if (isTimed) {
        console.time(label);
      }
      res = fn();
      if (isTimed) {
        console.timeEnd(label);
      }
      return res;
    }

    /*
     * This method stringify our original object (materialize full path + add leaf )
     * may be used to speed up all by reduce stringification work
     */

  }, {
    key: 'rakeStringify',
    value: function rakeStringify(inStringifyFilter) {
      var _this = this;

      var inStubsList = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      return this.timeOnDemand('rakeStringify', function () {
        return _this.stringificator.stringifyObject(inStringifyFilter, inStubsList);
      });
    }

    /*
     * This method transform incoming RegExp changes \. (dot) to internal dot-substituter
     */

  }, {
    key: 'doTransormRegExp',
    value: function doTransormRegExp(originalRegexp) {
      if (originalRegexp.source.indexOf(dotInternal) !== -1) {
        if (this.logger.mustDo('logging')) {
          console.log('doTransormRegExp: skip converting for |' + originalRegexp + '|');
        }
        return originalRegexp;
      }
      return this.dotForger.doForgeDots(originalRegexp);
    }

    /*
     * This method may be used for user-defined function
     */

  }, {
    key: 'getInternalDelimiter',
    value: function getInternalDelimiter() {
      return this.getPathDelimiter('INTERNAL');
    }

    /*
     * This method return any delimiter
     */

  }, {
    key: 'getPathDelimiter',
    value: function getPathDelimiter(type) {
      var ucType = type.toUpperCase();

      switch (ucType) {
        case 'INTERNAL':
          return dotInternal;
        case 'EXTERNAL':
          return dotExternal;
        default:
          throw Error('dont know path delimiter, named |' + type + '|, mistype?');
      }
    }

    /*
     * This method return data by path
     *
     * It will auto-recognize delimiter, or use forced
     */

  }, {
    key: 'getDataByPath',
    value: function getDataByPath(path, obj, forceDelimiter) {
      var steps = void 0,
          res = void 0;

      if (!forceDelimiter) {
        if (path && path.indexOf(dotInternal) !== -1) {
          forceDelimiter = dotInternal;
        } else {
          forceDelimiter = dotExternal;
        }
      }
      if (!obj) {
        obj = this.originalObj;
      }
      steps = path.split(forceDelimiter);
      res = steps.reduce(function (obj, val) {
        return obj[val];
      }, obj);
      return res;
    }

    /*
     * This is realy search processor code, one for any directions
     */

  }, {
    key: 'seekOutAny',
    value: function seekOutAny(inRule, finalizeFunc, interpSequence) {
      var seekRuleType = void 0,
          seekRule = void 0,
          seekFunction = void 0,
          rakedObject = void 0;
      var stringifyedObject = this.rakeStringify(); // or next line glued

      var _argParser = (0, _arg_parser2.default)(inRule, 'seek_rule');

      var _argParser2 = _slicedToArray(_argParser, 2);

      seekRuleType = _argParser2[0];
      seekRule = _argParser2[1];

      seekFunction = this.buildSeekFunction(seekRuleType, seekRule, interpSequence);
      rakedObject = this.proceedSeekingOut(seekFunction, stringifyedObject);
      return this.proceedFinalization(finalizeFunc, rakedObject);
    }

    /*
     * Internal method for wrap timing
     */

  }, {
    key: 'proceedFinalization',
    value: function proceedFinalization(finalizeFunc, rakedObject) {
      var _this2 = this;

      return this.timeOnDemand('finalization', function () {
        return _this2.finalizer.finalizeResult(finalizeFunc, rakedObject);
      });
    }

    /*
     * Internal method for wrap timing
     */

  }, {
    key: 'proceedSeekingOut',
    value: function proceedSeekingOut(seekFunction, stringifyedObject) {
      return this.timeOnDemand('searching', function () {
        return seekFunction(stringifyedObject);
      });
    }

    /*
     * his method return rake function itself
     *
     * its different for RegExp or Function
     */

  }, {
    key: 'buildSeekFunction',
    value: function buildSeekFunction(seekRuleType, seekRule, interpSequence) {
      switch (seekRuleType) {
        case 'REGEXP':
          // if incoming RegExp needed to be transformed
          if (this.isConvertIncomePatterns) {
            seekRule = this.doTransormRegExp(seekRule);
          }
          // if user send RegExp - transform it into function
          return (0, _collector2.default)(function (item, emit) {
            var matchedObj = item.match(seekRule);

            if (matchedObj) {
              emit(matchedObj[interpSequence.key], matchedObj[interpSequence.value]);
            }
          });
        case 'FUNCTION':
          // nothing to do
          return (0, _collector2.default)(seekRule);
        default:
          throw Error('cant process type |' + seekRuleType + '|, halt!');
      }
    }
  }]);

  return TinyData;
}();

exports.default = TinyData;
module.exports = exports['default'];

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This is RegExp helper for TinyData
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Its convert users RegExp with escaped dot \.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  or dot as a part of character set [.] - like this,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  by replace all of that to something else
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Raison d'être - inside TinyData for entity devision used dot_replacer,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *  but for the simplicity we are MAY (and I believe MUST) cloak this fact.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = __webpack_require__(0);

var _type_detector2 = _interopRequireDefault(_type_detector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CHARACTER_SET_RE = /((?:^|(?:(?:^|[^\\])\\(?:\\{2})*\\)|[^\\]+))(\[(?:]|(?:[^\\]+])|(?:.*?[^\\]+])|(?:.*?[^\\]+\\(?:\\{2})*\\])))/;
var ESCAPED_DOT_RE = /((?:^|[^\\])(?:\\{2})*)(\\\.)/;

var RegExpDotForger = function () {
  function RegExpDotForger(dotSubstitute) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, RegExpDotForger);

    this.dotSubstitute = dotSubstitute;
    this.isDoLogging = options.log;
    this.doValidateDotSubstitute(this.dotSubstitute);
  }

  /*
   * Ensure we are have valid substitute
   */


  _createClass(RegExpDotForger, [{
    key: 'doValidateDotSubstitute',
    value: function doValidateDotSubstitute(dotSubstitute) {
      if (!(dotSubstitute && (0, _type_detector2.default)(dotSubstitute) === 'STRING')) {
        throw TypeError('constructor must be called with string as dot substitute, but got:\n|dotSubstitute| = |' + dotSubstitute + '|');
      }
    }

    /*
     * This method return pattern RegExp by name or throw exception
     */

  }, {
    key: 'getPatternByName',
    value: function getPatternByName(patternName) {
      switch (patternName.toUpperCase()) {
        case 'CHARACTER_SET':
          return CHARACTER_SET_RE;
        case 'ESCAPED_DOT':
          return ESCAPED_DOT_RE;
        default:
          throw Error('so far dont know pattern, named |' + patternName + '|, mistype?');
      }
    }

    /*
     * This method forge dots in incoming regexp and return 'corrected' one
     */

  }, {
    key: 'doForgeDots',
    value: function doForgeDots(inRegexp) {
      if (!(inRegexp && (0, _type_detector2.default)(inRegexp) === 'REGEXP')) {
        throw TypeError('must be called with RegExp, but got:\n|inRegexp| = |' + inRegexp + '|');
      }
      // sequence is important!
      // character set, THAN escaped dots
      return new RegExp(this.forgeEscapedDots(this.forgeCharacterSet(inRegexp.source)));
    }

    /*
     * This method change dots to substitute in character sets
     */

  }, {
    key: 'forgeCharacterSet',
    value: function forgeCharacterSet(inRegexpAsString) {
      var _this = this;

      var globalCharSetPattern = new RegExp(this.getPatternByName('character_set').source, 'g');
      var dotReplacer = function dotReplacer(match, captured1, captured2) {
        // in this case we are change ONLY dot |.| and keep alive escape symbol
        // because escape symbol have now power on dot in character set
        var forgedSet = captured2.replace(/\./g, _this.dotSubstitute);
        return '' + captured1 + forgedSet;
      };

      return inRegexpAsString.replace(globalCharSetPattern, dotReplacer);
    }

    /*
     * This method change escaped dots to substitute
     */

  }, {
    key: 'forgeEscapedDots',
    value: function forgeEscapedDots(inRegexpAsString) {
      var _this2 = this;

      var globalEscapedDotPattern = new RegExp(this.getPatternByName('escaped_dot').source, 'g');
      var escapedDotReplacer = function escapedDotReplacer(match, captured1, captured2) {
        // in this case we are change BOTH dot |.| AND escape symbol
        // because its one escape symbol
        var forgedSet = captured2.replace(/\\\./, _this2.dotSubstitute);
        return '' + captured1 + forgedSet;
      };

      return inRegexpAsString.replace(globalEscapedDotPattern, escapedDotReplacer);
    }
  }]);

  return RegExpDotForger;
}();

exports.default = RegExpDotForger;
module.exports = exports['default'];

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

/* !
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var promiseExists = typeof Promise === 'function';
var globalObject = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : self; // eslint-disable-line
var isDom = 'location' in globalObject && 'document' in globalObject;
var symbolExists = typeof Symbol !== 'undefined';
var mapExists = typeof Map !== 'undefined';
var setExists = typeof Set !== 'undefined';
var weakMapExists = typeof WeakMap !== 'undefined';
var weakSetExists = typeof WeakSet !== 'undefined';
var dataViewExists = typeof DataView !== 'undefined';
var symbolIteratorExists = symbolExists && typeof Symbol.iterator !== 'undefined';
var symbolToStringTagExists = symbolExists && typeof Symbol.toStringTag !== 'undefined';
var setEntriesExists = setExists && typeof Set.prototype.entries === 'function';
var mapEntriesExists = mapExists && typeof Map.prototype.entries === 'function';
var setIteratorPrototype = setEntriesExists && Object.getPrototypeOf(new Set().entries());
var mapIteratorPrototype = mapEntriesExists && Object.getPrototypeOf(new Map().entries());
var arrayIteratorExists = symbolIteratorExists && typeof Array.prototype[Symbol.iterator] === 'function';
var arrayIteratorPrototype = arrayIteratorExists && Object.getPrototypeOf([][Symbol.iterator]());
var stringIteratorExists = symbolIteratorExists && typeof String.prototype[Symbol.iterator] === 'function';
var stringIteratorPrototype = stringIteratorExists && Object.getPrototypeOf(''[Symbol.iterator]());
var toStringLeftSliceLength = 8;
var toStringRightSliceLength = -1;
/**
 * ### typeOf (obj)
 *
 * Uses `Object.prototype.toString` to determine the type of an object,
 * normalising behaviour across engine versions & well optimised.
 *
 * @param {Mixed} object
 * @return {String} object type
 * @api public
 */
module.exports = function typeDetect(obj) {
  /* ! Speed optimisation
   * Pre:
   *   string literal     x 3,039,035 ops/sec ±1.62% (78 runs sampled)
   *   boolean literal    x 1,424,138 ops/sec ±4.54% (75 runs sampled)
   *   number literal     x 1,653,153 ops/sec ±1.91% (82 runs sampled)
   *   undefined          x 9,978,660 ops/sec ±1.92% (75 runs sampled)
   *   function           x 2,556,769 ops/sec ±1.73% (77 runs sampled)
   * Post:
   *   string literal     x 38,564,796 ops/sec ±1.15% (79 runs sampled)
   *   boolean literal    x 31,148,940 ops/sec ±1.10% (79 runs sampled)
   *   number literal     x 32,679,330 ops/sec ±1.90% (78 runs sampled)
   *   undefined          x 32,363,368 ops/sec ±1.07% (82 runs sampled)
   *   function           x 31,296,870 ops/sec ±0.96% (83 runs sampled)
   */
  var typeofObj = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
  if (typeofObj !== 'object') {
    return typeofObj;
  }

  /* ! Speed optimisation
   * Pre:
   *   null               x 28,645,765 ops/sec ±1.17% (82 runs sampled)
   * Post:
   *   null               x 36,428,962 ops/sec ±1.37% (84 runs sampled)
   */
  if (obj === null) {
    return 'null';
  }

  /* ! Spec Conformance
   * Test: `Object.prototype.toString.call(window)``
   *  - Node === "[object global]"
   *  - Chrome === "[object global]"
   *  - Firefox === "[object Window]"
   *  - PhantomJS === "[object Window]"
   *  - Safari === "[object Window]"
   *  - IE 11 === "[object Window]"
   *  - IE Edge === "[object Window]"
   * Test: `Object.prototype.toString.call(this)``
   *  - Chrome Worker === "[object global]"
   *  - Firefox Worker === "[object DedicatedWorkerGlobalScope]"
   *  - Safari Worker === "[object DedicatedWorkerGlobalScope]"
   *  - IE 11 Worker === "[object WorkerGlobalScope]"
   *  - IE Edge Worker === "[object WorkerGlobalScope]"
   */
  if (obj === globalObject) {
    return 'global';
  }

  /* ! Speed optimisation
   * Pre:
   *   array literal      x 2,888,352 ops/sec ±0.67% (82 runs sampled)
   * Post:
   *   array literal      x 22,479,650 ops/sec ±0.96% (81 runs sampled)
   */
  if (Array.isArray(obj) && (symbolToStringTagExists === false || !(Symbol.toStringTag in obj))) {
    return 'Array';
  }

  if (isDom) {
    /* ! Spec Conformance
     * (https://html.spec.whatwg.org/multipage/browsers.html#location)
     * WhatWG HTML$7.7.3 - The `Location` interface
     * Test: `Object.prototype.toString.call(window.location)``
     *  - IE <=11 === "[object Object]"
     *  - IE Edge <=13 === "[object Object]"
     */
    if (obj === globalObject.location) {
      return 'Location';
    }

    /* ! Spec Conformance
     * (https://html.spec.whatwg.org/#document)
     * WhatWG HTML$3.1.1 - The `Document` object
     * Note: Most browsers currently adher to the W3C DOM Level 2 spec
     *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-26809268)
     *       which suggests that browsers should use HTMLTableCellElement for
     *       both TD and TH elements. WhatWG separates these.
     *       WhatWG HTML states:
     *         > For historical reasons, Window objects must also have a
     *         > writable, configurable, non-enumerable property named
     *         > HTMLDocument whose value is the Document interface object.
     * Test: `Object.prototype.toString.call(document)``
     *  - Chrome === "[object HTMLDocument]"
     *  - Firefox === "[object HTMLDocument]"
     *  - Safari === "[object HTMLDocument]"
     *  - IE <=10 === "[object Document]"
     *  - IE 11 === "[object HTMLDocument]"
     *  - IE Edge <=13 === "[object HTMLDocument]"
     */
    if (obj === globalObject.document) {
      return 'Document';
    }

    /* ! Spec Conformance
     * (https://html.spec.whatwg.org/multipage/webappapis.html#mimetypearray)
     * WhatWG HTML$8.6.1.5 - Plugins - Interface MimeTypeArray
     * Test: `Object.prototype.toString.call(navigator.mimeTypes)``
     *  - IE <=10 === "[object MSMimeTypesCollection]"
     */
    if (obj === (globalObject.navigator || {}).mimeTypes) {
      return 'MimeTypeArray';
    }

    /* ! Spec Conformance
     * (https://html.spec.whatwg.org/multipage/webappapis.html#pluginarray)
     * WhatWG HTML$8.6.1.5 - Plugins - Interface PluginArray
     * Test: `Object.prototype.toString.call(navigator.plugins)``
     *  - IE <=10 === "[object MSPluginsCollection]"
     */
    if (obj === (globalObject.navigator || {}).plugins) {
      return 'PluginArray';
    }

    /* ! Spec Conformance
     * (https://html.spec.whatwg.org/multipage/webappapis.html#pluginarray)
     * WhatWG HTML$4.4.4 - The `blockquote` element - Interface `HTMLQuoteElement`
     * Test: `Object.prototype.toString.call(document.createElement('blockquote'))``
     *  - IE <=10 === "[object HTMLBlockElement]"
     */
    if (obj instanceof HTMLElement && obj.tagName === 'BLOCKQUOTE') {
      return 'HTMLQuoteElement';
    }

    /* ! Spec Conformance
     * (https://html.spec.whatwg.org/#htmltabledatacellelement)
     * WhatWG HTML$4.9.9 - The `td` element - Interface `HTMLTableDataCellElement`
     * Note: Most browsers currently adher to the W3C DOM Level 2 spec
     *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-82915075)
     *       which suggests that browsers should use HTMLTableCellElement for
     *       both TD and TH elements. WhatWG separates these.
     * Test: Object.prototype.toString.call(document.createElement('td'))
     *  - Chrome === "[object HTMLTableCellElement]"
     *  - Firefox === "[object HTMLTableCellElement]"
     *  - Safari === "[object HTMLTableCellElement]"
     */
    if (obj instanceof HTMLElement && obj.tagName === 'TD') {
      return 'HTMLTableDataCellElement';
    }

    /* ! Spec Conformance
     * (https://html.spec.whatwg.org/#htmltableheadercellelement)
     * WhatWG HTML$4.9.9 - The `td` element - Interface `HTMLTableHeaderCellElement`
     * Note: Most browsers currently adher to the W3C DOM Level 2 spec
     *       (https://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-82915075)
     *       which suggests that browsers should use HTMLTableCellElement for
     *       both TD and TH elements. WhatWG separates these.
     * Test: Object.prototype.toString.call(document.createElement('th'))
     *  - Chrome === "[object HTMLTableCellElement]"
     *  - Firefox === "[object HTMLTableCellElement]"
     *  - Safari === "[object HTMLTableCellElement]"
     */
    if (obj instanceof HTMLElement && obj.tagName === 'TH') {
      return 'HTMLTableHeaderCellElement';
    }
  }

  /* ! Speed optimisation
  * Pre:
  *   Float64Array       x 625,644 ops/sec ±1.58% (80 runs sampled)
  *   Float32Array       x 1,279,852 ops/sec ±2.91% (77 runs sampled)
  *   Uint32Array        x 1,178,185 ops/sec ±1.95% (83 runs sampled)
  *   Uint16Array        x 1,008,380 ops/sec ±2.25% (80 runs sampled)
  *   Uint8Array         x 1,128,040 ops/sec ±2.11% (81 runs sampled)
  *   Int32Array         x 1,170,119 ops/sec ±2.88% (80 runs sampled)
  *   Int16Array         x 1,176,348 ops/sec ±5.79% (86 runs sampled)
  *   Int8Array          x 1,058,707 ops/sec ±4.94% (77 runs sampled)
  *   Uint8ClampedArray  x 1,110,633 ops/sec ±4.20% (80 runs sampled)
  * Post:
  *   Float64Array       x 7,105,671 ops/sec ±13.47% (64 runs sampled)
  *   Float32Array       x 5,887,912 ops/sec ±1.46% (82 runs sampled)
  *   Uint32Array        x 6,491,661 ops/sec ±1.76% (79 runs sampled)
  *   Uint16Array        x 6,559,795 ops/sec ±1.67% (82 runs sampled)
  *   Uint8Array         x 6,463,966 ops/sec ±1.43% (85 runs sampled)
  *   Int32Array         x 5,641,841 ops/sec ±3.49% (81 runs sampled)
  *   Int16Array         x 6,583,511 ops/sec ±1.98% (80 runs sampled)
  *   Int8Array          x 6,606,078 ops/sec ±1.74% (81 runs sampled)
  *   Uint8ClampedArray  x 6,602,224 ops/sec ±1.77% (83 runs sampled)
  */
  var stringTag = symbolToStringTagExists && obj[Symbol.toStringTag];
  if (typeof stringTag === 'string') {
    return stringTag;
  }

  var objPrototype = Object.getPrototypeOf(obj);
  /* ! Speed optimisation
  * Pre:
  *   regex literal      x 1,772,385 ops/sec ±1.85% (77 runs sampled)
  *   regex constructor  x 2,143,634 ops/sec ±2.46% (78 runs sampled)
  * Post:
  *   regex literal      x 3,928,009 ops/sec ±0.65% (78 runs sampled)
  *   regex constructor  x 3,931,108 ops/sec ±0.58% (84 runs sampled)
  */
  if (objPrototype === RegExp.prototype) {
    return 'RegExp';
  }

  /* ! Speed optimisation
  * Pre:
  *   date               x 2,130,074 ops/sec ±4.42% (68 runs sampled)
  * Post:
  *   date               x 3,953,779 ops/sec ±1.35% (77 runs sampled)
  */
  if (objPrototype === Date.prototype) {
    return 'Date';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-promise.prototype-@@tostringtag)
   * ES6$25.4.5.4 - Promise.prototype[@@toStringTag] should be "Promise":
   * Test: `Object.prototype.toString.call(Promise.resolve())``
   *  - Chrome <=47 === "[object Object]"
   *  - Edge <=20 === "[object Object]"
   *  - Firefox 29-Latest === "[object Promise]"
   *  - Safari 7.1-Latest === "[object Promise]"
   */
  if (promiseExists && objPrototype === Promise.prototype) {
    return 'Promise';
  }

  /* ! Speed optimisation
  * Pre:
  *   set                x 2,222,186 ops/sec ±1.31% (82 runs sampled)
  * Post:
  *   set                x 4,545,879 ops/sec ±1.13% (83 runs sampled)
  */
  if (setExists && objPrototype === Set.prototype) {
    return 'Set';
  }

  /* ! Speed optimisation
  * Pre:
  *   map                x 2,396,842 ops/sec ±1.59% (81 runs sampled)
  * Post:
  *   map                x 4,183,945 ops/sec ±6.59% (82 runs sampled)
  */
  if (mapExists && objPrototype === Map.prototype) {
    return 'Map';
  }

  /* ! Speed optimisation
  * Pre:
  *   weakset            x 1,323,220 ops/sec ±2.17% (76 runs sampled)
  * Post:
  *   weakset            x 4,237,510 ops/sec ±2.01% (77 runs sampled)
  */
  if (weakSetExists && objPrototype === WeakSet.prototype) {
    return 'WeakSet';
  }

  /* ! Speed optimisation
  * Pre:
  *   weakmap            x 1,500,260 ops/sec ±2.02% (78 runs sampled)
  * Post:
  *   weakmap            x 3,881,384 ops/sec ±1.45% (82 runs sampled)
  */
  if (weakMapExists && objPrototype === WeakMap.prototype) {
    return 'WeakMap';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-dataview.prototype-@@tostringtag)
   * ES6$24.2.4.21 - DataView.prototype[@@toStringTag] should be "DataView":
   * Test: `Object.prototype.toString.call(new DataView(new ArrayBuffer(1)))``
   *  - Edge <=13 === "[object Object]"
   */
  if (dataViewExists && objPrototype === DataView.prototype) {
    return 'DataView';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%mapiteratorprototype%-@@tostringtag)
   * ES6$23.1.5.2.2 - %MapIteratorPrototype%[@@toStringTag] should be "Map Iterator":
   * Test: `Object.prototype.toString.call(new Map().entries())``
   *  - Edge <=13 === "[object Object]"
   */
  if (mapExists && objPrototype === mapIteratorPrototype) {
    return 'Map Iterator';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%setiteratorprototype%-@@tostringtag)
   * ES6$23.2.5.2.2 - %SetIteratorPrototype%[@@toStringTag] should be "Set Iterator":
   * Test: `Object.prototype.toString.call(new Set().entries())``
   *  - Edge <=13 === "[object Object]"
   */
  if (setExists && objPrototype === setIteratorPrototype) {
    return 'Set Iterator';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%arrayiteratorprototype%-@@tostringtag)
   * ES6$22.1.5.2.2 - %ArrayIteratorPrototype%[@@toStringTag] should be "Array Iterator":
   * Test: `Object.prototype.toString.call([][Symbol.iterator]())``
   *  - Edge <=13 === "[object Object]"
   */
  if (arrayIteratorExists && objPrototype === arrayIteratorPrototype) {
    return 'Array Iterator';
  }

  /* ! Spec Conformance
   * (http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%stringiteratorprototype%-@@tostringtag)
   * ES6$21.1.5.2.2 - %StringIteratorPrototype%[@@toStringTag] should be "String Iterator":
   * Test: `Object.prototype.toString.call(''[Symbol.iterator]())``
   *  - Edge <=13 === "[object Object]"
   */
  if (stringIteratorExists && objPrototype === stringIteratorPrototype) {
    return 'String Iterator';
  }

  /* ! Speed optimisation
  * Pre:
  *   object from null   x 2,424,320 ops/sec ±1.67% (76 runs sampled)
  * Post:
  *   object from null   x 5,838,000 ops/sec ±0.99% (84 runs sampled)
  */
  if (objPrototype === null) {
    return 'Object';
  }

  return Object.prototype.toString.call(obj).slice(toStringLeftSliceLength, toStringRightSliceLength);
};

module.exports.typeDetect = module.exports;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ }),
/* 6 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This is Stringificator for TinyData
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Its get object and return materialized path, with some changes, like:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * - filter some data
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * - cut long text values
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * change data values to stub (not realized)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = __webpack_require__(0);

var _type_detector2 = _interopRequireDefault(_type_detector);

var _json_equal = __webpack_require__(8);

var _json_equal2 = _interopRequireDefault(_json_equal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stringificator = function () {
  function Stringificator(originalObj, internalPathDelimiter, regexpTransformationFn) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    _classCallCheck(this, Stringificator);

    this.originalObj = originalObj;
    this.internalPathDelimiter = internalPathDelimiter;
    this.regexpTransformationFn = regexpTransformationFn;
    // stringification must to be cached
    this.cacheStringifyedObject = null;
    // settings object to validate cache
    this.stringificationRule = {
      stubsList: [], // nodes list, witch context will be replaced by __STUB__
      stringifyFilter: null // rule to add to stringificated object ONLY matched nodes

      // this is our seatbelt for long texts - do not put it into index
    };this.maxTextLong = 120;
    // take user RegExp (as string or RegExp) and replace dots to dotInternal, not applied to function !!!!
    this.isConvertIncomePatterns = true;
    this.isDoLogging = options.log;
  }

  /*
   * This is public method, wrapper for internal and realize a cache
   */


  _createClass(Stringificator, [{
    key: 'stringifyObject',
    value: function stringifyObject(inStringifyFilter, inStubsList) {
      var isCacheHit = false;
      var stringyFilter = this.stringificationRule.stringifyFilter;
      var stringifyStubList = this.stringificationRule.stubsList;

      // on void call use old values
      if (!inStringifyFilter) {
        inStringifyFilter = stringyFilter;
      }
      if (!inStubsList) {
        inStubsList = stringifyStubList;
      }
      isCacheHit = this.cacheStringifyedObject && (0, _json_equal2.default)(inStringifyFilter, stringyFilter) && (0, _json_equal2.default)(inStubsList, stringifyStubList);
      if (this.isDoLogging) {
        console.log('stringify cache ' + (isCacheHit ? 'hit' : 'miss'));
      }
      if (!isCacheHit) {
        this.cacheStringifyedObject = this.doStringification(inStringifyFilter, inStubsList);
      }
      return this.cacheStringifyedObject;
    }

    /*
     * This method stringify object
     */

  }, {
    key: 'doStringification',
    value: function doStringification(stringifyRule, stubsList) {
      var inObjType = void 0,
          objKeys = void 0;
      var result = [];
      // filter may be applied only in correct depth
      var filterBody = this.makeElementFilter(stringifyRule);
      // this is filter for string elements
      var stringLimiter = this.makeStringLimiter(this.maxTextLong);
      var dotSign = this.internalPathDelimiter;
      // its filter itself, assembled and ready to fire
      var isFilterPassed = stringifyRule ? filterBody : function () {
        return true;
      };
      var innnerLoop = function innnerLoop(inObj, prefix, depth) {
        inObjType = (0, _type_detector2.default)(inObj);
        switch (inObjType) {
          case 'HASH':
            objKeys = Object.keys(inObj);
            if (objKeys.length) {
              objKeys.forEach(function (key) {
                if (isFilterPassed(prefix, key, depth)) {
                  innnerLoop(inObj[key], '' + prefix + key + dotSign, depth + 1);
                }
              });
            } else {
              innnerLoop('__EMPTY__|HASH|', prefix, depth);
            }
            break;
          case 'ARRAY':
            if (inObj.length) {
              inObj.forEach(function (value, idx) {
                if (isFilterPassed(prefix, idx, depth)) {
                  innnerLoop(value, '' + prefix + idx + dotSign, depth + 1);
                }
              });
            } else {
              innnerLoop('__EMPTY__|ARRAY|', prefix, depth);
            }
            break;
          case 'NUMBER':
          case 'BOOLEAN':
          case 'NULL':
            result.push('' + prefix + inObj);
            break;
          case 'STRING':
            result.push(stringLimiter(prefix, inObj, depth));
            break;
          case 'DATE':
          case 'REGEXP':
            result.push(prefix + '__' + inObjType + '__|' + inObj + '|__');
            break;
          default:
            result.push(prefix + '__' + inObjType + '__');
        }
      };
      // TODO - check 0 on hashes, is it correct ?
      innnerLoop(this.originalObj, '', 0);
      return result;
    }

    /*
     * This method create limiter for long text
     */

  }, {
    key: 'makeStringLimiter',
    value: function makeStringLimiter(maxLength) {
      return function (fullElemPath, elemContent) {
        var elemLength = elemContent.length;
        if (elemLength >= maxLength) {
          return fullElemPath + '__LONG_TEXT__|' + elemLength + '|';
        } else {
          return '' + fullElemPath + elemContent;
        }
      };
    }

    /*
     * This method create stringify filter
     *
     * to reduce part of values to speed up stringification and seeking
     */

  }, {
    key: 'makeElementFilter',
    value: function makeElementFilter(stringifyRule) {
      var nameMatcher = void 0,
          stringifyPattern = void 0;

      if ((0, _type_detector2.default)(stringifyRule) === 'HASH' && stringifyRule.originPattern) {
        stringifyPattern = stringifyRule.originPattern;
        // if incoming RegExp needed to be transformed
        if (this.isConvertIncomePatterns) {
          stringifyPattern = this.regexpTransformationFn(stringifyPattern);
        }
        nameMatcher = function nameMatcher(matcherElemName, matcherElemOrigin) {
          return matcherElemName === stringifyRule.elementName && stringifyPattern.test(matcherElemOrigin);
        };
      } else {
        nameMatcher = function nameMatcher(matcherElemName) {
          return matcherElemName === stringifyRule.elementName;
        };
      }
      // filter may be applied only in correct depth
      return function (elemOrigin, elemName, elemDepth) {
        if (stringifyRule.applyOnDepth === elemDepth) {
          return nameMatcher(elemName, elemOrigin);
        } else {
          return true;
        }
      };
    }
  }]);

  return Stringificator;
}();

exports.default = Stringificator;
module.exports = exports['default'];

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

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
module.exports = exports["default"];

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This is Finalizer for TinyData
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Its get object and filter (and may be convert) it to natural dot notation
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = __webpack_require__(0);

var _type_detector2 = _interopRequireDefault(_type_detector);

var _arg_parser = __webpack_require__(1);

var _arg_parser2 = _interopRequireDefault(_arg_parser);

var _collector = __webpack_require__(2);

var _collector2 = _interopRequireDefault(_collector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Finalizer = function () {
  function Finalizer(dotInternal, dotExternal) {
    _classCallCheck(this, Finalizer);

    this.dotInternal = dotInternal;
    this.dotExternal = dotExternal;
    this.convertBeforeFinalizeFunction = true; // finalizeFn get already converted data
    this.convertOutResult = true; // before data returning (obsolete if convert_before_finalize_function is 'true' )
  }

  _createClass(Finalizer, [{
    key: 'finalizeResult',
    value: function finalizeResult(finalizeFn, preResultObj) {
      var finalizer = void 0;
      var finalizationName = this.getFinalizationName(finalizeFn);

      if (finalizationName) {
        finalizer = this.prepareFinalization(finalizationName, finalizeFn);
        return finalizer(preResultObj);
      }
      return preResultObj;
    }
  }, {
    key: 'getFinalizationName',
    value: function getFinalizationName(finalizeFn) {
      var isWillBeFinalized = false;

      if (finalizeFn && (0, _arg_parser2.default)(finalizeFn, 'finalizeFn', 'Function')) {
        if (this.convertBeforeFinalizeFunction) {
          return 'DECORATE_THEN_FINALAZE';
        } else {
          isWillBeFinalized = true;
        }
      }
      if (this.convertOutResult) {
        if (isWillBeFinalized) {
          return 'FINALAZE_THEN_DECORATE';
        } else {
          return 'DECORATE';
        }
      }
    }

    /*
     * This method build all finalization stuff and return simple function
     */

  }, {
    key: 'prepareFinalization',
    value: function prepareFinalization(finalizationName, finalizeFn) {
      var resultConverter = this.buildResultConvertor();
      var userFinalizer = this.buildUserFinalizer(finalizeFn);

      switch (finalizationName) {
        case 'DECORATE':
          return function (inObj) {
            return resultConverter(inObj);
          };
        case 'FINALAZE_THEN_DECORATE':
          return function (inObj) {
            return resultConverter(userFinalizer(inObj));
          };
        case 'DECORATE_THEN_FINALAZE':
          return function (inObj) {
            return userFinalizer(resultConverter(inObj));
          };
        default:
          throw Error('unknown finalization style |' + finalizationName + '| used, halt!');
      }
    }

    /*
     * This method create function to wipe 'orchid' delimiter
     */

  }, {
    key: 'makeBuffingDelimiterWeel',
    value: function makeBuffingDelimiterWeel() {
      var dotSymbol = this.dotExternal;
      var delimiterSymbol = this.dotInternal;
      var delimiterPattern = new RegExp(delimiterSymbol, 'g');

      // if it string - trim orchid delimiter (from right end) than replace it
      return function (inData) {
        var fullString = void 0;

        if ((0, _type_detector2.default)(inData) !== 'STRING') {
          return inData;
        }
        if (delimiterSymbol === inData.charAt(inData.length - 1)) {
          fullString = inData.slice(0, -1);
        } else {
          fullString = inData;
        }
        return fullString.replace(delimiterPattern, dotSymbol);
      };
    }

    /*
     * This method trim orchid internal delimiters at the end of keys AND values,
     * than replace all internal dot to external (in values and keys too)
     */

  }, {
    key: 'buildResultConvertor',
    value: function buildResultConvertor() {
      var buffingDelimiter = this.makeBuffingDelimiterWeel();

      return function (inObj) {
        var resKey = void 0,
            value = void 0;
        var result = {};

        Object.keys(inObj).forEach(function (key) {
          value = inObj[key];
          resKey = buffingDelimiter(key);
          result[resKey] = new Array(value.length); // create same size array
          value.forEach(function (item, idx) {
            result[resKey][idx] = buffingDelimiter(item);
          });
        });
        return result;
      };
    }

    /*
     * To separate logic of finalizator actually just wrapper
     */

  }, {
    key: 'buildUserFinalizer',
    value: function buildUserFinalizer(userFn) {
      return (0, _collector2.default)(userFn);
    }
  }]);

  return Finalizer;
}();

exports.default = Finalizer;
module.exports = exports['default'];

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This is log state object
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Its configured by incoming object and return turned on statuses
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = __webpack_require__(0);

var _type_detector2 = _interopRequireDefault(_type_detector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LogState = function () {
  function LogState(options) {
    _classCallCheck(this, LogState);

    // NB - options may have some another settings from main object - just ignore it
    this.options = options;
    this.state = {
      DEBUGGING: false,
      LOGGING: false,
      TIMING: false,
      WARNING: false
    };
    this.processOptions();
    this.initState();
  }

  /*
   * Complex options processor
   */


  _createClass(LogState, [{
    key: 'processOptions',
    value: function processOptions() {
      if (this.options && this.options.debug === true) {
        this.state.DEBUGGING = true;
        this.options.timing = true;
        this.options.logging = true;
        this.options.warning = true;
      } else {
        this.state.debug = false;
      }
    }

    /*
     * Set object state by options
     */

  }, {
    key: 'initState',
    value: function initState() {
      // for benchmarking
      if (this.options) {
        if (this.options.timing === true && (0, _type_detector2.default)(console.time) === 'FUNCTION') {
          this.state.TIMING = true;
        }
        if (this.options.logging === true && (0, _type_detector2.default)(console.log) === 'FUNCTION') {
          this.state.LOGGING = true;
        }
        if (this.options.warning === true && (0, _type_detector2.default)(console.warn) === 'FUNCTION') {
          this.state.WARNING = true;
        }
      }
    }

    /*
     * Return statement is logger must do some thing
     */

  }, {
    key: 'mustDo',
    value: function mustDo(stateName) {
      var upperStateName = stateName.toUpperCase();
      var res = this.state[upperStateName];

      if ((0, _type_detector2.default)(res) !== 'BOOLEAN') {
        throw Error('dont know |' + stateName + '| state');
      }
      return res;
    }
  }]);

  return LogState;
}();

exports.default = LogState;
module.exports = exports['default'];

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = __webpack_require__(0);

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
module.exports = exports['default'];

/***/ })
/******/ ]);
});