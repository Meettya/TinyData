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

###
Cache mechanism for stringify
###
cacheStringify = (methodBody) ->
  (in_stringify_filter, in_stubs_list)->
    stringy_filter = @_stringification_rule.stringify_filter
    stringify_stub_list = @_stringification_rule.stubs_list
    if not @_cache_stringifyed_object_? or not _.isEqual(in_stringify_filter, stringy_filter) or not _.isEqual in_stubs_list, stringify_stub_list
      console.log 'stringify cache miss' if @_do_logging_
      [stringy_filter, stringify_stub_list] = [in_stringify_filter, in_stubs_list]
      @_cache_stringifyed_object_ = methodBody.call this, in_stringify_filter, in_stubs_list
    else
      console.log 'stringify cache hit' if @_do_logging_
      @_cache_stringifyed_object_


# resolve require from [window] or by require() 
# use _.isPlainObject(x) to speedup type resolution
_ = @_ ? require 'lodash'

RegExpDotForger = require "./lib/regexp_dot_forger"
{getItType} = require "./lib/type_detector"

class TinyData 

  constructor: (@_original_obj_={}, @_options_={}) ->
    # stringification need to be cached
    @_cache_stringifyed_object_ = null
    # settings object to validate cache 
    @_stringification_rule = 
      stubs_list        : []    # nodes list, witch context will be replaced by __STUB__ 
      stringify_filter  : null  # rule to add to stringificated object ONLY matched nodes
      apply_on_depth    : null  # level, where stringify_filter must be applied 
    # this is our seatbelt for long texts - do not put it into index
    @_max_text_long_ = 120

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
      rakeAny : 
        convert_income_rake_regexp : yes # take user RegExp (as string or RegExp) 
                                         # and replace dots to @_as_dot_.internal, 
                                         # not applied to function !!!!
        convert_before_finalize_function : yes # finalize_function get already converted data
        convert_out_result      : yes # before data returning 
                                      # (obsolete if convert_before_finalize_function is 'yes' )
      rakeStringify :
        convert_stringify_filter : yes  # take user RegExp (as string or RegExp)
                                        # and replace dots to @_as_dot_.internal
    # to transform path delimiter  
    @_dot_forger_ = new RegExpDotForger @getPathDelimiter('internal'), log : @_do_logging_

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
  rakeStringify : ( cacheStringify ( timeOnDemand 'rakeStringify', (in_stringify_filter, in_stubs_list = []) ->
    @_doStringify in_stringify_filter, in_stubs_list
    ))

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
    [rake_rule_type, rake_rule] = @_argParser in_rake_rule, 'rake_rule'
    rake_function = @_buildRakeFunction rake_rule_type, rake_rule, interp_sequence
    # Now Cached
    @rakeStringify @_stringification_rule.stringify_filter, @_stringification_rule.stubs_list
    
    raked_object = @_proceedSeekingOut rake_function 

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

    if user_finalize_function? and @_argParser user_finalize_function, 'finalize_function', 'Function'
      if @_dot_decorator_settings_.rakeAny.convert_before_finalize_function
        return 'DECORATE_THEN_FINALAZE' # YES, its middle-method return, you are really want to talk about it?
      else
        will_be_finalized = yes

    if @_dot_decorator_settings_.rakeAny.convert_out_result
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
  _proceedSeekingOut: ( timeOnDemand 'seekingOut', (rake_function) ->
    raked_object = rake_function @_cache_stringifyed_object_
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
  _buildRakeFunction : (rake_rule_type, rake_rule, interp_sequence) ->
    switch rake_rule_type
      when 'REGEXP'
        # if incoming RegExp needed to be transformed
        if @_dot_decorator_settings_.rakeAny.convert_income_rake_regexp
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

  ###
  This method parse arg and may ensure its type
  ###
  _argParser : (arg, arg_name, strict_type) ->
    # DRY
    err_formatter = (err_string, arg_type) ->
      """
      #{err_string}
      |arg_name| = |#{arg_name}|
      |type| = |#{arg_type}|
      |arg|   = |#{arg}|
      """

    parsed_arg = switch arg_type = getItType arg
      when 'STRING'
        try
          ['REGEXP', RegExp arg]
        catch error
          throw SyntaxError \
            err_formatter "cant compile this String to RegExp", arg_type
      when 'REGEXP'
        ['REGEXP', arg]
      when 'FUNCTION'
        ['FUNCTION', arg]
      else
        throw TypeError \
          err_formatter "argument must be String, RegExp or Function, but got", arg_type
    
    if strict_type? and parsed_arg[0] isnt strict_type.toUpperCase()
      throw TypeError \
        err_formatter "argument must be #{strict_type}, but got", arg_type

    parsed_arg
  
  ###
  This method create limiter for long text
  ###
  _makeStringLimiter : (max_length) ->
    (full_elem_path, elem_content, elem_depth) =>
      elem_length = elem_content.length
      unless elem_length > max_length
        "#{full_elem_path}#{elem_content}"
      else
        "#{full_elem_path}__LONG_TEXT__|#{elem_length}|"

  ###
  This method create stringify filter
  to reduce part of values to speed up stringification and seeking
  ###
  _makeElementFilter : (stringify_rule) ->
    # name matching rule with or without origins 
    name_matcher = if stringify_rule?.origin_pattern?
      stringify_pattern = stringify_rule.origin_pattern
      # if incoming RegExp needed to be transformed
      if @_dot_decorator_settings_.rakeStringify.convert_stringify_filter
        stringify_pattern = @doTransormRegExp stringify_pattern

      (matcher_elem_name, matcher_elem_origin) =>
        matcher_elem_name is stringify_rule.element_name and stringify_pattern.test matcher_elem_origin
    else
      (matcher_elem_name) =>
        matcher_elem_name is stringify_rule.element_name

    # filter may be applied only in correct depth  
    (elem_origin, elem_name, elem_depth) =>
      if stringify_rule.apply_on_depth is elem_depth
        name_matcher elem_name, elem_origin
      else 
        yes

  ###
  This method stringify object
  ###
  _doStringify: (stringify_rule, stubs_list) ->
    # filter may be applied only in correct depth  
    filter_body = @_makeElementFilter stringify_rule
    # this is filter for string elements
    string_limiter = @_makeStringLimiter @_max_text_long_
    # its filter itself, assembled and ready to fire
    is_filter_passed = if stringify_rule? then filter_body else -> yes
    dot_sign = @getPathDelimiter('internal')

    result_array = []
    innner_loop = (in_obj, prefix, depth ) =>
      switch in_obj_type = getItType in_obj
        when 'HASH'
          obj_keys = _.keys in_obj
          if obj_keys.length
            for key in obj_keys when is_filter_passed prefix, key, depth
              innner_loop in_obj[key], "#{prefix}#{key}#{dot_sign}", depth + 1
          else
            innner_loop "__EMPTY__|HASH|", "#{prefix}", depth
        when 'ARRAY'
          if in_obj.length
            for value, idx in in_obj when is_filter_passed prefix, idx, depth
              innner_loop value, "#{prefix}#{idx}#{dot_sign}", depth + 1
          else 
            innner_loop "__EMPTY__|ARRAY|", "#{prefix}", depth
        when 'NUMBER', 'BOOLEAN', 'NULL'
          result_array.push "#{prefix}#{in_obj}"
        when 'STRING'
          result_array.push string_limiter prefix, in_obj, depth
        when 'DATE', 'REGEXP'
          result_array.push "#{prefix}__#{in_obj_type}__|#{in_obj}|__"
        else
          result_array.push "#{prefix}__#{in_obj_type}__"
      null

    # TODO - check 0 on hashes, is it correct ?
    innner_loop @_original_obj_, '', 0

    result_array



module.exports = TinyData

