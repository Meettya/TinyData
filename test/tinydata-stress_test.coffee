###
Test suite for node AND browser in one file
So, we are need some data from global
Its so wrong, but its OK for test
###

# resolve require from [window] or by require() 
_ = @_ ? require 'underscore'

lib_path = GLOBAL?.lib_path || ''

TinyData = require "#{lib_path}tinydata"

describe 'TinyData: stress test', ->

  object_td = huge_array = null

  user_like_rpath = '^(.+\\.)like\\.\\d+\\.([^.]+)$'

  users = [
    {
      name : 'Вася'
      frends : [ 'Петя', 'Коля' ]
      like : [ 'пицца', 'BMX', 'рэп' ]
    },
    {
      name : 'Петя'
      frends : [ 'Вася','Абдулла' ]
      like : [ 'пицца', 'скейт', 'soul' ]
    },
    {
      name : 'Коля'
      frends : [ 'Абдулла', 'Маша', 'Вася' ]
      like : [ 'пиво', 'шансон' ]
    },
    {
      name : 'Маша'
      frends : [ 'Коля', 'Абдулла' ]
      like : [ 'овощи', 'soul', 'этника', 'шоппинг' ]
    },
    {
      name : 'Абдулла'
      frends : [ 'Коля', 'Петя', 'Маша' ]
      like : [ 'пицца', 'теннис', 'этника' ]
    }
  ]

  beforeEach ->
    object_td = new TinyData()

  describe '#getOriginFor()', ->

    beforeEach ->
      huge_array = _.union [], users

    it 'should work on huge data (20480 objects in set) ', ->

      _(12).times -> huge_array = huge_array.concat huge_array

      object_td.setOriginalObject(huge_array).setRpath(user_like_rpath)
      huge_result = object_td.getOriginFor 'soul'

      _.size(huge_array).should.be.a.equal 20480
      _.size(huge_result).should.be.a.equal 8192

    it 'should work on huge data (40960 objects in set) ', ->

      _(13).times -> huge_array = huge_array.concat huge_array

      object_td.setOriginalObject(huge_array).setRpath(user_like_rpath)
      huge_result = object_td.getOriginFor 'soul'

      _.size(huge_array).should.be.a.equal 40960
      _.size(huge_result).should.be.a.equal 16384

    it 'should work on huge data (81920 objects in set) ', ->

      _(14).times -> huge_array = huge_array.concat huge_array

      object_td.setOriginalObject(huge_array).setRpath(user_like_rpath)
      huge_result = object_td.getOriginFor 'soul'

      _.size(huge_array).should.be.a.equal 81920
      _.size(huge_result).should.be.a.equal 32768



