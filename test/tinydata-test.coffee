###
Test suite for node AND browser in one file
So, we are need some data from global
Its so wrong, but its OK for test
###
lib_path = GLOBAL?.lib_path || ''

TinyData = require "#{lib_path}tinydata"

describe 'TinyData:', ->

  object_td = null

  first_object = 
    firs   : 'one'
    second : 'two'
    third  : 'three'

  first_object_stringify = [
    'firs.one'
    'second.two'
    'third.three'
  ]

  first_object_secondary_index = 
    one: [ 'firs' ]
    two: [ 'second' ]
    three: [ 'third' ]

  # hm.. may be it needed to write rpath generator?
  # mean (element.element).(value) => value : [element.element]
  second_object_rpath = '^((?:[^.]+\\.){2})([^.]+)$' 
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

  second_object_secondary_index = 
    one   : [ 'first.0'  ]
    two   : [ 'first.1'  ]
    three : [ 'first.2'  ]
    four  : [ 'second.0' ]
    five  : [ 'second.1' ]
    six   : [ 'third.0'  ]

  second_object_rpath_two = '^((?:[^.]+\\.){3})([^.]+)$'

  second_object_secondary_index_two =
    seven : ['third.1.0']

  third_object_rpath = '^((?:[^.]+\\.){2})([^.]+)$' 
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

  third_object_secondary_index = 
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

  beforeEach ->
    object_td = new TinyData()

  describe 'new()', ->

    it 'should return TinyData object', ->
      object_td.should.be.an.instanceof TinyData

    it 'should construct and build secondary index at init', ->
      local_object = new TinyData second_object, second_object_rpath
      local_object.getOriginFor('three').should.be.a.eql  second_object_secondary_index.three

  describe '#setOriginalObject()', ->

    it 'should setup object and return self', ->
      object_td.setOriginalObject(first_object).should.be.an.instanceof TinyData

    it 'should build correct index for for plain object after set', ->
      object_td.setOriginalObject(first_object)
      object_td.getSecondaryIndex().should.be.a.eql first_object_secondary_index

    it 'should build correct index for for deep object', ->
      object_td.setOriginalObject(second_object).setRpath(second_object_rpath)
      object_td.getSecondaryIndex().should.be.a.eql second_object_secondary_index

    it 'should build correct index for for doubled-value object', ->
      object_td.setOriginalObject(first_object)
      object_td.setOriginalObject(third_object).setRpath(third_object_rpath)
      object_td.getSecondaryIndex().should.be.a.eql third_object_secondary_index

  describe '#getOriginalObject()', ->

    it 'should return original object', ->
      object_td.setOriginalObject first_object
      object_td.getOriginalObject().should.be.a.equal first_object

  describe '#setRpath()', ->

    it 'should setup Rpath and return self', ->
      object_td.setRpath(second_object_rpath).should.be.an.instanceof TinyData

    it 'should rebuild secondary index on untouched stringifyed results', ->
      local_object = new TinyData second_object, second_object_rpath
      local_object.setRpath(second_object_rpath_two)
      local_object.getSecondaryIndex().should.be.a.eql  second_object_secondary_index_two

  describe '#getRpath()', ->

    it 'should return original string', ->
      object_td.setRpath second_object_rpath
      object_td.getRpath().should.be.a.equal second_object_rpath
 
  describe '#getSecondaryIndex()', ->

    it 'should return empty index for empty object', ->
      object_td.getSecondaryIndex().should.be.a.eql {}

    it 'should return correct value for plain object', ->
      object_td.setOriginalObject(first_object)
      object_td.getSecondaryIndex().should.be.a.eql first_object_secondary_index

    it 'should return correct value for deep object', ->
      object_td.setOriginalObject(second_object).setRpath(second_object_rpath)
      object_td.getSecondaryIndex().should.be.a.eql  second_object_secondary_index

  describe '#getStringifyedObject()', ->

    it 'should return empty array on empty object', ->
      object_td.getStringifyedObject().should.be.a.eql []   

    it 'should return correct value for plain object', ->
      object_td.setOriginalObject(first_object)
      object_td.getStringifyedObject().should.be.a.eql first_object_stringify 

    it 'should return correct value for deep object', ->
      object_td.setOriginalObject(second_object)
      object_td.getStringifyedObject().should.be.a.eql second_object_stringify
  
  describe '#getOriginFor()', ->

    it 'should return undef on empty object', ->
      expect(object_td.getOriginFor 'foo').to.be.undefined;
  
    it 'should return correct value for plain object', ->
      object_td.setOriginalObject(first_object)
      object_td.getOriginFor('two').should.be.a.eql  first_object_secondary_index.two 

    it 'should return correct value for deep object', ->
      object_td.setOriginalObject(second_object).setRpath(second_object_rpath)
      object_td.getOriginFor('three').should.be.a.eql  second_object_secondary_index.three

    it 'should return correct value for doubled-value object', ->
      object_td.setOriginalObject(third_object).setRpath(third_object_rpath)
      object_td.getOriginFor('three').should.be.a.eql  third_object_secondary_index.three

