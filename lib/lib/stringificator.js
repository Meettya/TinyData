'use strict';

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

var _type_detector = require('../helpers/type_detector');

var _type_detector2 = _interopRequireDefault(_type_detector);

var _json_equal = require('../helpers/json_equal');

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