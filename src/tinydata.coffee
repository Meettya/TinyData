###
This is tiny data-mining engine

work as mapReduce, but in some different way and use RegExp as path pointer
###

###
Timing method decorator
###
timeOnDemand = (label, methodBody) ->
  ->
    console.time label if @_do_timing_
    __rval__ = methodBody.apply this, arguments
    console.timeEnd label if @_do_timing_
    __rval__


# resolve require from [window] or by require() 
# use _.isPlainObject(x) to speedup type resolution
_ = @_ ? require 'lodash'

RegExpDotForger = require "./lib/regexp_dot_forger"
Stringificator  = require "./lib/stringificator"
{getItType}     = require "./lib/type_detector"
{argParser}     = require "./lib/arg_parser"

class TinyData 

  constructor: (@_original_obj_={}, @_options_={}) ->

    # debug turn on some switches
    if @_options_.debug? and @_options_.debug is on
       @_options_.timing  = on
       @_options_.logging = on
       @_do_warning_ = on

    # for benchmarking
    @_do_timing_ = if @_options_.timing? and @_options_.timing is on and console?.time? then yes else no
    # for debugging
    @_do_logging_ = if @_options_.logging? and @_options_.logging is on and console?.log? then yes else no
    @_do_warning_ = if @_options_.warning? and @_options_.warning is on and console?.warn? then yes else no


    # hm, its actually is bad things, but I don`t know how do it well
    @_dot_ = 
      internal : "\uFE45"
      external : '.'
    # and it needed to polish our dirty hack :)
    @_dot_decorator_settings_ =
      seekAny : 
        convert_income_rake_regexp : yes # take user RegExp (as string or RegExp) 
                                         # and replace dots to @_as_dot_.internal, 
                                         # not applied to function !!!!
        convert_before_finalize_function : yes # finalize_function get already converted data
        convert_out_result      : yes # before data returning 
                                      # (obsolete if convert_before_finalize_function is 'yes' )

    # to transform path delimiter  
    @_dot_forger_ = new RegExpDotForger @getPathDelimiter('internal'), log : @_do_logging_
    @_stringificator_ = new Stringificator @_original_obj_, @getPathDelimiter('internal'), @doTransormRegExp, log : @_do_logging_

  ###
  This method proceed 'seeking' through all stringifyed object and do some thing,
  then may do some finalization code
  Builded for common case of usage, 
  when rule is RegExp and we are want to map matched result in direct order:
  first capture -> key
  second capture -> value
  ###
  seekOut : (in_rake_rule, finalize_function, interp_sequence = {}) ->
    _.defaults interp_sequence, key : 1, value : 2
    if @_do_warning_ and interp_sequence.key >= interp_sequence.value
      console.warn """
                   for reverse interpretation direction it would be better to use #seekOutVerso()
                   |key_order|   = |#{interp_sequence.key }|
                   |value_order| = |#{interp_sequence.value}|
                   """
    @_seekOutAny in_rake_rule, finalize_function, interp_sequence
  
  ###
  This method proceed 'seeking' through all stringifyed object and do some thing,
  then may do some finalization code
  Builded for common case of usage, 
  when rule is RegExp and we are want to map matched result in reverse order:
  first capture -> value
  second capture -> key
  ###
  seekOutVerso : ( in_rake_rule, finalize_function, interp_sequence = {} ) ->
    _.defaults interp_sequence, key : 2, value : 1
    if @_do_warning_ and interp_sequence.value >= interp_sequence.key
      console.warn """
                   for direct interpretation direction it would be better to use #seekOut()
                   |key_order|   = |#{interp_sequence.key }|
                   |value_order| = |#{interp_sequence.value}|
                   """
    @_seekOutAny in_rake_rule, finalize_function, interp_sequence

  ###
  This method stringify our original object (materialize full path + add leaf )
  may be used to speed up all by reduce stringification work
  ###
  # TODO! parameter validator
  rakeStringify : ( timeOnDemand 'rakeStringify', (in_stringify_filter, in_stubs_list = []) ->
    @_stringificator_.stringifyObject in_stringify_filter, in_stubs_list
    )

  ###
  This method transform incoming RegExp changes \. (dot) to internal dot-substituter 
  ###
  doTransormRegExp: (original_regexp) =>
    # if it obsolete - don`t convert
    unless -1 is original_regexp.source.indexOf @getPathDelimiter('internal')
      if @_do_logging_ then console.log "doTransormRegExp: skip converting for |#{original_regexp}|"
      return original_regexp

    @_dot_forger_.doForgeDots original_regexp       

  ###
  This method may be used for user-defined function
  ###
  getPathDelimiter : (type) ->
    switch type.toUpperCase()
      when 'INTERNAL' then @_dot_.internal
      when 'EXTERNAL' then @_dot_.external
      else 
        throw Error """
                    so far don`t know path delimiter, named |#{type}|, mistype?
                    """

  ###
  That's all, folks!
  Just few public methods :)
  ###

  ###
  This is realy seek processor code, one for any directions
  ###
  _seekOutAny : (in_rake_rule, finalize_function, interp_sequence ) ->
    # we are need some prepare stuff
    [rake_rule_type, rake_rule] = argParser in_rake_rule, 'rake_rule'
    seek_function = @_buildSeekFunction rake_rule_type, rake_rule, interp_sequence
    # for timing call itself
    stringifyed_object = @rakeStringify()
    
    raked_object = @_proceedSeekingOut seek_function, stringifyed_object

    if finalization_name = @_getFinalizationName finalize_function
      finalizer = @_prepareFinalization finalization_name, finalize_function
      finalizer raked_object
    else
      raked_object


  ###
  Try to reduce logic level
  ###
  _getFinalizationName : (user_finalize_function) ->
    will_be_finalized = no

    if user_finalize_function? and argParser user_finalize_function, 'finalize_function', 'Function'
      if @_dot_decorator_settings_.seekAny.convert_before_finalize_function
        return 'DECORATE_THEN_FINALAZE' # YES, its middle-method return, you are really want to talk about it?
      else
        will_be_finalized = yes

    if @_dot_decorator_settings_.seekAny.convert_out_result
      if will_be_finalized
        'FINALAZE_THEN_DECORATE'
      else
        'DECORATE'

  ###
  This method build all finalization stuff
  and return simple function
  ###
  _prepareFinalization : (finalize_name, user_finalize_function) ->
    result_converter  = @_buildResultConvertor()
    user_finalizer    = @_buildUserFinalizer user_finalize_function

    switch finalize_name
      when 'DECORATE'
        (in_obj) => result_converter in_obj
      when 'FINALAZE_THEN_DECORATE'
        (in_obj) => result_converter user_finalizer in_obj
      when 'DECORATE_THEN_FINALAZE'
        (in_obj) => user_finalizer result_converter in_obj
      else
        throw Error "WTF???!!!"
  
  ###
  This method create function to wipe 'orchid' delimiter
  ###
  _makeBuffingDelimiterWeel : () ->
    dot_symbol = @getPathDelimiter 'external'
    delimiter_symbol = @getPathDelimiter 'internal'
    delimiter_pattern = new RegExp delimiter_symbol, 'g'

    # if it string - trim orchid delimiter (from right end) than replace it
    (in_data) =>
      return in_data unless 'STRING' is getItType in_data

      full_string = if delimiter_symbol is in_data.charAt in_data.length - 1
        in_data.slice 0, -1
      else
        in_data

      full_string.replace delimiter_pattern, dot_symbol 


  ###
  To separate logic of converting
  This method trim orchid internal delimiters at the end of keys AND values,
  than replace all internal dot to external (in values and keys too)
  ###
  _buildResultConvertor : ->
    buffing_delimiter = @_makeBuffingDelimiterWeel()

    (in_obj) =>
      result_obj = {}
      for in_key in _.keys in_obj
        res_key = buffing_delimiter in_key
        result_obj[res_key] = new Array in_obj[in_key].length # create same size array
        for in_item, idx in in_obj[in_key]
          result_obj[res_key][idx] = buffing_delimiter in_item
      
      result_obj 

  ###
  To separate logic of finalizator
  actually just wrapper
  ###
  _buildUserFinalizer : (user_fn) ->
    @_buildCollectorLayout user_fn

  ###
  Internal method for wrap timing 
  ###
  _proceedSeekingOut: ( timeOnDemand 'seekingOut', (seek_function, stringifyed_object) ->
    seek_function stringifyed_object
    )

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
  _buildCollectorLayout : (work_fn) =>
    (in_obj) =>
      rake_result = {}
      emit = @_buildEmitCollector rake_result
      switch arg_type = getItType in_obj
        when 'ARRAY' then work_fn.call this, item, emit for item in in_obj
        when 'HASH' then  work_fn.call this, key, in_obj[key], emit for key in _.keys in_obj
        else 
          throw Error "cant work with object type |#{arg_type}|"
      rake_result

  ###
  This method return rake function itself, its different for 
  RegExp or Function
  ###
  _buildSeekFunction : (rake_rule_type, rake_rule, interp_sequence) ->
    switch rake_rule_type
      when 'REGEXP'
        # if incoming RegExp needed to be transformed
        if @_dot_decorator_settings_.seekAny.convert_income_rake_regexp
          rake_rule = @doTransormRegExp rake_rule
        # if user send RegExp - transform it into function
        @_buildCollectorLayout (item, emit) =>
          if matched_obj = item.match rake_rule
            emit matched_obj[interp_sequence.key], matched_obj[interp_sequence.value]
            null
      when 'FUNCTION'
        # nothing to do - user are attaboy :)
        @_buildCollectorLayout rake_rule
      else
        # TODO! Add some more explanation
        throw Error "WTF???!!"
  

module.exports = TinyData

