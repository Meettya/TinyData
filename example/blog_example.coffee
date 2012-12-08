#!/usr/bin/env coffee

_ = require 'lodash'

# to reload TinyData
_.forOwn require.cache, (val,key) -> delete require.cache[key]
TinyData = require '../src/tinydata'

console.log "\n---OK----"

example_true = [
  /[.]/,
  /[[.]/,
  /[.[]/,
  /[\]\.\[]/,
  /\\[\.]/,
  /\\\\[.\\\\]\\/,
  /[.\\]/,
  /dtt[.]/,
  /3434\\[\\.]\/\//,
  /^\.rtt([^.]+)\./
  ]  

example_false = [
  /\[.]/,
  /\\\[.\.]/,
  /ddsds\[.]/
]

console.log example_true

console.log example_false

dot_in_charaster_set = /(?:^|[^\\]+)(?:\\{2})*(\[.*?(?:(?:\\{2})+|(?:\\{2})*[^\\]+)])/

_.each example_true, (pattern) -> console.log pattern.source.match dot_in_charaster_set
console.log "\n"
_.each example_false, (pattern) -> console.log pattern.source.match dot_in_charaster_set

###

blog_data = require './blog_example_data'

console.log "\n-----START-----\n"

comments_raitings_rule = /^(\d+\\.comments\.\d+\.(?:comments\.\d+\.)*)rating\.([^.]+)/

object_td = new TinyData blog_data, timing : yes

stringifyed_data = object_td.rakeStringify()

#console.log stringifyed_data

comments_raitings = object_td.rakeUp comments_raitings_rule

console.log ""
console.log comments_raitings

console.log "\n---OK----\n"


###