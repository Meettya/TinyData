// Generated by CoffeeScript 1.4.0

/*
Test suite for node AND browser in one file
So, we are need some data from global
Its so wrong, but its OK for test
*/


(function() {
  var TinyData, lib_path, _, _ref;

  _ = (_ref = this._) != null ? _ref : require('underscore');

  lib_path = (typeof GLOBAL !== "undefined" && GLOBAL !== null ? GLOBAL.lib_path : void 0) || '';

  TinyData = require("" + lib_path + "tinydata");

  describe('TinyData: stress test', function() {
    var huge_array, object_td, user_like_rpath, users;
    object_td = huge_array = null;
    user_like_rpath = '^(.+\\.)like\\.\\d+\\.([^.]+)$';
    users = [
      {
        name: 'Вася',
        frends: ['Петя', 'Коля'],
        like: ['пицца', 'BMX', 'рэп']
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
    beforeEach(function() {
      return object_td = new TinyData();
    });
    return describe('#getOriginFor()', function() {
      beforeEach(function() {
        return huge_array = _.union([], users);
      });
      it('should work on huge data (20480 objects in set) ', function() {
        var huge_result;
        _(12).times(function() {
          return huge_array = huge_array.concat(huge_array);
        });
        object_td.setOriginalObject(huge_array).setRpath(user_like_rpath);
        huge_result = object_td.getOriginFor('soul');
        _.size(huge_array).should.be.a.equal(20480);
        return _.size(huge_result).should.be.a.equal(8192);
      });
      it('should work on huge data (40960 objects in set) ', function() {
        var huge_result;
        _(13).times(function() {
          return huge_array = huge_array.concat(huge_array);
        });
        object_td.setOriginalObject(huge_array).setRpath(user_like_rpath);
        huge_result = object_td.getOriginFor('soul');
        _.size(huge_array).should.be.a.equal(40960);
        return _.size(huge_result).should.be.a.equal(16384);
      });
      return it('should work on huge data (81920 objects in set) ', function() {
        var huge_result;
        _(14).times(function() {
          return huge_array = huge_array.concat(huge_array);
        });
        object_td.setOriginalObject(huge_array).setRpath(user_like_rpath);
        huge_result = object_td.getOriginFor('soul');
        _.size(huge_array).should.be.a.equal(81920);
        return _.size(huge_result).should.be.a.equal(32768);
      });
    });
  });

}).call(this);
