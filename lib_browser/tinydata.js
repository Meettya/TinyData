
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
This is Object with secondary index.

Very helpful for some fast value-to-key searchings

Yes, its may looks wired but I need it
*/


(function() {
  var TinyData, _, _ref,
    __slice = [].slice;

  _ = (_ref = this._) != null ? _ref : require('underscore');

  TinyData = (function() {

    function TinyData(_original_obj_, _rpath_) {
      var _ref1;
      this._original_obj_ = _original_obj_ != null ? _original_obj_ : {};
      this._rpath_ = _rpath_;
      if ((_ref1 = this._rpath_) == null) {
        this._rpath_ = '^([^.]+\\.)([^.]+)$';
      }
      this._secondary_index_ = {};
      this._stringifyed_object_ = [];
      this._state_convergence_ = {};
      this._changeStateFlags(false, 'stringifyed_object', 'secondary_index');
    }

    /*
      This method set original object
    */


    TinyData.prototype.setOriginalObject = function(object) {
      if (object == null) {
        object = {};
      }
      this._original_obj_ = object;
      this._changeStateFlags(false, 'stringifyed_object', 'secondary_index');
      return this;
    };

    /*
      This method get original object
      may used in some cases
    */


    TinyData.prototype.getOriginalObject = function() {
      return this._original_obj_;
    };

    /*
      This method return secondary index itself
    */


    TinyData.prototype.getSecondaryIndex = function() {
      this._synchronizeState();
      return this._secondary_index_;
    };

    /*
      Setter and getter for rpath
      REMEMBER! rpath is string regexp -
         you need TWICED ESCAPE or all do in wrong way
    */


    TinyData.prototype.setRpath = function(new_rpath) {
      this._rpath_ = new_rpath;
      this._changeStateFlags(false, 'secondary_index');
      return this;
    };

    TinyData.prototype.getRpath = function() {
      return this._rpath_;
    };

    /*
      for test or may be user want work on it by himself
    */


    TinyData.prototype.getStringifyedObject = function() {
      this._synchronizeState();
      return this._stringifyed_object_;
    };

    /*
      This method return 'origin paths' by secondary index
    */


    TinyData.prototype.getOriginFor = function(key) {
      this._synchronizeState();
      return this._secondary_index_[key];
    };

    /*
      This method, if needed re-stringify original object or rebuild secondary index
      then rebuild secondary index
    */


    TinyData.prototype._synchronizeState = function() {
      if (!this._getStateFlag('stringifyed_object')) {
        this._stringifyed_object_ = this._doStringify(this._original_obj_);
        this._changeStateFlags(true, 'stringifyed_object');
      }
      if (!this._getStateFlag('secondary_index')) {
        this._secondary_index_ = this._makeSecondaryIndex(this._stringifyed_object_, this._rpath_);
        this._changeStateFlags(true, 'secondary_index');
      }
      return null;
    };

    /*
      This method make secondary index
    */


    TinyData.prototype._makeSecondaryIndex = function(in_array, rpath) {
      var index_re, item, key, matched_obj, secondary_index, value, _i, _len, _ref1, _ref2;
      secondary_index = {};
      index_re = RegExp(rpath);
      for (_i = 0, _len = in_array.length; _i < _len; _i++) {
        item = in_array[_i];
        if (!(matched_obj = item.match(index_re))) {
          continue;
        }
        _ref1 = [matched_obj[2], matched_obj[1].slice(0, -1)], key = _ref1[0], value = _ref1[1];
        if ((_ref2 = secondary_index[key]) == null) {
          secondary_index[key] = [];
        }
        secondary_index[key].push(value);
        null;
      }
      return secondary_index;
    };

    /*
      This method stringify object
    */


    TinyData.prototype._doStringify = function(in_obj, prefix, result_array) {
      var in_obj_type,
        _this = this;
      if (prefix == null) {
        prefix = '';
      }
      if (result_array == null) {
        result_array = [];
      }
      switch (in_obj_type = this._getItType(in_obj)) {
        case 'PLAIN':
          result_array.push("" + prefix + in_obj);
          break;
        case 'ARRAY':
        case 'HASH':
          _.each(in_obj, function(value, key) {
            return _this._doStringify(value, "" + prefix + key + ".", result_array);
          });
          break;
        default:
          if (typeof console !== "undefined" && console !== null) {
            console.warn("don`t want stringify " + in_obj_type + " |" + in_obj + "|");
          }
      }
      return result_array;
    };

    /*
      This method return type of sanded things
      [ HASH | ARRAY | PLAIN | OTHER ]
      HASH mean NOT a function or RegExp or something else  - just simple object
    */


    TinyData.prototype._getItType = function(x) {
      if (_.isArray(x)) {
        return 'ARRAY';
      } else if (_.isString(x) || _.isNumber(x) || _.isBoolean(x) || _.isNull(x)) {
        return 'PLAIN';
      } else if (_.isObject(x) && !(_.isFunction(x) || _.isRegExp(x) || _.isDate(x) || _.isArguments(x))) {
        return 'HASH';
      } else {
        return 'OTHER';
      }
    };

    /*
      Incapsulate state flags management
    */


    TinyData.prototype._changeStateFlags = function() {
      var names, new_value,
        _this = this;
      new_value = arguments[0], names = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _.each(names, function(name) {
        return _this._state_convergence_[name] = new_value;
      });
      return null;
    };

    TinyData.prototype._getStateFlag = function(name) {
      return this._state_convergence_[name];
    };

    return TinyData;

  })();

  module.exports = TinyData;

}).call(this);
}});
