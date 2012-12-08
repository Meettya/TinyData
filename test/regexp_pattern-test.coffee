###
Test suite for node AND browser in one file
So, we are need some data from global
Its so wrong, but its OK for test
###

# resolve require from [window] or by require() 
_ = @_ ? require 'lodash'

lib_path = GLOBAL?.lib_path || ''

patterns = require "#{lib_path}regexp_patterns"

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
  ],
  example_false : [
    /\[.]/
    /\\\[.\.]/
    /ddsds\[.]/
  ]


describe 'RegExp patterns for serching in regexp patterns:', ->

  describe 'character set search pattern:', ->

    it 'should match righ things', ->
      _.each character_set_pattern_suite.example_true, (pattern) -> 
        #console.log pattern.source.match patterns.character_set
        patterns.character_set.test(pattern.source).should.to.be.true

    it 'should NOT match wrong things', ->
      _.each character_set_pattern_suite.example_false, (pattern) -> 
        #console.log pattern.source.match patterns.character_set
        patterns.character_set.test(pattern.source).should.to.be.false
