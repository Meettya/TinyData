// Generated by CoffeeScript 1.4.0

/*
Test suite for node AND browser in one file
So, we are need some data from global
Its so wrong, but its OK for test
*/


(function() {
  var TinyData, lib_path, _, _ref;

  _ = (_ref = this._) != null ? _ref : require('lodash');

  lib_path = (typeof GLOBAL !== "undefined" && GLOBAL !== null ? GLOBAL.lib_path : void 0) || '';

  TinyData = require("" + lib_path + "tinydata");

  describe('TinyData:', function() {
    var first_object, first_object_result, first_object_rpath, get_filtered_object_stringify, get_first_object_stringify, get_second_object_stringify, get_third_object_rpath, get_user_like_rake_rule2, object_td, second_object, second_object_result, second_object_result_two, second_object_rpath, second_object_rpath_two, stringify_filter, third_object, third_object_result, userRakeFinalize, user_like2_result, user_like_rake_rule, users, users_finalize_result;
    object_td = null;
    first_object_rpath = '^([^.]+\\.)([^.]+)$';
    first_object = {
      firs: 'one',
      second: 'two',
      third: 'three'
    };
    get_first_object_stringify = function(internal_dot) {
      var first_object_stringify;
      first_object_stringify = ['firs.one', 'second.two', 'third.three'];
      return _.map(first_object_stringify, function(item) {
        return item.replace(/\./g, internal_dot);
      });
    };
    first_object_result = {
      one: ['firs'],
      two: ['second'],
      three: ['third']
    };
    second_object_rpath = /^((?:[^.]+\.){2})([^.]+)$/;
    second_object = {
      first: ['one', 'two', 'three'],
      second: ['four', 'five'],
      third: ['six', ['seven']]
    };
    get_second_object_stringify = function(internal_dot) {
      var second_object_stringify;
      second_object_stringify = ['first.0.one', 'first.1.two', 'first.2.three', 'second.0.four', 'second.1.five', 'third.0.six', 'third.1.0.seven'];
      return _.map(second_object_stringify, function(item) {
        return item.replace(/\./g, internal_dot);
      });
    };
    second_object_result = {
      one: ['first.0'],
      two: ['first.1'],
      three: ['first.2'],
      four: ['second.0'],
      five: ['second.1'],
      six: ['third.0']
    };
    second_object_rpath_two = '^((?:[^.]+\\.){3})([^.]+)$';
    second_object_result_two = {
      seven: ['third.1.0']
    };
    get_third_object_rpath = function(regexp_transform_fn) {
      var transformed_regexp;
      transformed_regexp = regexp_transform_fn(/^([^.]+\.[^.]+)\.([^.]+)$/);
      return function(stringifyed_item, emit) {
        var mached_data;
        if (mached_data = stringifyed_item.match(transformed_regexp)) {
          emit(mached_data[2], mached_data[1]);
        }
        return null;
      };
    };
    third_object = {
      first: ['one', 'two', 'three'],
      second: ['one', 'two', 'four'],
      third: ['six', 'three']
    };
    third_object_result = {
      one: ['first.0', 'second.0'],
      two: ['first.1', 'second.1'],
      three: ['first.2', 'third.1'],
      four: ['second.2'],
      six: ['third.0']
    };
    users = [
      {
        name: 'Вася',
        frends: ['Петя', 'Коля'],
        like: ['пицца', 'BMX', 'рэп'],
        date: new Date(),
        rounded: true,
        age: 16
      }, {
        name: 'Петя',
        frends: ['Вася', 'Абдулла'],
        like: ['пицца', 'скейт', 'soul']
      }, {
        name: 'Коля',
        frends: ['Абдулла', 'Маша', 'Вася'],
        like: ['пиво', 'шансон']
      }, {
        name: 'Маша',
        frends: ['Коля', 'Абдулла'],
        like: ['овощи', 'soul', 'этника', 'шоппинг']
      }, {
        name: 'Абдулла',
        frends: ['Коля', 'Петя', 'Маша'],
        like: ['пицца', 'теннис', 'этника']
      }
    ];
    user_like_rake_rule = '^(\\d+\\.)like\\.\\d+\\.([^.]+)$';
    userRakeFinalize = function(key, value, emit) {
      return _.map(value, function(user_id) {
        return emit(key, users[user_id].name);
      });
    };
    users_finalize_result = {
      'пицца': ['Вася', 'Петя', 'Абдулла'],
      BMX: ['Вася'],
      'рэп': ['Вася'],
      'скейт': ['Петя'],
      soul: ['Петя', 'Маша'],
      'пиво': ['Коля'],
      'шансон': ['Коля'],
      'овощи': ['Маша'],
      'этника': ['Маша', 'Абдулла'],
      'шоппинг': ['Маша'],
      'теннис': ['Абдулла']
    };
    get_user_like_rake_rule2 = function(regexp_transform_fn) {
      var transformed_regexp;
      transformed_regexp = regexp_transform_fn(/^(\d+)\.name\.([^.]+)$/);
      return function(stringifyed_item, emit) {
        var mached_data;
        if (mached_data = stringifyed_item.match(transformed_regexp)) {
          return _(users[mached_data[1]].frends).each(function(item) {
            return emit(mached_data[2], item);
          });
        }
      };
    };
    user_like2_result = {
      'Вася': ['Петя', 'Коля'],
      'Петя': ['Вася', 'Абдулла'],
      'Коля': ['Абдулла', 'Маша', 'Вася'],
      'Маша': ['Коля', 'Абдулла'],
      'Абдулла': ['Коля', 'Петя', 'Маша']
    };
    stringify_filter = {
      origin_pattern: /^\d+\.$/,
      element_name: 'like',
      apply_on_depth: 1
    };
    get_filtered_object_stringify = function(internal_dot) {
      var filtered_object_stringify;
      filtered_object_stringify = ['0.like.0.пицца', '0.like.1.BMX', '0.like.2.рэп', '1.like.0.пицца', '1.like.1.скейт', '1.like.2.soul', '2.like.0.пиво', '2.like.1.шансон', '3.like.0.овощи', '3.like.1.soul', '3.like.2.этника', '3.like.3.шоппинг', '4.like.0.пицца', '4.like.1.теннис', '4.like.2.этника'];
      return _.map(filtered_object_stringify, function(item) {
        return item.replace(/\./g, internal_dot);
      });
    };
    describe('new()', function() {
      it('should return TinyData object on void call', function() {
        object_td = new TinyData();
        return object_td.should.be.an["instanceof"](TinyData);
      });
      return it('should return TinyData object on call with data', function() {
        object_td = new TinyData(first_object);
        return object_td.should.be.an["instanceof"](TinyData);
      });
    });
    describe('#seekOutVerso()', function() {
      it('should correct work with plain object and string as rake rule', function() {
        object_td = new TinyData(first_object);
        return object_td.seekOutVerso(first_object_rpath).should.be.a.eql(first_object_result);
      });
      it('should correct work with deep object and RegExp as rake rule', function() {
        object_td = new TinyData(second_object);
        return object_td.seekOutVerso(second_object_rpath).should.be.a.eql(second_object_result);
      });
      it('should correct work with doubled-value object and function as rake rule', function() {
        var third_object_rpath;
        object_td = new TinyData(third_object);
        third_object_rpath = get_third_object_rpath(object_td.doTransormRegExp);
        return object_td.seekOutVerso(third_object_rpath).should.be.a.eql(third_object_result);
      });
      it('should correct work with cached stringifyed results', function() {
        object_td = new TinyData(second_object);
        object_td.seekOutVerso(second_object_rpath).should.be.a.eql(second_object_result);
        return object_td.seekOutVerso(second_object_rpath_two).should.be.a.eql(second_object_result_two);
      });
      it('should correct work with finalize function', function() {
        var users_engine;
        users_engine = new TinyData(users);
        return users_engine.seekOutVerso(user_like_rake_rule, userRakeFinalize).should.be.a.eql(users_finalize_result);
      });
      it('should correct work with data changed rake rule function', function() {
        var user_like_rake_rule2, users_engine;
        users_engine = new TinyData(users);
        user_like_rake_rule2 = get_user_like_rake_rule2(users_engine.doTransormRegExp);
        return users_engine.seekOutVerso(user_like_rake_rule2).should.be.a.eql(user_like2_result);
      });
      it('should throw error on void call', function() {
        object_td = new TinyData(second_object);
        return (function() {
          return object_td.seekOutVerso();
        }).should.to["throw"](/argument must be/);
      });
      it('should throw error on call with wrong rake rule type', function() {
        object_td = new TinyData(second_object);
        return (function() {
          return object_td.seekOutVerso({
            data: false
          });
        }).should.to["throw"](/argument must be/);
      });
      return it('should throw error on call with wrong finalize type', function() {
        object_td = new TinyData(second_object);
        return (function() {
          return object_td.seekOutVerso('test', 'test');
        }).should.to["throw"](/argument must be Function/);
      });
    });
    return describe('#rakeStringify()', function() {
      it('should return empty array on empty object', function() {
        object_td = new TinyData;
        return object_td.rakeStringify().should.be.a.eql(['__EMPTY__|HASH|']);
      });
      it('should return correct value for plain object', function() {
        var first_object_string;
        object_td = new TinyData(first_object);
        first_object_string = get_first_object_stringify(object_td.getPathDelimiter('internal'));
        return object_td.rakeStringify().should.be.a.eql(first_object_string);
      });
      it('should return correct value for deep object', function() {
        var second_object_string;
        object_td = new TinyData(second_object);
        second_object_string = get_second_object_stringify(object_td.getPathDelimiter('internal'));
        return object_td.rakeStringify().should.be.a.eql(second_object_string);
      });
      return it('should correcty apply stringification filter', function() {
        var user_filtered_string, users_engine;
        users_engine = new TinyData(users);
        user_filtered_string = get_filtered_object_stringify(users_engine.getPathDelimiter('internal'));
        return users_engine.rakeStringify(stringify_filter).should.be.a.eql(user_filtered_string);
      });
    });
  });

}).call(this);
