'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This is Finalizer for TinyData
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Its get object and filter (and may be convert) it to natural dot notation
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = require('../helpers/type_detector');

var _type_detector2 = _interopRequireDefault(_type_detector);

var _arg_parser = require('../helpers/arg_parser');

var _arg_parser2 = _interopRequireDefault(_arg_parser);

var _collector = require('../helpers/collector');

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