
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var path = expand(root, name), module = cache[path], fn;
      if (module) {
        return module.exports;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: path, exports: {}};
        try {
          cache[path] = module;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return module.exports;
        } catch (err) {
          delete cache[path];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({"lib/regexp_dot_forger": function(exports, require, module) {
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


(function() {
  var RegExpDotForger, logOnDemand, _, _ref,
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

  _ = (_ref = this._) != null ? _ref : require('lodash');

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

}).call(this);
}, "lib/stringificator": function(exports, require, module) {
/*
This is Stringificator for TinyData

Its get object and return materialized path, with some changes, like:
  * filter some data
  * cut long text values
  * change data values to stub (not realized)
*/


(function() {
  var Stringificator, getItType, _, _ref;

  _ = (_ref = this._) != null ? _ref : require('lodash');

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
      var stringify_stub_list, stringy_filter, _ref1;
      stringy_filter = this._stringification_rule.stringify_filter;
      stringify_stub_list = this._stringification_rule.stubs_list;
      in_stringify_filter || (in_stringify_filter = stringy_filter);
      in_stubs_list || (in_stubs_list = stringify_stub_list);
      if (!(this._cache_stringifyed_object_ != null) || !_.isEqual(in_stringify_filter, stringy_filter) || !_.isEqual(in_stubs_list, stringify_stub_list)) {
        if (this._do_logging_) {
          console.log('stringify cache miss');
        }
        _ref1 = [in_stringify_filter, in_stubs_list], stringy_filter = _ref1[0], stringify_stub_list = _ref1[1];
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

}).call(this);
}, "lib/type_detector": function(exports, require, module) {
/*
This is type detector for any JS type.

Will be used as simply module with one exported function,
not a class - its dont needed
*/


(function() {
  var _, _ref;

  _ = (_ref = this._) != null ? _ref : require('lodash');

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

}).call(this);
}, "tinydata": function(exports, require, module) {
/*
This is tiny data-mining engine

work as mapReduce, but in some different way and use RegExp as path pointer
*/


/*
Timing method decorator
*/


(function() {
  var RegExpDotForger, Stringificator, TinyData, getItType, timeOnDemand, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  timeOnDemand = function(label, methodBody) {
    return function() {
      var __rval__;
      if (this._do_timing_) {
        console.time(label);
      }
      __rval__ = methodBody.apply(this, arguments);
      if (this._do_timing_) {
        console.timeEnd(label);
      }
      return __rval__;
    };
  };

  _ = (_ref = this._) != null ? _ref : require('lodash');

  RegExpDotForger = require("./lib/regexp_dot_forger");

  Stringificator = require("./lib/stringificator");

  getItType = require("./lib/type_detector").getItType;

  TinyData = (function() {

    function TinyData(_original_obj_, _options_) {
      this._original_obj_ = _original_obj_ != null ? _original_obj_ : {};
      this._options_ = _options_ != null ? _options_ : {};
      this._buildCollectorLayout = __bind(this._buildCollectorLayout, this);

      this.doTransormRegExp = __bind(this.doTransormRegExp, this);

      if ((this._options_.debug != null) && this._options_.debug === true) {
        this._options_.timing = true;
        this._options_.logging = true;
        this._do_warning_ = true;
      }
      this._do_timing_ = (this._options_.timing != null) && this._options_.timing === true && ((typeof console !== "undefined" && console !== null ? console.time : void 0) != null) ? true : false;
      this._do_logging_ = (this._options_.logging != null) && this._options_.logging === true && ((typeof console !== "undefined" && console !== null ? console.log : void 0) != null) ? true : false;
      this._do_warning_ = (this._options_.warning != null) && this._options_.warning === true && ((typeof console !== "undefined" && console !== null ? console.warn : void 0) != null) ? true : false;
      this._dot_ = {
        internal: "\uFE45",
        external: '.'
      };
      this._dot_decorator_settings_ = {
        rakeAny: {
          convert_income_rake_regexp: true,
          convert_before_finalize_function: true,
          convert_out_result: true
        }
      };
      this._dot_forger_ = new RegExpDotForger(this.getPathDelimiter('internal'), {
        log: this._do_logging_
      });
      this._stringificator_ = new Stringificator(this._original_obj_, this.getPathDelimiter('internal'), this.doTransormRegExp, {
        log: this._do_logging_
      });
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
      if (this._do_warning_ && interp_sequence.key >= interp_sequence.value) {
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
      if (this._do_warning_ && interp_sequence.value >= interp_sequence.key) {
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
        if (this._do_logging_) {
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
      That's all, folks!
      Just few public methods :)
    */


    /*
      This is realy seek processor code, one for any directions
    */


    TinyData.prototype._seekOutAny = function(in_rake_rule, finalize_function, interp_sequence) {
      var finalization_name, finalizer, rake_function, rake_rule, rake_rule_type, raked_object, stringifyed_object, _ref1;
      _ref1 = this._argParser(in_rake_rule, 'rake_rule'), rake_rule_type = _ref1[0], rake_rule = _ref1[1];
      rake_function = this._buildRakeFunction(rake_rule_type, rake_rule, interp_sequence);
      stringifyed_object = this.rakeStringify();
      raked_object = this._proceedSeekingOut(rake_function, stringifyed_object);
      if (finalization_name = this._getFinalizationName(finalize_function)) {
        finalizer = this._prepareFinalization(finalization_name, finalize_function);
        return finalizer(raked_object);
      } else {
        return raked_object;
      }
    };

    /*
      Try to reduce logic level
    */


    TinyData.prototype._getFinalizationName = function(user_finalize_function) {
      var will_be_finalized;
      will_be_finalized = false;
      if ((user_finalize_function != null) && this._argParser(user_finalize_function, 'finalize_function', 'Function')) {
        if (this._dot_decorator_settings_.rakeAny.convert_before_finalize_function) {
          return 'DECORATE_THEN_FINALAZE';
        } else {
          will_be_finalized = true;
        }
      }
      if (this._dot_decorator_settings_.rakeAny.convert_out_result) {
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


    TinyData.prototype._prepareFinalization = function(finalize_name, user_finalize_function) {
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


    TinyData.prototype._makeBuffingDelimiterWeel = function() {
      var delimiter_pattern, delimiter_symbol, dot_symbol,
        _this = this;
      dot_symbol = this.getPathDelimiter('external');
      delimiter_symbol = this.getPathDelimiter('internal');
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


    TinyData.prototype._buildResultConvertor = function() {
      var buffing_delimiter,
        _this = this;
      buffing_delimiter = this._makeBuffingDelimiterWeel();
      return function(in_obj) {
        var idx, in_item, in_key, res_key, result_obj, _i, _j, _len, _len1, _ref1, _ref2;
        result_obj = {};
        _ref1 = _.keys(in_obj);
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          in_key = _ref1[_i];
          res_key = buffing_delimiter(in_key);
          result_obj[res_key] = new Array(in_obj[in_key].length);
          _ref2 = in_obj[in_key];
          for (idx = _j = 0, _len1 = _ref2.length; _j < _len1; idx = ++_j) {
            in_item = _ref2[idx];
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


    TinyData.prototype._buildUserFinalizer = function(user_fn) {
      return this._buildCollectorLayout(user_fn);
    };

    /*
      Internal method for wrap timing
    */


    TinyData.prototype._proceedSeekingOut = timeOnDemand('seekingOut', function(rake_function, stringifyed_object) {
      var raked_object;
      return raked_object = rake_function(stringifyed_object);
    });

    /*
      This method create 'emit' function for data collection
    */


    TinyData.prototype._buildEmitCollector = function(result_obj) {
      var _this = this;
      return function(key, value) {
        var _ref1;
        if ((key != null) && (value != null)) {
          if ((_ref1 = result_obj[key]) == null) {
            result_obj[key] = [];
          }
          result_obj[key].push(value);
          return null;
        }
      };
    };

    /*
      This method create collector layout for any worker
    */


    TinyData.prototype._buildCollectorLayout = function(work_fn) {
      var _this = this;
      return function(in_obj) {
        var arg_type, emit, item, key, rake_result, _i, _j, _len, _len1, _ref1;
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
            _ref1 = _.keys(in_obj);
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              key = _ref1[_j];
              work_fn.call(_this, key, in_obj[key], emit);
            }
            break;
          default:
            throw Error("cant work with object type |" + arg_type + "|");
        }
        return rake_result;
      };
    };

    /*
      This method return rake function itself, its different for 
      RegExp or Function
    */


    TinyData.prototype._buildRakeFunction = function(rake_rule_type, rake_rule, interp_sequence) {
      var _this = this;
      switch (rake_rule_type) {
        case 'REGEXP':
          if (this._dot_decorator_settings_.rakeAny.convert_income_rake_regexp) {
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

    /*
      This method parse arg and may ensure its type
    */


    TinyData.prototype._argParser = function(arg, arg_name, strict_type) {
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
    };

    return TinyData;

  })();

  module.exports = TinyData;

}).call(this);
}});
