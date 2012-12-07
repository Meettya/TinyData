#!/usr/bin/env coffee


_ = require 'lodash'

# to reload TinyData
_.forOwn require.cache, (val,key) -> delete require.cache[key]


TinyData = require '../src/tinydata'


user_like_rpath = '^(\\d+\\.)like\\.\\d+\\.([^.]+)$'

users = [
  {
    name : 'Вася'
    frends : [ 'Петя', 'Коля' ]
    like : [ 'пицца', 'BMX', 'рэп' ]
    deeper :
      foourth : [yes]
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

console.log """

            ---------------------------RELOADED-------------------
                 #{new Date()}

            """

huge_array = _.union [], users

_(0).times -> huge_array = huge_array.concat huge_array

console.log "Array size: ", _.size(huge_array)

object_td = new TinyData huge_array, timing : yes



console.time '->  TinyData: rakeStringify'

stringify_filter = 
  origin_pattern  : /^\d+\.$/
  element_name    : 'like'
  apply_on_depth  : 1

#stringifyed = object_td.rakeStringify stringify_filter

#console.log stringifyed

huge_result = object_td.rakeUp user_like_rpath
console.timeEnd '->  TinyData: rakeStringify'


console.log _.size(huge_result['soul'])

console.log huge_result

console.log "\n--------REFERENCE------\n"

# user_like_rpath = '^(\\d+\\.)like\\.\\d+\\.([^.]+)$'

reference_func = (in_obj) ->
  like_dict = {}

  for item, item_idx in in_obj
    for own name, value of item when name is 'like'
      for element in value
        like_dict[element] ?= []
        like_dict[element].push "#{item_idx}"

  like_dict

console.time '->  reference: '
reference_result = reference_func huge_array
console.timeEnd '->  reference: '

console.log _.size(reference_result['soul'])

#console.log reference_result

console.log """
  
     #{new Date()}                        
---------------------------OK-------------------

            """

