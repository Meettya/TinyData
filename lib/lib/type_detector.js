// Generated by CoffeeScript 1.4.0

/*
This is type detector for any JS type.

Will be used as simply module with one exported function,
not a class - its dont needed
*/


(function() {
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

}).call(this);