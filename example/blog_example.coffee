#!/usr/bin/env coffee

_ = require 'lodash'

# to reload TinyData
_.forOwn require.cache, (val,key) -> delete require.cache[key]
TinyData = require '../src/tinydata'

blog_data = require './blog_example_data'

console.log "\n-----START-----\n"

comments_raitings_rule = /^(\d+\.comments\.\d+\.(?:comments\.\d+\.)*)rating\.([^.]+)/

comments_finalizer = (key, values, emit) -> 
  _.each values, (item) -> emit Math.ceil(key), item

object_td = new TinyData blog_data #, debug : yes
comments_raitings = object_td.rakeUp comments_raitings_rule, comments_finalizer

console.log "\n Raitings for all comments"
console.log comments_raitings

# get all comments by posts
comments_by_post_rule = /^((\d+)\.comments\.\d+\.(?:comments\.\d+\.)*)_id/

comments_by_post = object_td.rakeUp comments_by_post_rule

console.log "\n Comments for every post"
console.log comments_by_post

console.log "\n---END----\n"

