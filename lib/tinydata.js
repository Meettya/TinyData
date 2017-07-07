'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This is tiny data-mining engine
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * work as mapReduce, but in some different way and use RegExp as path pointer
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regexp_dot_forger = require('./lib/regexp_dot_forger');

var _regexp_dot_forger2 = _interopRequireDefault(_regexp_dot_forger);

var _stringificator = require('./lib/stringificator');

var _stringificator2 = _interopRequireDefault(_stringificator);

var _finalizer = require('./lib/finalizer');

var _finalizer2 = _interopRequireDefault(_finalizer);

var _log_state = require('./helpers/log_state');

var _log_state2 = _interopRequireDefault(_log_state);

var _arg_parser = require('./helpers/arg_parser');

var _arg_parser2 = _interopRequireDefault(_arg_parser);

var _collector = require('./helpers/collector');

var _collector2 = _interopRequireDefault(_collector);

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
      var sequence = { key: 1, value: 2 };

      Object.assign(sequence, interpSequence);
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
      var sequence = { key: 2, value: 1 };

      Object.assign(sequence, interpSequence);
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