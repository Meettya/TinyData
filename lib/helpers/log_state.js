'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This is log state object
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Its configured by incoming object and return turned on statuses
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _type_detector = require('./type_detector');

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