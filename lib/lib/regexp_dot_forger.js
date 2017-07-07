'use strict';

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

var _type_detector = require('../helpers/type_detector');

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