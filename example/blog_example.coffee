#!/usr/bin/env coffee

_ = require 'lodash'

# to reload TinyData
_.forOwn require.cache, (val,key) -> delete require.cache[key]
TinyData = require '../src/tinydata'

blog_data = require './blog_example_data'

console.log "\n-----START-----\n"

comments_ratings_rule = /^(\d+\.comments\.\d+\.(?:comments\.\d+\.)*)rating\.([^.]+)/

comments_finalizer = (key, values, emit) -> 
  _.each values, (item) -> emit Math.ceil(key), item

object_td = new TinyData blog_data #, debug : yes
comments_ratings = object_td.sortOutVerso comments_ratings_rule, comments_finalizer

console.log "\n Ratings for all comments"
console.log comments_ratings

# get all comments by posts
comments_by_post_rule = /^((\d+)\.comments\.\d+\.(?:comments\.\d+\.)*)_id/

comments_by_post = object_td.sortOutVerso comments_by_post_rule

console.log "\n Comments for every post"
console.log comments_by_post

# get all posts without comments
posts_without_comments_rule = /^((\d+)\.comments\.)__EMPTY__\|ARRAY\|/
#console.log object_td.rakeStringify()
posts_without_comments = object_td.sortOutVerso posts_without_comments_rule

console.log "\n Posts without comments"
console.log posts_without_comments


make_rating_values_rule = (regexp_transform_fn) ->
  transformed_regexp = regexp_transform_fn /^(\d+)\.comments\.\d+\.(?:comments\.\d+\.)*rating\.([^.]+)/
  
  (stringifyed_item, emit) ->
    if mached_data = stringifyed_item.match transformed_regexp
      emit mached_data[1], mached_data[2]
    null

rating_aggregator = (key, values, emit) -> 
  sum_of_all_rating = _.reduce values, (memo, num) -> parseFloat(memo) + parseFloat num
  emit key, sum_of_all_rating / values.length 
  null

rating_values_rule = make_rating_values_rule object_td.doTransormRegExp
posts_with_raitings = object_td.sortOutVerso rating_values_rule, rating_aggregator

console.log "\n Posts with rating form comments"
console.log posts_with_raitings

console.log "\n---END----\n"










