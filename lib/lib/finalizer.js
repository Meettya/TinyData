// Generated by CoffeeScript 1.4.0

/*
This is Finalizer for TinyData

Its get object and filter (and may be convert) it to natural dot notation
*/


(function() {
  var ArgParserable, Collectable, Finalizer, MixinSupported, getItType, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = (_ref = this._) != null ? _ref : require('lodash');

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


    Finalizer.prototype._buildUserFinalizer = function(user_fn) {
      return this._buildCollectorLayout(user_fn);
    };

    return Finalizer;

  })(MixinSupported);

  module.exports = Finalizer;

}).call(this);