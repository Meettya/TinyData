###
Test suite for node AND browser in one file
So, we are need some data from global
Its so wrong, but its OK for test
###
# resolve require from [window] or by require() 
_ = @_ ? require 'lodash'

lib_path = GLOBAL?.lib_path || ''

TinyData = require "#{lib_path}tinydata"

describe 'TinyData:', ->

  object_td = null

  first_object_rpath = '^([^.]+\\.)([^.]+)$' 
  first_object = 
    firs   : 'one'
    second : 'two'
    third  : 'three'

  first_object_stringify = [
    'firs.one'
    'second.two'
    'third.three'
  ]

  first_object_result = 
    one: [ 'firs' ]
    two: [ 'second' ]
    three: [ 'third' ]

  # hm.. may be it needed to write rpath generator?
  # mean (element.element).(value) => value : [element.element]
  second_object_rpath = /^((?:[^.]+\.){2})([^.]+)$/
  second_object = 
    first : [
      'one'
      'two'
      'three'
    ]
    second : [
      'four'
      'five'
    ]
    third : [
      'six'
      ['seven']
    ]

  second_object_stringify = [
    'first.0.one'
    'first.1.two'
    'first.2.three'
    'second.0.four'
    'second.1.five'
    'third.0.six'
    'third.1.0.seven'
  ]

  second_object_result = 
    one   : [ 'first.0'  ]
    two   : [ 'first.1'  ]
    three : [ 'first.2'  ]
    four  : [ 'second.0' ]
    five  : [ 'second.1' ]
    six   : [ 'third.0'  ]

  second_object_rpath_two = '^((?:[^.]+\\.){3})([^.]+)$'

  second_object_result_two =
    seven : ['third.1.0']

  third_object_rpath = (stringifyed_item, emit) ->
    if mached_data = stringifyed_item.match /^([^.]+\.[^.]+)\.([^.]+)$/
      emit mached_data[2], mached_data[1]
    null

  third_object = 
    first : [
      'one'
      'two'
      'three'
    ]
    second : [
      'one'
      'two'
      'four'

    ]
    third : [
      'six'
      'three'
    ]

  third_object_result = 
    one   : [ 
      'first.0'
      'second.0' 
    ]
    two   : [ 
      'first.1'
      'second.1' 
    ]
    three : [
     'first.2'
     'third.1'
    ]
    four  : [
     'second.2'
    ]
    six   : [
      'third.0' 
    ]


  users = [
    {
      name : 'Вася'
      frends : [ 'Петя', 'Коля' ]
      like : [ 'пицца', 'BMX', 'рэп' ]
      date : new Date()
      rounded : yes
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

  user_like_rake_rule = '^(\\d+\\.)like\\.\\d+\\.([^.]+)$'

  # Substitute position in array to names
  userRakeFinalize = (users_list) -> 
    _.map users_list, (user_id) -> users[user_id].name

  users_finalize_result = 
    'пицца': [ 'Вася', 'Петя', 'Абдулла' ]
    BMX: [ 'Вася' ]
    'рэп': [ 'Вася' ]
    'скейт': [ 'Петя' ]
    soul: [ 'Петя', 'Маша' ]
    'пиво': [ 'Коля' ]
    'шансон': [ 'Коля' ]
    'овощи': [ 'Маша' ],
    'этника': [ 'Маша', 'Абдулла' ]
    'шоппинг': [ 'Маша' ]
    'теннис': [ 'Абдулла' ]

  user_like_rake_rule2 = (stringifyed_item, emit) ->
    if mached_data = stringifyed_item.match /^(\d+)\.name\.([^.]+)$/
      _(users[mached_data[1]].frends).each (item) -> 
        emit mached_data[2], item

  user_like2_result = 
    'Вася': [ 'Петя', 'Коля' ]
    'Петя': [ 'Вася', 'Абдулла' ]
    'Коля': [ 'Абдулла', 'Маша', 'Вася' ]
    'Маша': [ 'Коля', 'Абдулла' ]
    'Абдулла': [ 'Коля', 'Петя', 'Маша' ]

  describe 'new()', ->

    it 'should return TinyData object on void call', ->
      object_td = new TinyData()
      object_td.should.be.an.instanceof TinyData

    it 'should return TinyData object on call with data', ->
      object_td = new TinyData first_object
      object_td.should.be.an.instanceof TinyData

  describe '#rakeUp()', ->

    it 'should correct work with plain object and string as rake rule', ->
      object_td = new TinyData first_object
      object_td.rakeUp(first_object_rpath).should.be.a.eql first_object_result

    it 'should correct work with deep object and RegExp as rake rule', ->
      object_td = new TinyData second_object
      object_td.rakeUp(second_object_rpath).should.be.a.eql second_object_result

    it 'should correct work with doubled-value object and function as rake rule', ->
      object_td = new TinyData third_object
      object_td.rakeUp(third_object_rpath).should.be.a.eql third_object_result

    it 'should correct work with cached stringifyed results', ->
      object_td = new TinyData second_object
      object_td.rakeUp(second_object_rpath).should.be.a.eql second_object_result
      object_td.rakeUp(second_object_rpath_two).should.be.a.eql second_object_result_two

    it 'should correct work with finalize function', ->
      users_engine = new TinyData users
      users_engine.rakeUp(user_like_rake_rule, userRakeFinalize).should.be.a.eql users_finalize_result

    it 'should correct work with data changed rake rule function', ->
      users_engine = new TinyData users    
      users_engine.rakeUp(user_like_rake_rule2).should.be.a.eql user_like2_result

    it 'should throw error on void call', ->
      object_td = new TinyData second_object
      ( -> object_td.rakeUp() ).should.to.throw /argument must be/

    it 'should throw error on call with wrong rake rule type', ->
      object_td = new TinyData second_object
      ( -> object_td.rakeUp( data : false ) ).should.to.throw /argument must be/

    it 'should throw error on call with wrong finalize type', ->
      object_td = new TinyData second_object
      ( -> object_td.rakeUp 'test', 'test' ).should.to.throw /argument must be Function/

  describe '#rakeStringify()', ->

    it 'should return empty array on empty object', ->
      object_td = new TinyData
      object_td.rakeStringify().should.be.a.eql []   

    it 'should return correct value for plain object', ->
      object_td = new TinyData first_object
      object_td.rakeStringify().should.be.a.eql first_object_stringify 

    it 'should return correct value for deep object', ->
      object_td = new TinyData second_object
      object_td.rakeStringify().should.be.a.eql second_object_stringify
  
