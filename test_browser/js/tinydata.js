
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
}).call(this)({"tinydata": function(exports, require, module) {
/*
This is tiny data-mining engine

work as mapReduce, but in some different way
*/


(function() {
  var TinyData, _, _ref,
    __hasProp = {}.hasOwnProperty;

  _ = (_ref = this._) != null ? _ref : require('lodash');

  TinyData = (function() {

    function TinyData(_original_obj_, _options_) {
      this._original_obj_ = _original_obj_ != null ? _original_obj_ : {};
      this._options_ = _options_ != null ? _options_ : {};
      this._cache_stringifyed_object_ = null;
      this._stringification_rule = {
        stubs_list: [],
        stringify_filter: null
      };
      this._do_timing_ = (this._options_.timing != null) && this._options_.timing === true && ((typeof console !== "undefined" && console !== null ? console.time : void 0) != null) ? true : false;
    }

    /*
      This is #rakeUp() job - map through all stringifyed object and do some thing,
      then may do some finalization code
    */


    TinyData.prototype.rakeUp = function(in_rake_rule, finalize_function) {
      var key, rake_function, rake_rule, rake_rule_type, raked_object, value, _ref1, _ref2;
      _ref1 = this._argParser(in_rake_rule, 'rake_rule'), rake_rule_type = _ref1[0], rake_rule = _ref1[1];
      rake_function = this._buildRakeFunction(rake_rule_type, rake_rule);
      if ((_ref2 = this._cache_stringifyed_object_) == null) {
        this._cache_stringifyed_object_ = this.rakeStringify();
      }
      raked_object = this._proceedRake(rake_function);
      if ((finalize_function != null) && this._argParser(finalize_function, 'finalize_function', 'Function')) {
        for (key in raked_object) {
          if (!__hasProp.call(raked_object, key)) continue;
          value = raked_object[key];
          raked_object[key] = finalize_function(value);
        }
      }
      return raked_object;
    };

    /*
      This method stringify our original object
      may be used to speed up all by reduce stringification work
    */


    TinyData.prototype.rakeStringify = function(stringify_filter, stubs_list) {
      var _ref1, _ref2;
      if (stubs_list == null) {
        stubs_list = [];
      }
      if (this._do_timing_) {
        console.time('rakeStringify');
        if ((_ref1 = this._cache_stringifyed_object_) == null) {
          this._cache_stringifyed_object_ = this._doStringify(stringify_filter, stubs_list);
        }
        console.timeEnd('rakeStringify');
        return this._cache_stringifyed_object_;
      } else {
        return (_ref2 = this._cache_stringifyed_object_) != null ? _ref2 : this._cache_stringifyed_object_ = this._doStringify(stringify_filter, stubs_list);
      }
    };

    /*
      That's all, folks!
      Just few methods :)
      May be I will add one more - mapUp
    */


    /*
      Internal method for wrap timing
    */


    TinyData.prototype._proceedRake = function(rake_function) {
      var raked_object;
      if (this._do_timing_) {
        console.time('proceedRake');
        raked_object = rake_function(this._cache_stringifyed_object_);
        console.timeEnd('proceedRake');
        return raked_object;
      } else {
        return raked_object = rake_function(this._cache_stringifyed_object_);
      }
    };

    /*
      This method return rake function itself, its different for 
      RegExp or Function
    */


    TinyData.prototype._buildRakeFunction = function(rake_rule_type, rake_rule) {
      switch (rake_rule_type) {
        case 'REGEXP':
          return function(in_array) {
            var item, key, matched_obj, rake_result, value, _i, _len, _ref1, _ref2;
            rake_result = {};
            for (_i = 0, _len = in_array.length; _i < _len; _i++) {
              item = in_array[_i];
              if (!(matched_obj = item.match(rake_rule))) {
                continue;
              }
              _ref1 = [matched_obj[2], matched_obj[1].slice(0, -1)], key = _ref1[0], value = _ref1[1];
              if ((_ref2 = rake_result[key]) == null) {
                rake_result[key] = [];
              }
              rake_result[key].push(value);
              null;
            }
            return rake_result;
          };
        case 'FUNCTION':
          return function(in_array) {
            var emit, item, rake_result, _i, _len;
            rake_result = {};
            emit = function(key, value) {
              var _ref1;
              if ((key != null) && (value != null)) {
                if ((_ref1 = rake_result[key]) == null) {
                  rake_result[key] = [];
                }
                return rake_result[key].push(value);
              }
            };
            for (_i = 0, _len = in_array.length; _i < _len; _i++) {
              item = in_array[_i];
              rake_rule(item, emit);
            }
            return rake_result;
          };
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
        switch (arg_type = this._getItType(arg)) {
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
      }).call(this);
      if ((strict_type != null) && parsed_arg[0] !== strict_type.toUpperCase()) {
        throw TypeError(err_formatter("argument must be " + strict_type + ", but got", arg_type));
      }
      return parsed_arg;
    };

    /*
      This method stringify object
    */


    TinyData.prototype._doStringify2 = function(stringify_rule, stubs_list) {
      var idx, in_obj, in_obj_type, innner_loop, job_pointer, job_queue, key, prefix, queue_end_pointer, result_array, value, _i, _j, _len, _len1, _ref1, _ref2;
      result_array = [];
      innner_loop = null;
      console.log('_doStringify2');
      job_queue = [[this._original_obj_, '']];
      job_pointer = 0;
      queue_end_pointer = 1;
      while (queue_end_pointer > job_pointer) {
        _ref1 = job_queue[job_pointer], in_obj = _ref1[0], prefix = _ref1[1];
        switch (in_obj_type = this._getItType(in_obj)) {
          case 'HASH':
            _ref2 = _.keys(in_obj);
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              key = _ref2[_i];
              value = in_obj[key];
              job_queue.push([value, "" + prefix + key + "."]);
              queue_end_pointer += 1;
            }
            break;
          case 'ARRAY':
            for (idx = _j = 0, _len1 = in_obj.length; _j < _len1; idx = ++_j) {
              value = in_obj[idx];
              job_queue.push([value, "" + prefix + idx + "."]);
              queue_end_pointer += 1;
            }
            break;
          case 'PLAIN':
          case 'STRING':
            result_array.push("" + prefix + in_obj);
            break;
          case 'DATE':
          case 'REGEXP':
            result_array.push("" + prefix + "__" + in_obj_type + "__|" + in_obj + "|__");
            break;
          default:
            result_array.push("" + prefix + "__" + in_obj_type + "__");
        }
        job_pointer += 1;
      }
      return result_array;
    };

    /*
      This method stringify object
    */


    TinyData.prototype._doStringify = function(stringify_rule, stubs_list) {
      var innner_loop, is_filter_passed, name_matcher, result_array,
        _this = this;
      result_array = [];
      innner_loop = null;
      if (stringify_rule == null) {
        innner_loop = function(in_obj, prefix) {
          var idx, in_obj_type, key, value, _i, _j, _len, _len1, _ref1;
          switch (in_obj_type = _this._getItType(in_obj)) {
            case 'HASH':
              _ref1 = _.keys(in_obj);
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                key = _ref1[_i];
                innner_loop(in_obj[key], "" + prefix + key + ".");
              }
              break;
            case 'ARRAY':
              for (idx = _j = 0, _len1 = in_obj.length; _j < _len1; idx = ++_j) {
                value = in_obj[idx];
                innner_loop(value, "" + prefix + idx + ".");
              }
              break;
            case 'PLAIN':
            case 'STRING':
              result_array.push("" + prefix + in_obj);
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
      } else {
        name_matcher = stringify_rule.origin_pattern != null ? function(matcher_elem_name, matcher_elem_origin) {
          return matcher_elem_name === stringify_rule.element_name && stringify_rule.origin_pattern.test(matcher_elem_origin);
        } : function(matcher_elem_name) {
          return matcher_elem_name === stringify_rule.element_name;
        };
        is_filter_passed = function(elem_origin, elem_name, elem_depth) {
          if (stringify_rule.apply_on_depth !== elem_depth) {
            return true;
          } else {
            return name_matcher(elem_name, elem_origin);
          }
        };
        innner_loop = function(in_obj, prefix, depth) {
          var idx, in_obj_type, key, value, _i, _j, _len, _len1, _ref1;
          switch (in_obj_type = _this._getItType(in_obj)) {
            case 'HASH':
              _ref1 = _.keys(in_obj);
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                key = _ref1[_i];
                if (is_filter_passed(prefix, key, depth)) {
                  innner_loop(in_obj[key], "" + prefix + key + ".", depth + 1);
                }
              }
              break;
            case 'ARRAY':
              for (idx = _j = 0, _len1 = in_obj.length; _j < _len1; idx = ++_j) {
                value = in_obj[idx];
                if (is_filter_passed(prefix, idx, depth)) {
                  innner_loop(value, "" + prefix + idx + ".", depth + 1);
                }
              }
              break;
            case 'PLAIN':
            case 'STRING':
              result_array.push("" + prefix + in_obj);
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
      }
      innner_loop(this._original_obj_, '', 0);
      return result_array;
    };

    /*
      This method return type of incoming things
      HASH mean NOT a function or RegExp or something else  - just simple object
    */


    TinyData.prototype._getItType = function(x) {
      if (_.isPlainObject(x)) {
        return 'HASH';
      } else if (_.isArray(x)) {
        return 'ARRAY';
      } else if (_.isString(x)) {
        return 'STRING';
      } else if (_.isNumber(x) || _.isBoolean(x) || _.isNull(x)) {
        return 'PLAIN';
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
    };

    return TinyData;

  })();

  module.exports = TinyData;

}).call(this);
}});
