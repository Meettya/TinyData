// Generated by CoffeeScript 1.4.0

/*
This is log state object

Its configured by incoming object and return turned on statuses
*/


(function() {
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

}).call(this);