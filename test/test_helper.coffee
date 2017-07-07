###
global helper for chai.should()
###
chai = require 'chai'
global.should = chai.should()
global.expect = chai.expect # to work with 'undefined' - should cant it
