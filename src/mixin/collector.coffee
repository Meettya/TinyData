###
This is Collector mixin - its create layout for object walker and result collection
###

# resolve require from [window] or by require() 
# use _.isPlainObject(x) to speedup type resolution
_ = @_ ? require 'lodash'

{getItType} = require "../lib/type_detector"

module.exports = instanceProperties = 

  ###
  This method create 'emit' function for data collection
  ###
  _buildEmitCollector : (result_obj) ->
    (key, value) =>
      # we are need some checking on data from user function
      if key? and value?
        result_obj[key] ?= []
        result_obj[key].push value
        null

  ###
  This method create collector layout for any worker
  ###
  _buildCollectorLayout : (work_fn) ->
    (in_obj) =>
      rake_result = {}
      emit = @_buildEmitCollector rake_result
      switch arg_type = getItType in_obj
        when 'ARRAY' then work_fn.call this, item, emit for item in in_obj
        when 'HASH' then  work_fn.call this, key, in_obj[key], emit for key in _.keys in_obj
        else 
          throw Error "cant work with object type |#{arg_type}|"
      rake_result