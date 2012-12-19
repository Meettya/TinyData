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
comments_ratings = object_td.seekOutVerso comments_ratings_rule, comments_finalizer

console.log "\n Ratings for all comments"
#console.log comments_ratings

# get all comments by posts
comments_by_post_rule = /^((\d+)\.comments\.\d+\.(?:comments\.\d+\.)*)_id/

comments_by_post = object_td.seekOutVerso comments_by_post_rule

console.log "\n Comments for every post"
#console.log comments_by_post

# get all posts without comments
posts_without_comments_rule = /^((\d+)\.comments\.)__EMPTY__\|ARRAY\|/
#console.log object_td.rakeStringify()
posts_without_comments = object_td.seekOutVerso posts_without_comments_rule

console.log "\n Posts without comments"
#console.log posts_without_comments


make_rating_values_rule = (regexp_transform_fn, path_delimiter) ->
  transformed_verifyed_rating_regexp = regexp_transform_fn /^(\d+)\.comments\.\d+\.(?:comments\.\d+\.)*rating\.([^.]+)/
  anonymous_rating_rule = "^(\\d+)#{path_delimiter}rating#{path_delimiter}([^#{path_delimiter}]+)"
  (stringifyed_item, emit) ->
    if mached_data = stringifyed_item.match transformed_verifyed_rating_regexp
      emit mached_data[1], parseFloat mached_data[2]
    else if mached_data = stringifyed_item.match anonymous_rating_rule
      emit "_#{mached_data[1]}", parseFloat mached_data[2]
    null

rating_aggregator = (key, values, emit) -> 
  sum_of_all_rating = _.reduce values, (memo, num) -> memo + num
  emit key, sum_of_all_rating / values.length 
  null

rating_values_rule = make_rating_values_rule object_td.doTransormRegExp, object_td.getPathDelimiter 'internal'
posts_with_raitings = object_td.seekOutVerso rating_values_rule, rating_aggregator

console.log "\n Posts with ratings"
console.log posts_with_raitings

rating_stub = 3

for fake_key in _.keys posts_with_raitings when '_' is fake_key.charAt 0
  real_key = fake_key.slice 1
  verifyed_rating = posts_with_raitings[real_key]
  if verifyed_rating
    posts_with_raitings[real_key] = Math.ceil( posts_with_raitings[fake_key]*0.2 + posts_with_raitings[real_key]*0.8 )
  else
    posts_with_raitings[real_key] = Math.ceil( posts_with_raitings[fake_key]*0.5 + rating_stub*0.5 )

  delete posts_with_raitings[fake_key]

console.log posts_with_raitings

console.log "\n---END----\n"










