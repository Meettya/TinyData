###
Test suite for node AND browser in one file
So, we are need some data from global
Its so wrong, but its OK for test
###

# resolve require from [window] or by require() 
_ = @_ ? require 'lodash'

lib_path = GLOBAL?.lib_path || ''

RegExpDotForger = require "#{lib_path}regexp_dot_forger"

forger_obj = character_set_pattern = escaped_dot_pattern = null

dot_substitutor = "\uFE45"

character_set_pattern_suite = 
  example_true : [
    /[]/
    /[.]/
    /[[.]/
    /[.[]/
    /[\]\.\[]/
    /\\[\.]/
    /\\\\[.\\\\]\\/
    /[.\\]/
    /dtt[.]/
    /3434\\[\\.]\/\//
    /^\.rtt([^.]+)\./
    /^[^.]+\.comment\.([^.]+)\./
  ]
  example_false : [
    /\[.]/
    /\\\[.\.]/
    /ddsds\[.]/
  ]

escaped_dot_pattern_suite = 
  example_true : [
    /\./
    /\\\./
    /^\d+[.\]]ft\./
    /\\\\\.\\\.\./
  ]
  example_false : [
    /\\./
    /sd\b\\\\./
    /\(.\)/
  ]

substitution_test_suite = 
  example_true : [
    [ /\./ , /\uFE45/ ]
    [ /[.]/ , /[\uFE45]/ ]
    [ /[\.]/, /[\\uFE45]/ ]
    [ /[...]/ , /[\uFE45\uFE45\uFE45]/ ]
    [ /^[^.]+\.comment\.([^.]+)\./, /^[^﹅]+﹅comment﹅([^﹅]+)﹅/ ]
  ]
  example_false : [
    [ /\\./ , /\\./  ]
    [ /\[.]/, /\[.]/ ]
  ]

describe 'RegExpDotForger:', ->

  beforeEach ->
    forger_obj = new RegExpDotForger dot_substitutor

  describe 'new()', ->

    it 'should return RegExpDotForger object on call with data', ->
      forger_obj = new RegExpDotForger dot_substitutor
      forger_obj.should.be.an.instanceof RegExpDotForger

    it 'should throw Error on void call', ->
      ( -> new RegExpDotForger() ).should.to.throw /constructor must be called with/

  describe '#getPatternByName()', ->

    it 'should return existance pattern', ->
      character_set_pattern = forger_obj.getPatternByName 'character_set'
      character_set_pattern.should.to.be.instanceof RegExp

    it 'should throw Error on unknown name', ->
      ( -> forger_obj.getPatternByName 'foo_bar' ).should.to.throw /don`t know pattern/

  describe '#doForgeDots()', ->

    it 'should change escaped dots (\\.) and dots in character set ([.]) to substitutor', ->
      _.each substitution_test_suite.example_true, (test_suite) ->
        forger_obj.doForgeDots(test_suite[0]).should.be.eql test_suite[1]

    it 'should NOT change dots itself as "one symbol" (.) to substitutor', ->
      _.each substitution_test_suite.example_false, (test_suite) ->
        forger_obj.doForgeDots(test_suite[0]).should.be.eql test_suite[1]

  describe 'patterns ITSELF for searching in regexp patterns:', ->

    describe '\'character set\' search pattern:', ->

      beforeEach ->
        character_set_pattern = forger_obj.getPatternByName 'character_set'

      it 'should match righ things', ->
        _.each character_set_pattern_suite.example_true, (pattern) -> 
          #console.log pattern.source.match character_set_pattern
          character_set_pattern.test(pattern.source).should.to.be.true

      it 'should NOT match wrong things', ->
        _.each character_set_pattern_suite.example_false, (pattern) -> 
          #console.log pattern.source.match character_set_pattern
          character_set_pattern.test(pattern.source).should.to.be.false

    describe '\'escaped dot\' search pattern:', ->

      beforeEach ->
        escaped_dot_pattern = forger_obj.getPatternByName 'escaped_dot'

      it 'should match righ things', ->
        _.each escaped_dot_pattern_suite.example_true, (pattern) -> 
          #console.log pattern.source.match escaped_dot_pattern
          escaped_dot_pattern.test(pattern.source).should.to.be.true

      it 'should NOT match wrong things', ->
        _.each escaped_dot_pattern_suite.example_false, (pattern) -> 
          #console.log pattern.source.match escaped_dot_pattern
          escaped_dot_pattern.test(pattern.source).should.to.be.false

