###
Test suite for node AND browser in one file
###

# resolve require from [window] or by require() 
_ = require 'lodash'

TinyData = require "../src/tinydata"

describe 'TinyData: stress test', ->

  object_td = huge_array = stringify_filter = null

  user_like_rpath = '^(\\d+\\.)like\\.\\d+\\.([^.]+)$'

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


  reference_func = (in_obj) ->
    console.time '->  reference: '
    like_dict = {}

    for item, item_idx in in_obj
      for own name, value of item when name is 'like'
        for element in value
          like_dict[element] ?= []
          like_dict[element].push "#{item_idx}"

    console.timeEnd '->  reference: '
    like_dict

  describe 'reference speed for clean js iterators', ->

    beforeEach ->
      huge_array = _.union [], users

    it 'should work on huge data (20480 objects in set) ', ->

      _(12).times -> huge_array = huge_array.concat huge_array

      huge_result = reference_func huge_array

      _.size(huge_array).should.be.a.equal 20480
      _.size(huge_result['soul']).should.be.a.equal 8192

    it 'should work on huge data (40960 objects in set) ', ->

      _(13).times -> huge_array = huge_array.concat huge_array

      huge_result = reference_func huge_array

      _.size(huge_array).should.be.a.equal 40960
      _.size(huge_result['soul']).should.be.a.equal 16384

    it 'should work on huge data (81920 objects in set) ', ->

      _(14).times -> huge_array = huge_array.concat huge_array

      huge_result = reference_func huge_array

      _.size(huge_array).should.be.a.equal 81920
      _.size(huge_result['soul']).should.be.a.equal 32768

  describe '#seekOutVerso() without optimization', ->

    beforeEach ->
      huge_array = _.union [], users

    it 'should work on huge data (20480 objects in set) ', ->

      _(12).times -> huge_array = huge_array.concat huge_array

      object_td = new TinyData huge_array, timing : yes
      huge_result = object_td.seekOutVerso user_like_rpath

      _.size(huge_array).should.be.a.equal 20480
      _.size(huge_result['soul']).should.be.a.equal 8192

    
    it 'should work on huge data (40960 objects in set) ', ->
      
      _(13).times -> huge_array = huge_array.concat huge_array

      object_td = new TinyData huge_array, timing : yes
      huge_result = object_td.seekOutVerso user_like_rpath

      _.size(huge_array).should.be.a.equal 40960
      _.size(huge_result['soul']).should.be.a.equal 16384
      

    it 'should work on huge data (81920 objects in set) ', ->
      
      _(14).times -> huge_array = huge_array.concat huge_array

      object_td = new TinyData huge_array, timing : yes
      huge_result = object_td.seekOutVerso user_like_rpath

      _.size(huge_array).should.be.a.equal 81920
      _.size(huge_result['soul']).should.be.a.equal 32768
      
  describe '#seekOutVerso() with rakeStringify pre-filter (with strict settings)', ->

    beforeEach ->
      huge_array = _.union [], users

      stringify_filter = 
        origin_pattern  : /^\d+\.$/
        element_name    : 'like'
        apply_on_depth  : 1

    it 'should work on huge data (20480 objects in set) ', ->

      _(12).times -> huge_array = huge_array.concat huge_array

      object_td = new TinyData huge_array, timing : yes
      object_td.rakeStringify stringify_filter
      huge_result = object_td.seekOutVerso user_like_rpath

      _.size(huge_array).should.be.a.equal 20480
      _.size(huge_result['soul']).should.be.a.equal 8192

    
    it 'should work on huge data (40960 objects in set) ', ->
      
      _(13).times -> huge_array = huge_array.concat huge_array

      object_td = new TinyData huge_array, timing : yes
      object_td.rakeStringify stringify_filter
      huge_result = object_td.seekOutVerso user_like_rpath

      _.size(huge_array).should.be.a.equal 40960
      _.size(huge_result['soul']).should.be.a.equal 16384
      

    it 'should work on huge data (81920 objects in set) ', ->
      
      _(14).times -> huge_array = huge_array.concat huge_array

      object_td = new TinyData huge_array, timing : yes
      object_td.rakeStringify stringify_filter
      huge_result = object_td.seekOutVerso user_like_rpath

      _.size(huge_array).should.be.a.equal 81920
      _.size(huge_result['soul']).should.be.a.equal 32768

  describe '#seekOutVerso() with rakeStringify pre-filter (with moderate settings)', ->

    beforeEach ->
      huge_array = _.union [], users

      stringify_filter = 
        element_name    : 'like'
        apply_on_depth  : 1

    it 'should work on huge data (20480 objects in set) ', ->

      _(12).times -> huge_array = huge_array.concat huge_array

      object_td = new TinyData huge_array, timing : yes
      object_td.rakeStringify stringify_filter
      huge_result = object_td.seekOutVerso user_like_rpath

      _.size(huge_array).should.be.a.equal 20480
      _.size(huge_result['soul']).should.be.a.equal 8192

    it 'should work on huge data (40960 objects in set) ', ->
      
      _(13).times -> huge_array = huge_array.concat huge_array

      object_td = new TinyData huge_array, timing : yes
      object_td.rakeStringify stringify_filter
      huge_result = object_td.seekOutVerso user_like_rpath

      _.size(huge_array).should.be.a.equal 40960
      _.size(huge_result['soul']).should.be.a.equal 16384
      

    it 'should work on huge data (81920 objects in set) ', ->
      
      _(14).times -> huge_array = huge_array.concat huge_array

      object_td = new TinyData huge_array, timing : yes
      object_td.rakeStringify stringify_filter
      huge_result = object_td.seekOutVerso user_like_rpath

      _.size(huge_array).should.be.a.equal 81920
      _.size(huge_result['soul']).should.be.a.equal 32768



