###
This is Object with secondary index.

Very helpful for some fast value-to-key searchings

Yes, its may looks wired but I need it
###

# resolve require from [window] or by require() 
_ = @_ ? require 'underscore'

class TinyData 

  constructor: (@_original_obj_={}, @_rpath_) ->
    @_rpath_ ?= '^([^.]+\\.)([^.]+)$' # => '(key).(value)'
    @_secondary_index_ = {}
    # here we are put our graph to string resolutions
    @_stringifyed_object_ = []
    @_state_convergence_ = {}

    @_changeStateFlags false, 'stringifyed_object', 'secondary_index'

  ###
  This method set original object
  ###
  setOriginalObject : (object={}) ->
    @_original_obj_ = object
    # pull down all flags
    @_changeStateFlags false, 'stringifyed_object', 'secondary_index'
    this

  ###
  This method get original object
  may used in some cases
  ###
  getOriginalObject : ->
    @_original_obj_

  ###
  This method return secondary index itself
  ###
  getSecondaryIndex : ->
    @_synchronizeState()
    @_secondary_index_

  ###
  Setter and getter for rpath
  REMEMBER! rpath is string regexp -
     you need TWICED ESCAPE or all do in wrong way
  ###
  setRpath : (new_rpath) ->
    @_rpath_ = new_rpath
    @_changeStateFlags false, 'secondary_index'
    this

  getRpath : ->
    @_rpath_

  ###
  for test or may be user want work on it by himself
  ###
  getStringifyedObject : ->
    @_synchronizeState()
    @_stringifyed_object_

  ###
  This method return 'origin paths' by secondary index 
  ###
  getOriginFor : (key) ->
    @_synchronizeState()
    @_secondary_index_[key]
    
  ###
  This method, if needed re-stringify original object or rebuild secondary index
  then rebuild secondary index
  ###
  _synchronizeState: ->
    # at first - build raw stringifyed graph
    unless @_getStateFlag 'stringifyed_object'
      @_stringifyed_object_ = @_doStringify @_original_obj_
      @_changeStateFlags true, 'stringifyed_object'
    # at second - build secondary index
    unless @_getStateFlag 'secondary_index'
      @_secondary_index_ = @_makeSecondaryIndex @_stringifyed_object_, @_rpath_
      @_changeStateFlags true, 'secondary_index'

    null

  ###
  This method make secondary index
  ###
  _makeSecondaryIndex: (in_array, rpath) ->

    secondary_index = {}
    # build our search pattern
    index_re = RegExp rpath

    for item in in_array when matched_obj = item.match index_re
      [ key, value ] = [ matched_obj[2], matched_obj[1].slice 0, -1 ]
      secondary_index[key] ?= []
      secondary_index[key].push value
      null

    secondary_index

  ###
  This method stringify object
  ###
  _doStringify: (in_obj, prefix='', result_array=[]) ->

    switch in_obj_type = @_getItType in_obj
      when 'PLAIN', 'STRING'
        result_array.push "#{prefix}#{in_obj}"
      when 'ARRAY', 'HASH'
        _.each in_obj, (value, key) => 
          @_doStringify value, "#{prefix}#{key}.", result_array
      else
        result_array.push "#{prefix}__#{in_obj}__"

    result_array

  ###
  This method return type of incoming things
  HASH mean NOT a function or RegExp or something else  - just simple object
  ###
  _getItType : (x) ->
    # it simple
    if _.isArray(x)
      'ARRAY' 
    # little bit harder 
    else if _.isString(x)
      'STRING'
    else if _.isNumber(x) or _.isBoolean(x) or _.isNull(x)
      'PLAIN' 
    # and it not
    else if _.isObject(x)
      if _.isFunction(x)
        'FUNCTION'
      else if _.isRegExp(x)
        'REGEXP'
      else if _.isDate(x)
        'DATE' 
      else if _.isArguments(x)
        'ARGUMENTS'
      else
        'HASH'
    else 
      'OTHER'

  ###
  Incapsulate state flags management
  ###
  _changeStateFlags : (new_value, names...) ->
    _.each names, (name) => 
      @_state_convergence_[name] = new_value
    null

  _getStateFlag : (name) ->
    @_state_convergence_[name]

module.exports = TinyData
