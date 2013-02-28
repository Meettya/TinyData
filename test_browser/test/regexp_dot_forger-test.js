(function() {
 'use strict';
    
var dependencies, name_resolver, require, sources, _this = this;

name_resolver = function(parent, name) {
  if (dependencies[parent] == null) {
    throw Error("no dependencies list for parent |" + parent + "|");
  }
  if (dependencies[parent][name] == null) {
    throw Error("no one module resolved, name - |" + name + "|, parent - |" + parent + "|");
  }
  return dependencies[parent][name];
};
require = function(name, parent) {
  var exports, module, module_source, resolved_name, _ref;
  if (!(module_source = sources[name])) {
    resolved_name = name_resolver(parent, name);
    if (!(module_source = sources[resolved_name])) {
      throw Error("can`t find module source code: original_name - |" + name + "|, resolved_name - |" + resolved_name + "|");
    }
  }
  module_source.call(_this,exports = {}, module = {}, function(mod_name) {
    return require(mod_name, resolved_name != null ? resolved_name : name);
  });
  return (_ref = module.exports) != null ? _ref : exports;
};
    dependencies = {"2282979379":{"lodash":1154215551},"3137057011":{"../src/lib/regexp_dot_forger":2282979379,"lodash":1154215551}};
    sources = {
"1154215551": function(exports, module, require) {
// /Users/meettya/github/TinyData/web_modules/lodash.coffee 
/*
This is lodash shim
*/

module.exports = this._;
},
"2282979379": function(exports, module, require) {
// /Users/meettya/github/TinyData/src/lib/regexp_dot_forger.coffee 
/*
This is RegExp helper for TinyData

Its convert users RegExp with escaped dot \.
 or dot as a part of character set [.] - like this,
 by replace all of that to something else 

Raison d'être - inside TinyData for entity devision used dot_replacer,
  but for the simplicity we are MAY (and I believe MUST) cloak this fact.
*/

/*
Logging method decorator
*/

var RegExpDotForger, logOnDemand, _,
  __slice = [].slice;

logOnDemand = function(methodBody) {
  return function() {
    var args, __rval__;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    __rval__ = methodBody.apply(this, args);
    if (this._do_logging_) {
      console.log("" + args[0] + " -> " + __rval__);
    }
    return __rval__;
  };
};

_ = require('lodash');

RegExpDotForger = (function() {

  function RegExpDotForger(_dot_substitute_, _options_) {
    this._dot_substitute_ = _dot_substitute_;
    this._options_ = _options_ != null ? _options_ : {};
    if (!((this._dot_substitute_ != null) && _.isString(this._dot_substitute_))) {
      throw Error("constructor must be called with string as dot substitute, but got:\n|dot_substitute| = |" + this._dot_substitute_ + "|");
    }
    this._do_logging_ = (this._options_.log != null) && this._options_.log === true && ((typeof console !== "undefined" && console !== null ? console.log : void 0) != null) ? true : false;
  }

  /*
    This method return pattern RegExp by name or throw exception
    why it public? for tests
  */


  RegExpDotForger.prototype.getPatternByName = function(pattern_name) {
    switch (pattern_name.toUpperCase()) {
      case 'CHARACTER_SET':
        return /((?:^|(?:(?:^|[^\\])\\(?:\\{2})*\\)|[^\\]+))(\[(?:]|(?:[^\\]+])|(?:.*?[^\\]+])|(?:.*?[^\\]+\\(?:\\{2})*\\])))/;
      case 'ESCAPED_DOT':
        return /((?:^|[^\\])(?:\\{2})*)(\\\.)/;
      default:
        throw Error("so far don`t know pattern, named |" + pattern_name + "|, mistype?");
    }
  };

  /*
    This method forge dots in incoming regexp and return 'corrected' one
  */


  RegExpDotForger.prototype.doForgeDots = logOnDemand(function(in_regexp) {
    if (!((in_regexp != null) && _.isRegExp(in_regexp))) {
      throw Error("must be called with RegExp, but got:\n|in_regexp| = |" + in_regexp + "|");
    }
    return new RegExp(this._forgeEscapedDots(this._forgeCharacterSet(in_regexp.source)));
  });

  /*
    This method change dots to substitute in character sets
  */


  RegExpDotForger.prototype._forgeCharacterSet = function(in_regexp_as_string) {
    var dot_replacer, global_char_set_pattern,
      _this = this;
    global_char_set_pattern = new RegExp(this.getPatternByName('character_set').source, 'g');
    dot_replacer = function(match, captured_1, captured_2) {
      var forged_set;
      forged_set = captured_2.replace(/\./g, _this._dot_substitute_);
      return captured_1 + forged_set;
    };
    return in_regexp_as_string.replace(global_char_set_pattern, dot_replacer);
  };

  /*
    This method change escaped dots to substitute
  */


  RegExpDotForger.prototype._forgeEscapedDots = function(in_regexp_as_string) {
    var escaped_dot_replacer, global_escaped_dot_pattern,
      _this = this;
    global_escaped_dot_pattern = new RegExp(this.getPatternByName('escaped_dot').source, 'g');
    escaped_dot_replacer = function(match, captured_1, captured_2) {
      var forged_set;
      forged_set = captured_2.replace(/\\\./, _this._dot_substitute_);
      return captured_1 + forged_set;
    };
    return in_regexp_as_string.replace(global_escaped_dot_pattern, escaped_dot_replacer);
  };

  return RegExpDotForger;

})();

module.exports = RegExpDotForger;
},
"3137057011": function(exports, module, require) {
// /Users/meettya/github/TinyData/test/regexp_dot_forger-test.coffee 
/*
Test suite for node AND browser in one file
*/

var RegExpDotForger, character_set_pattern, character_set_pattern_suite, dot_substitutor, escaped_dot_pattern, escaped_dot_pattern_suite, forger_obj, substitution_test_suite, _;

_ = require('lodash');

RegExpDotForger = require("../src/lib/regexp_dot_forger");

forger_obj = character_set_pattern = escaped_dot_pattern = null;

dot_substitutor = "\uFE45";

character_set_pattern_suite = {
  example_true: [/[]/, /[.]/, /[[.]/, /[.[]/, /[\]\.\[]/, /\\[\.]/, /\\\\[.\\\\]\\/, /[.\\]/, /dtt[.]/, /3434\\[\\.]\/\//, /^\.rtt([^.]+)\./, /^[^.]+\.comment\.([^.]+)\./],
  example_false: [/\[.]/, /\\\[.\.]/, /ddsds\[.]/]
};

escaped_dot_pattern_suite = {
  example_true: [/\./, /\\\./, /^\d+[.\]]ft\./, /\\\\\.\\\.\./],
  example_false: [/\\./, /sd\b\\\\./, /\(.\)/]
};

substitution_test_suite = {
  example_true: [[/\./, /\uFE45/], [/[.]/, /[\uFE45]/], [/[\.]/, /[\\uFE45]/], [/[...]/, /[\uFE45\uFE45\uFE45]/], [/^[^.]+\.comment\.([^.]+)\./, /^[^﹅]+﹅comment﹅([^﹅]+)﹅/]],
  example_false: [[/\\./, /\\./], [/\[.]/, /\[.]/]]
};

describe('RegExpDotForger:', function() {
  beforeEach(function() {
    return forger_obj = new RegExpDotForger(dot_substitutor);
  });
  describe('new()', function() {
    it('should return RegExpDotForger object on call with data', function() {
      forger_obj = new RegExpDotForger(dot_substitutor);
      return forger_obj.should.be.an["instanceof"](RegExpDotForger);
    });
    return it('should throw Error on void call', function() {
      return (function() {
        return new RegExpDotForger();
      }).should.to["throw"](/constructor must be called with/);
    });
  });
  describe('#getPatternByName()', function() {
    it('should return existance pattern', function() {
      character_set_pattern = forger_obj.getPatternByName('character_set');
      return character_set_pattern.should.to.be["instanceof"](RegExp);
    });
    return it('should throw Error on unknown name', function() {
      return (function() {
        return forger_obj.getPatternByName('foo_bar');
      }).should.to["throw"](/don`t know pattern/);
    });
  });
  describe('#doForgeDots()', function() {
    it('should change escaped dots (\\.) and dots in character set ([.]) to substitutor', function() {
      return _.each(substitution_test_suite.example_true, function(test_suite) {
        return forger_obj.doForgeDots(test_suite[0]).should.be.eql(test_suite[1]);
      });
    });
    return it('should NOT change dots itself as "one symbol" (.) to substitutor', function() {
      return _.each(substitution_test_suite.example_false, function(test_suite) {
        return forger_obj.doForgeDots(test_suite[0]).should.be.eql(test_suite[1]);
      });
    });
  });
  return describe('patterns ITSELF for searching in regexp patterns:', function() {
    describe('\'character set\' search pattern:', function() {
      beforeEach(function() {
        return character_set_pattern = forger_obj.getPatternByName('character_set');
      });
      it('should match righ things', function() {
        return _.each(character_set_pattern_suite.example_true, function(pattern) {
          return character_set_pattern.test(pattern.source).should.to.be["true"];
        });
      });
      return it('should NOT match wrong things', function() {
        return _.each(character_set_pattern_suite.example_false, function(pattern) {
          return character_set_pattern.test(pattern.source).should.to.be["false"];
        });
      });
    });
    return describe('\'escaped dot\' search pattern:', function() {
      beforeEach(function() {
        return escaped_dot_pattern = forger_obj.getPatternByName('escaped_dot');
      });
      it('should match righ things', function() {
        return _.each(escaped_dot_pattern_suite.example_true, function(pattern) {
          return escaped_dot_pattern.test(pattern.source).should.to.be["true"];
        });
      });
      return it('should NOT match wrong things', function() {
        return _.each(escaped_dot_pattern_suite.example_false, function(pattern) {
          return escaped_dot_pattern.test(pattern.source).should.to.be["false"];
        });
      });
    });
  });
});
}};

/* bundle export */
this.tinydata_package = {
"TinyData": require(3137057011)};
}).call(this);