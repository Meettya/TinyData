###
This is tiny data-mining engine

work as mapReduce, but in some different way and use RegExp as path pointer
###

###
Timing method decorator
###
timingIfItNeeded = (label, methodBody) ->
  ->
    console.time label if @_do_timing_
    __rval__ = methodBody.apply this, arguments
    console.timeEnd label if @_do_timing_
    __rval__

# resolve require from [window] or by require() 
# use _.isPlainObject(x) to speedup type resolution
_ = @_ ? require 'lodash'

class TinyData 

  constructor: (@_original_obj_={}, @_options_={}) ->
    # stringification need to be cached
    @_cache_stringifyed_object_ = null
    # settings object to validate cache 
    @_stringification_rule = 
      stubs_list        : []    # nodes list, witch context will be replaced by __STUB__ 
      stringify_filter  : null  # rule to add to stringificated object ONLY matched nodes

    # for debugging and benchmarking
    @_do_timing_ = if @_options_.timing? and @_options_.timing is on and console?.time? then yes else no
    
    # hm, its actually is bad things, but I don`t know how do it well
    @_dot_ = 
      internal : "\uFE45"
      external : '.'
    # and it needed to polish our dirty hack :)
    @_dot_decorator_settings_ =
      rakeUp : 
        convert_income_rake_regexp : yes # take user RegExp (as string or RegExp) 
                                         # and replace dots to @_as_dot_.internal, 
                                         # not applied to function !!!!
        convert_before_finalize_function : yes # finalize_function get already converted data
        convert_out_result      : yes # before data returning 
                                      # (obsolete if convert_before_finalize_function is 'yes' )
      rakeStringify :
        convert_stringify_filter : yes  # take user RegExp (as string or RegExp)
                                        # and replace dots to @_as_dot_.internal



  ###
  This is #rakeUp() job - map through all stringifyed object and do some thing,
  then may do some finalization code
  ###
  rakeUp : ( in_rake_rule, finalize_function ) ->
    # we are need some prepare stuff
    [rake_rule_type, rake_rule] = @_argParser in_rake_rule, 'rake_rule'
    rake_function = @_buildRakeFunction rake_rule_type, rake_rule
    # Now Cached
    @_cache_stringifyed_object_ ?= @rakeStringify()
    
    raked_object = @_proceedRake rake_function 

    if finalization_name = @_getFinalizationName finalize_function
      finalizer = @_prepareFinalization finalization_name, finalize_function
      finalizer raked_object
    else
      raked_object

  ###
  This method stringify our original object
  may be used to speed up all by reduce stringification work 
  ###
  # TODO ! do cache invalidation and parameter passing
  rakeStringify : ( timingIfItNeeded 'rakeStringify', (stringify_filter, stubs_list = []) ->
    @_cache_stringifyed_object_ ?= @_doStringify stringify_filter, stubs_list
    )

  ###
  That's all, folks!
  Just few methods :)
  May be I will add one more - mapUp
  ###

  ###
  Try to reduce logic level
  ###
  _getFinalizationName : (user_finalize_function) ->
    will_be_finalized = no

    if user_finalize_function? and @_argParser user_finalize_function, 'finalize_function', 'Function'
      if @_dot_decorator_settings_.rakeUp.convert_before_finalize_function
        return 'DECORATE_THEN_FINALAZE' # YES, its middle-method return, you are really want to talk about it?
      else
        will_be_finalized = yes

    if @_dot_decorator_settings_.rakeUp.convert_out_result
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
  To separate logic of converting
  ###
  _buildResultConvertor : ->
    dot_pattern = new RegExp @_dot_.internal, 'g'
    (in_obj) =>
      for key in _.keys in_obj
        for item, idx in in_obj[key]
          in_obj[key][idx] = in_obj[key][idx].replace dot_pattern, @_dot_.external

      in_obj 
  
  ###
  To separate logic of finalizator
  ###
  _buildUserFinalizer : (user_fn) ->
   (in_obj) =>
    finalized_rake_result = {}
    # we are need some checking on data from user function
    emit = (key, value) ->
      if key? and value?
        finalized_rake_result[key] ?= []
        finalized_rake_result[key].push value

    user_fn key, in_obj[key], emit for key in _.keys in_obj
      
    finalized_rake_result

  ###
  Internal method for wrap timing 
  ###
  _proceedRake: ( timingIfItNeeded 'proceedRake', (rake_function) ->
    raked_object = rake_function @_cache_stringifyed_object_
    )

  ###
  This method transform incoming RegExp changes \. (dot) to internal dot-substituter
  Oh, f*ck, it will be funny :(
  ###
  _transormateRegExp: (original_regexp) ->

    #!!!! количество обратных слешей в регулярке 
    # при ее превращении в строку НЕ увеличивается
    # забор сдвоенных обратных слешей - прикол только исходного ТЕКСТА

    console.log /\dt\./.toString().match /\/\\dt\\\.\// 
    console.log new RegExp 't\\\\.'
    console.log new RegExp /t\./

    console.log "in -> ", "#{original_regexp.toString()}"
    result = new RegExp original_regexp.source.replace /\\\./g, @_dot_.internal
    console.log "out ->", "#{result.source}"
    result


  ###
  This method return rake function itself, its different for 
  RegExp or Function
  ###
  _buildRakeFunction : (rake_rule_type, rake_rule) ->
    #IKNOW! yes, its diplicated code, but its for speed up
    switch rake_rule_type
      when 'REGEXP'

        # if incoming RegExp needed to be transformed
        if @_dot_decorator_settings_.rakeUp.convert_income_rake_regexp
          rake_rule = @_transormateRegExp rake_rule

        (in_array) ->
          rake_result = {}

          for item in in_array when matched_obj = item.match rake_rule
            [ key, value ] = [ matched_obj[2], matched_obj[1].slice 0, -1 ]
            rake_result[key] ?= []
            rake_result[key].push value
            null
          
          rake_result

      when 'FUNCTION'
        (in_array) ->
          rake_result = {}

          # we are need some checking on data from user function
          emit = (key, value) ->
            if key? and value?
              rake_result[key] ?= []
              rake_result[key].push value

          rake_rule item, emit for item in in_array
            
          rake_result

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

    parsed_arg = switch arg_type = @_getItType arg
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
  This method stringify object
  ###
  _doStringify: (stringify_rule, stubs_list) ->
    result_array = []

    # name matching rule with or without origins 
    name_matcher = if stringify_rule?.origin_pattern?
      (matcher_elem_name, matcher_elem_origin) =>
        matcher_elem_name is stringify_rule.element_name and stringify_rule.origin_pattern.test matcher_elem_origin
    else
      (matcher_elem_name) =>
        matcher_elem_name is stringify_rule.element_name

    # filter may be applied only in correct depth  
    filter_body = (elem_origin, elem_name, elem_depth) =>
      if stringify_rule.apply_on_depth is elem_depth
        name_matcher elem_name, elem_origin
      else 
        yes

    # its filter itself, assembled and ready to fire
    is_filter_passed = if stringify_rule? then filter_body else -> yes
    dot_sign = @_dot_.internal

    innner_loop = (in_obj, prefix, depth ) =>
      switch in_obj_type = @_getItType in_obj
        when 'HASH'
          for key in _.keys in_obj when is_filter_passed prefix, key, depth
            innner_loop in_obj[key], "#{prefix}#{key}#{dot_sign}", depth + 1
        when 'ARRAY'
          for value, idx in in_obj when is_filter_passed prefix, idx, depth
            innner_loop value, "#{prefix}#{idx}#{dot_sign}", depth + 1
        when 'PLAIN', 'STRING'
          result_array.push "#{prefix}#{in_obj}"
        when 'DATE', 'REGEXP'
          result_array.push "#{prefix}__#{in_obj_type}__|#{in_obj}|__"
        else
          result_array.push "#{prefix}__#{in_obj_type}__"
      null

    # TODO - check 0 on hashes, is it correct ?
    innner_loop @_original_obj_, '', 0

    result_array

  ###
  This method return type of incoming things
  HASH mean NOT a function or RegExp or something else  - just simple object
  ###
  _getItType : (x) ->
    # REMEMBER!!!
    # order is IMPORTANT!!!
    if _.isPlainObject(x)
      'HASH'
    else if _.isArray(x)
      'ARRAY' 
    else if _.isString(x)
      'STRING'
    else if _.isNumber(x) or _.isBoolean(x) or _.isNull(x)
      'PLAIN' 
    else if _.isFunction(x)
      'FUNCTION'
    else if _.isRegExp(x)
      'REGEXP'
    else if _.isDate(x)
      'DATE' 
    else if _.isArguments(x)
      'ARGUMENTS'
    else 
      'OTHER'

module.exports = TinyData

