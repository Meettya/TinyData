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
    dependencies = {"909789665":{"lodash":1154215551},"2282979379":{"lodash":1154215551},"3298643582":{"./type_detector":909789665,"./mixin_supported":3342568302,"../mixin/arg_parser":3689565305,"../mixin/collector":3556032526,"lodash":1154215551},"3556032526":{"../lib/type_detector":909789665,"lodash":1154215551},"3689565305":{"../lib/type_detector":909789665},"3852063120":{"./type_detector":909789665,"lodash":1154215551},"4016661952":{"./lib/regexp_dot_forger":2282979379,"./lib/stringificator":3852063120,"./lib/log_state":4255840762,"./lib/finalizer":3298643582,"./lib/type_detector":909789665,"./lib/mixin_supported":3342568302,"./mixin/arg_parser":3689565305,"./mixin/collector":3556032526,"lodash":1154215551}};
    sources = {
"909789665": function(exports, module, require) {
// /Users/meettya/github/TinyData/src/lib/type_detector.coffee 
/*
This is type detector for any JS type.

Will be used as simply module with one exported function,
not a class - its dont needed
*/

var _;

_ = require('lodash');

module.exports = {
  /*
    This method return type of incoming things
    HASH mean NOT a function or RegExp or something else  - just simple object
  */

  getItType: function(x) {
    if (_.isPlainObject(x)) {
      return 'HASH';
    } else if (_.isArray(x)) {
      return 'ARRAY';
    } else if (_.isString(x)) {
      return 'STRING';
    } else if (_.isNumber(x)) {
      return 'NUMBER';
    } else if (_.isBoolean(x)) {
      return 'BOOLEAN';
    } else if (_.isNull(x)) {
      return 'NULL';
    } else if (_.isFunction(x)) {
      return 'FUNCTION';
    } else if (_.isRegExp(x)) {
      return 'REGEXP';
    } else if (_.isDate(x)) {
      return 'DATE';
    } else if (_.isArguments(x)) {
      return 'ARGUMENTS';
    } else {
      return 'OTHER';
    }
  }
};
},
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
"3298643582": function(exports, module, require) {
// /Users/meettya/github/TinyData/src/lib/finalizer.coffee 
/*
This is Finalizer for TinyData

Its get object and filter (and may be convert) it to natural dot notation
*/

var ArgParserable, Collectable, Finalizer, MixinSupported, getItType, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require('lodash');

getItType = require("./type_detector").getItType;

MixinSupported = require("./mixin_supported");

ArgParserable = require("../mixin/arg_parser");

Collectable = require("../mixin/collector");

Finalizer = (function(_super) {

  __extends(Finalizer, _super);

  Finalizer.include(ArgParserable);

  Finalizer.include(Collectable);

  function Finalizer(_internal_path_delimiter_, _extarnal_dot_sign_, _options_) {
    this._internal_path_delimiter_ = _internal_path_delimiter_;
    this._extarnal_dot_sign_ = _extarnal_dot_sign_;
    this._options_ = _options_ != null ? _options_ : {};
    this._convert_before_finalize_function_ = true;
    this._convert_out_result_ = true;
  }

  Finalizer.prototype.finalizeResult = function(finalize_function, pre_result_obj) {
    var finalization_name, finalizer;
    if (finalization_name = this._getFinalizationName(finalize_function)) {
      finalizer = this._prepareFinalization(finalization_name, finalize_function);
      return finalizer(pre_result_obj);
    } else {
      return pre_result_obj;
    }
  };

  /*
    Try to reduce logic level
  */


  Finalizer.prototype._getFinalizationName = function(user_finalize_function) {
    var will_be_finalized;
    will_be_finalized = false;
    if ((user_finalize_function != null) && this._argParser(user_finalize_function, 'finalize_function', 'Function')) {
      if (this._convert_before_finalize_function_) {
        return 'DECORATE_THEN_FINALAZE';
      } else {
        will_be_finalized = true;
      }
    }
    if (this._convert_out_result_) {
      if (will_be_finalized) {
        return 'FINALAZE_THEN_DECORATE';
      } else {
        return 'DECORATE';
      }
    }
  };

  /*
    This method build all finalization stuff
    and return simple function
  */


  Finalizer.prototype._prepareFinalization = function(finalize_name, user_finalize_function) {
    var result_converter, user_finalizer,
      _this = this;
    result_converter = this._buildResultConvertor();
    user_finalizer = this._buildUserFinalizer(user_finalize_function);
    switch (finalize_name) {
      case 'DECORATE':
        return function(in_obj) {
          return result_converter(in_obj);
        };
      case 'FINALAZE_THEN_DECORATE':
        return function(in_obj) {
          return result_converter(user_finalizer(in_obj));
        };
      case 'DECORATE_THEN_FINALAZE':
        return function(in_obj) {
          return user_finalizer(result_converter(in_obj));
        };
      default:
        throw Error("WTF???!!!");
    }
  };

  /*
    This method create function to wipe 'orchid' delimiter
  */


  Finalizer.prototype._makeBuffingDelimiterWeel = function() {
    var delimiter_pattern, delimiter_symbol, dot_symbol,
      _this = this;
    dot_symbol = this._extarnal_dot_sign_;
    delimiter_symbol = this._internal_path_delimiter_;
    delimiter_pattern = new RegExp(delimiter_symbol, 'g');
    return function(in_data) {
      var full_string;
      if ('STRING' !== getItType(in_data)) {
        return in_data;
      }
      full_string = delimiter_symbol === in_data.charAt(in_data.length - 1) ? in_data.slice(0, -1) : in_data;
      return full_string.replace(delimiter_pattern, dot_symbol);
    };
  };

  /*
    To separate logic of converting
    This method trim orchid internal delimiters at the end of keys AND values,
    than replace all internal dot to external (in values and keys too)
  */


  Finalizer.prototype._buildResultConvertor = function() {
    var buffing_delimiter,
      _this = this;
    buffing_delimiter = this._makeBuffingDelimiterWeel();
    return function(in_obj) {
      var idx, in_item, in_key, res_key, result_obj, _i, _j, _len, _len1, _ref, _ref1;
      result_obj = {};
      _ref = _.keys(in_obj);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        in_key = _ref[_i];
        res_key = buffing_delimiter(in_key);
        result_obj[res_key] = new Array(in_obj[in_key].length);
        _ref1 = in_obj[in_key];
        for (idx = _j = 0, _len1 = _ref1.length; _j < _len1; idx = ++_j) {
          in_item = _ref1[idx];
          result_obj[res_key][idx] = buffing_delimiter(in_item);
        }
      }
      return result_obj;
    };
  };

  /*
    To separate logic of finalizator
    actually just wrapper
  */


  Finalizer.prototype._buildUserFinalizer = function(user_fn) {
    return this._buildCollectorLayout(user_fn);
  };

  return Finalizer;

})(MixinSupported);

module.exports = Finalizer;
},
"3342568302": function(exports, module, require) {
// /Users/meettya/github/TinyData/src/lib/mixin_supported.coffee 
/*
This is MixinSupported class
*/

var MixinSupported, moduleKeywords,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

moduleKeywords = ['extended', 'included'];

MixinSupported = (function() {

  function MixinSupported() {}

  MixinSupported.extend = function(obj) {
    var key, value, _ref;
    for (key in obj) {
      value = obj[key];
      if (__indexOf.call(moduleKeywords, key) < 0) {
        this[key] = value;
      }
    }
    if ((_ref = obj.extended) != null) {
      _ref.apply(this);
    }
    return this;
  };

  MixinSupported.include = function(obj) {
    var key, value, _ref;
    for (key in obj) {
      value = obj[key];
      if (__indexOf.call(moduleKeywords, key) < 0) {
        this.prototype[key] = value;
      }
    }
    if ((_ref = obj.included) != null) {
      _ref.apply(this);
    }
    return this;
  };

  return MixinSupported;

})();

module.exports = MixinSupported;
},
"3556032526": function(exports, module, require) {
// /Users/meettya/github/TinyData/src/mixin/collector.coffee 
/*
This is Collector mixin - its create layout for object walker and result collection
*/

var getItType, instanceProperties, _;

_ = require('lodash');

getItType = require("../lib/type_detector").getItType;

module.exports = instanceProperties = {
  /*
    This method create 'emit' function for data collection
  */

  _buildEmitCollector: function(result_obj) {
    var _this = this;
    return function(key, value) {
      var _ref;
      if ((key != null) && (value != null)) {
        if ((_ref = result_obj[key]) == null) {
          result_obj[key] = [];
        }
        result_obj[key].push(value);
        return null;
      }
    };
  },
  /*
    This method create collector layout for any worker
  */

  _buildCollectorLayout: function(work_fn) {
    var _this = this;
    return function(in_obj) {
      var arg_type, emit, item, key, rake_result, _i, _j, _len, _len1, _ref;
      rake_result = {};
      emit = _this._buildEmitCollector(rake_result);
      switch (arg_type = getItType(in_obj)) {
        case 'ARRAY':
          for (_i = 0, _len = in_obj.length; _i < _len; _i++) {
            item = in_obj[_i];
            work_fn.call(_this, item, emit);
          }
          break;
        case 'HASH':
          _ref = _.keys(in_obj);
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            key = _ref[_j];
            work_fn.call(_this, key, in_obj[key], emit);
          }
          break;
        default:
          throw Error("cant work with object type |" + arg_type + "|");
      }
      return rake_result;
    };
  }
};
},
"3689565305": function(exports, module, require) {
// /Users/meettya/github/TinyData/src/mixin/arg_parser.coffee 
/*
This is argument parser helper mixin
*/

var getItType, instanceProperties;

getItType = require("../lib/type_detector").getItType;

module.exports = instanceProperties = {
  /*
    This method parse arg and may ensure its type
  */

  _argParser: function(arg, arg_name, strict_type) {
    var arg_type, err_formatter, parsed_arg;
    err_formatter = function(err_string, arg_type) {
      return "" + err_string + "\n|arg_name| = |" + arg_name + "|\n|type| = |" + arg_type + "|\n|arg|   = |" + arg + "|";
    };
    parsed_arg = (function() {
      switch (arg_type = getItType(arg)) {
        case 'STRING':
          try {
            return ['REGEXP', RegExp(arg)];
          } catch (error) {
            throw SyntaxError(err_formatter("cant compile this String to RegExp", arg_type));
          }
          break;
        case 'REGEXP':
          return ['REGEXP', arg];
        case 'FUNCTION':
          return ['FUNCTION', arg];
        default:
          throw TypeError(err_formatter("argument must be String, RegExp or Function, but got", arg_type));
      }
    })();
    if ((strict_type != null) && parsed_arg[0] !== strict_type.toUpperCase()) {
      throw TypeError(err_formatter("argument must be " + strict_type + ", but got", arg_type));
    }
    return parsed_arg;
  }
};
},
"3852063120": function(exports, module, require) {
// /Users/meettya/github/TinyData/src/lib/stringificator.coffee 
/*
This is Stringificator for TinyData

Its get object and return materialized path, with some changes, like:
  * filter some data
  * cut long text values
  * change data values to stub (not realized)
*/

var Stringificator, getItType, _;

_ = require('lodash');

getItType = require("./type_detector").getItType;

Stringificator = (function() {

  function Stringificator(_original_obj_, _internal_path_delimiter_, _regexp_transformation_fn_, _options_) {
    this._original_obj_ = _original_obj_;
    this._internal_path_delimiter_ = _internal_path_delimiter_;
    this._regexp_transformation_fn_ = _regexp_transformation_fn_;
    this._options_ = _options_ != null ? _options_ : {};
    this._cache_stringifyed_object_ = null;
    this._stringification_rule = {
      stubs_list: [],
      stringify_filter: null
    };
    this._max_text_long_ = 120;
    this._convert_stringify_filter = true;
    this._do_logging_ = (this._options_.log != null) && this._options_.log === true && ((typeof console !== "undefined" && console !== null ? console.log : void 0) != null) ? true : false;
  }

  /*
    This is public method, wrapper for internal and realize a cache
  */


  Stringificator.prototype.stringifyObject = function(in_stringify_filter, in_stubs_list) {
    var stringify_stub_list, stringy_filter, _ref;
    stringy_filter = this._stringification_rule.stringify_filter;
    stringify_stub_list = this._stringification_rule.stubs_list;
    in_stringify_filter || (in_stringify_filter = stringy_filter);
    in_stubs_list || (in_stubs_list = stringify_stub_list);
    if (!(this._cache_stringifyed_object_ != null) || !_.isEqual(in_stringify_filter, stringy_filter) || !_.isEqual(in_stubs_list, stringify_stub_list)) {
      if (this._do_logging_) {
        console.log('stringify cache miss');
      }
      _ref = [in_stringify_filter, in_stubs_list], stringy_filter = _ref[0], stringify_stub_list = _ref[1];
      return this._cache_stringifyed_object_ = this._doStringification(in_stringify_filter, in_stubs_list);
    } else {
      if (this._do_logging_) {
        console.log('stringify cache hit');
      }
      return this._cache_stringifyed_object_;
    }
  };

  /*
    This method stringify object
  */


  Stringificator.prototype._doStringification = function(stringify_rule, stubs_list) {
    var dot_sign, filter_body, innner_loop, is_filter_passed, result_array, string_limiter,
      _this = this;
    filter_body = this._makeElementFilter(stringify_rule);
    string_limiter = this._makeStringLimiter(this._max_text_long_);
    is_filter_passed = stringify_rule != null ? filter_body : function() {
      return true;
    };
    dot_sign = this._internal_path_delimiter_;
    result_array = [];
    innner_loop = function(in_obj, prefix, depth) {
      var idx, in_obj_type, key, obj_keys, value, _i, _j, _len, _len1;
      switch (in_obj_type = getItType(in_obj)) {
        case 'HASH':
          obj_keys = _.keys(in_obj);
          if (obj_keys.length) {
            for (_i = 0, _len = obj_keys.length; _i < _len; _i++) {
              key = obj_keys[_i];
              if (is_filter_passed(prefix, key, depth)) {
                innner_loop(in_obj[key], "" + prefix + key + dot_sign, depth + 1);
              }
            }
          } else {
            innner_loop("__EMPTY__|HASH|", "" + prefix, depth);
          }
          break;
        case 'ARRAY':
          if (in_obj.length) {
            for (idx = _j = 0, _len1 = in_obj.length; _j < _len1; idx = ++_j) {
              value = in_obj[idx];
              if (is_filter_passed(prefix, idx, depth)) {
                innner_loop(value, "" + prefix + idx + dot_sign, depth + 1);
              }
            }
          } else {
            innner_loop("__EMPTY__|ARRAY|", "" + prefix, depth);
          }
          break;
        case 'NUMBER':
        case 'BOOLEAN':
        case 'NULL':
          result_array.push("" + prefix + in_obj);
          break;
        case 'STRING':
          result_array.push(string_limiter(prefix, in_obj, depth));
          break;
        case 'DATE':
        case 'REGEXP':
          result_array.push("" + prefix + "__" + in_obj_type + "__|" + in_obj + "|__");
          break;
        default:
          result_array.push("" + prefix + "__" + in_obj_type + "__");
      }
      return null;
    };
    innner_loop(this._original_obj_, '', 0);
    return result_array;
  };

  /*
    This method create limiter for long text
  */


  Stringificator.prototype._makeStringLimiter = function(max_length) {
    var _this = this;
    return function(full_elem_path, elem_content, elem_depth) {
      var elem_length;
      elem_length = elem_content.length;
      if (!(elem_length > max_length)) {
        return "" + full_elem_path + elem_content;
      } else {
        return "" + full_elem_path + "__LONG_TEXT__|" + elem_length + "|";
      }
    };
  };

  /*
    This method create stringify filter
    to reduce part of values to speed up stringification and seeking
  */


  Stringificator.prototype._makeElementFilter = function(stringify_rule) {
    var name_matcher, stringify_pattern,
      _this = this;
    name_matcher = (stringify_rule != null ? stringify_rule.origin_pattern : void 0) != null ? (stringify_pattern = stringify_rule.origin_pattern, this._convert_stringify_filter ? stringify_pattern = this._regexp_transformation_fn_(stringify_pattern) : void 0, function(matcher_elem_name, matcher_elem_origin) {
      return matcher_elem_name === stringify_rule.element_name && stringify_pattern.test(matcher_elem_origin);
    }) : function(matcher_elem_name) {
      return matcher_elem_name === stringify_rule.element_name;
    };
    return function(elem_origin, elem_name, elem_depth) {
      if (stringify_rule.apply_on_depth === elem_depth) {
        return name_matcher(elem_name, elem_origin);
      } else {
        return true;
      }
    };
  };

  return Stringificator;

})();

module.exports = Stringificator;
},
"4016661952": function(exports, module, require) {
// /Users/meettya/github/TinyData/src/tinydata.coffee 
/*
This is tiny data-mining engine

work as mapReduce, but in some different way and use RegExp as path pointer
*/

/*
Timing method decorator
*/

var ArgParserable, Collectable, Finalizer, LogState, MixinSupported, RegExpDotForger, Stringificator, TinyData, getItType, timeOnDemand, _,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

timeOnDemand = function(label, methodBody) {
  return function() {
    var __rval__;
    if (this._logger_.mustDo('timing')) {
      console.time(label);
    }
    __rval__ = methodBody.apply(this, arguments);
    if (this._logger_.mustDo('timing')) {
      console.timeEnd(label);
    }
    return __rval__;
  };
};

_ = require('lodash');

RegExpDotForger = require("./lib/regexp_dot_forger");

Stringificator = require("./lib/stringificator");

LogState = require("./lib/log_state");

Finalizer = require("./lib/finalizer");

getItType = require("./lib/type_detector").getItType;

MixinSupported = require("./lib/mixin_supported");

ArgParserable = require("./mixin/arg_parser");

Collectable = require("./mixin/collector");

TinyData = (function(_super) {

  __extends(TinyData, _super);

  TinyData.include(ArgParserable);

  TinyData.include(Collectable);

  function TinyData(_original_obj_, _options_) {
    this._original_obj_ = _original_obj_ != null ? _original_obj_ : {};
    this._options_ = _options_ != null ? _options_ : {};
    this.doTransormRegExp = __bind(this.doTransormRegExp, this);

    this._dot_ = {
      internal: "\uFE45",
      external: '.'
    };
    this._convert_income_seek_regexp_ = true;
    this._logger_ = new LogState(this._options_);
    this._dot_forger_ = new RegExpDotForger(this.getPathDelimiter('internal'), {
      log: this._logger_.mustDo('logging')
    });
    this._stringificator_ = new Stringificator(this._original_obj_, this.getPathDelimiter('internal'), this.doTransormRegExp, {
      log: this._logger_.mustDo('logging')
    });
    this._finalizer_ = new Finalizer(this.getPathDelimiter('internal'), this.getPathDelimiter('external'));
  }

  /*
    This method proceed 'seeking' through all stringifyed object and do some thing,
    then may do some finalization code
    Builded for common case of usage, 
    when rule is RegExp and we are want to map matched result in direct order:
    first capture -> key
    second capture -> value
  */


  TinyData.prototype.seekOut = function(in_rake_rule, finalize_function, interp_sequence) {
    if (interp_sequence == null) {
      interp_sequence = {};
    }
    _.defaults(interp_sequence, {
      key: 1,
      value: 2
    });
    if (this._logger_.mustDo('warning') && interp_sequence.key >= interp_sequence.value) {
      console.warn("for reverse interpretation direction it would be better to use #seekOutVerso()\n|key_order|   = |" + interp_sequence.key + "|\n|value_order| = |" + interp_sequence.value + "|");
    }
    return this._seekOutAny(in_rake_rule, finalize_function, interp_sequence);
  };

  /*
    This method proceed 'seeking' through all stringifyed object and do some thing,
    then may do some finalization code
    Builded for common case of usage, 
    when rule is RegExp and we are want to map matched result in reverse order:
    first capture -> value
    second capture -> key
  */


  TinyData.prototype.seekOutVerso = function(in_rake_rule, finalize_function, interp_sequence) {
    if (interp_sequence == null) {
      interp_sequence = {};
    }
    _.defaults(interp_sequence, {
      key: 2,
      value: 1
    });
    if (this._logger_.mustDo('warning') && interp_sequence.value >= interp_sequence.key) {
      console.warn("for direct interpretation direction it would be better to use #seekOut()\n|key_order|   = |" + interp_sequence.key + "|\n|value_order| = |" + interp_sequence.value + "|");
    }
    return this._seekOutAny(in_rake_rule, finalize_function, interp_sequence);
  };

  /*
    This method stringify our original object (materialize full path + add leaf )
    may be used to speed up all by reduce stringification work
  */


  TinyData.prototype.rakeStringify = timeOnDemand('rakeStringify', function(in_stringify_filter, in_stubs_list) {
    if (in_stubs_list == null) {
      in_stubs_list = [];
    }
    return this._stringificator_.stringifyObject(in_stringify_filter, in_stubs_list);
  });

  /*
    This method transform incoming RegExp changes \. (dot) to internal dot-substituter
  */


  TinyData.prototype.doTransormRegExp = function(original_regexp) {
    if (-1 !== original_regexp.source.indexOf(this.getPathDelimiter('internal'))) {
      if (this._logger_.mustDo('logging')) {
        console.log("doTransormRegExp: skip converting for |" + original_regexp + "|");
      }
      return original_regexp;
    }
    return this._dot_forger_.doForgeDots(original_regexp);
  };

  /*
    This method may be used for user-defined function
  */


  TinyData.prototype.getPathDelimiter = function(type) {
    switch (type.toUpperCase()) {
      case 'INTERNAL':
        return this._dot_.internal;
      case 'EXTERNAL':
        return this._dot_.external;
      default:
        throw Error("so far don`t know path delimiter, named |" + type + "|, mistype?");
    }
  };

  /*
    This method return data by path
    It will auto-recognize delimiter, or use force
  */


  TinyData.prototype.getDataByPath = function(path, obj, force_delimiter) {
    var steps;
    if (obj == null) {
      obj = this._original_obj_;
    }
    force_delimiter || (force_delimiter = -1 !== (path != null ? path.indexOf(this.getPathDelimiter('internal')) : void 0) ? this.getPathDelimiter('internal') : this.getPathDelimiter('external'));
    steps = path.split(force_delimiter);
    return _.reduce(steps, (function(obj, i) {
      return obj[i];
    }), obj);
  };

  /*
    That's all, folks!
    Just few public methods :)
  */


  /*
    This is realy seek processor code, one for any directions
  */


  TinyData.prototype._seekOutAny = function(in_seek_rule, finalize_function, interp_sequence) {
    var raked_object, seek_function, seek_rule, seek_rule_type, stringifyed_object, _ref;
    stringifyed_object = this.rakeStringify();
    _ref = this._argParser(in_seek_rule, 'seek_rule'), seek_rule_type = _ref[0], seek_rule = _ref[1];
    seek_function = this._buildSeekFunction(seek_rule_type, seek_rule, interp_sequence);
    raked_object = this._proceedSeekingOut(seek_function, stringifyed_object);
    return this._proceedFinalization(finalize_function, raked_object);
  };

  /*
    Internal method for wrap timing
  */


  TinyData.prototype._proceedFinalization = timeOnDemand('finalization', function(finalize_function, raked_object) {
    return this._finalizer_.finalizeResult(finalize_function, raked_object);
  });

  /*
    Internal method for wrap timing
  */


  TinyData.prototype._proceedSeekingOut = timeOnDemand('seekingOut', function(seek_function, stringifyed_object) {
    return seek_function(stringifyed_object);
  });

  /*
    This method return rake function itself, its different for 
    RegExp or Function
  */


  TinyData.prototype._buildSeekFunction = function(rake_rule_type, rake_rule, interp_sequence) {
    var _this = this;
    switch (rake_rule_type) {
      case 'REGEXP':
        if (this._convert_income_seek_regexp_) {
          rake_rule = this.doTransormRegExp(rake_rule);
        }
        return this._buildCollectorLayout(function(item, emit) {
          var matched_obj;
          if (matched_obj = item.match(rake_rule)) {
            emit(matched_obj[interp_sequence.key], matched_obj[interp_sequence.value]);
            return null;
          }
        });
      case 'FUNCTION':
        return this._buildCollectorLayout(rake_rule);
      default:
        throw Error("WTF???!!");
    }
  };

  return TinyData;

})(MixinSupported);

module.exports = TinyData;
},
"4255840762": function(exports, module, require) {
// /Users/meettya/github/TinyData/src/lib/log_state.coffee 
/*
This is log state object

Its configured by incoming object and return turned on statuses
*/

var LogState;

LogState = (function() {

  function LogState(_options_) {
    this._options_ = _options_ != null ? _options_ : {};
    this._state_ = {};
    if ((this._options_.debug != null) && this._options_.debug === true) {
      this._state_['DEBUGGING'] = true;
      this._options_.timing = true;
      this._options_.logging = true;
      this._options_.warning = true;
    } else {
      this._state_.debug = false;
    }
    this._state_['TIMING'] = (this._options_.timing != null) && this._options_.timing === true && ((typeof console !== "undefined" && console !== null ? console.time : void 0) != null) ? true : false;
    this._state_['LOGGING'] = (this._options_.logging != null) && this._options_.logging === true && ((typeof console !== "undefined" && console !== null ? console.log : void 0) != null) ? true : false;
    this._state_['WARNING'] = (this._options_.warning != null) && this._options_.warning === true && ((typeof console !== "undefined" && console !== null ? console.warn : void 0) != null) ? true : false;
  }

  /*
    This method resolve log status
  */


  LogState.prototype.mustDo = function(state_name) {
    var trite_arg;
    trite_arg = state_name.toUpperCase();
    if (this._state_[trite_arg] == null) {
      throw Error("dont know |" + state_name + "| state");
    }
    return this._state_[trite_arg];
  };

  return LogState;

})();

module.exports = LogState;
}};

/* bundle export */
this.tinydata_package = {
"TinyData": require(4016661952)};
}).call(this);