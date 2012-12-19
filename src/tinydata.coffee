###
This is tiny data-mining engine

work as mapReduce, but in some different way and use RegExp as path pointer
###

###
Timing method decorator
###
timeOnDemand = (label, methodBody) ->
  ->
    console.time label if @_logger_.mustDo 'timing'
    __rval__ = methodBody.apply this, arguments
    console.timeEnd label if @_logger_.mustDo 'timing'
    __rval__

# resolve require from [window] or by require() 
# use _.isPlainObject(x) to speedup type resolution
_ = @_ ? require 'lodash'

RegExpDotForger = require "./lib/regexp_dot_forger"
Stringificator  = require "./lib/stringificator"
LogState        = require "./lib/log_state"
Finalizer       = require "./lib/finalizer"

{getItType}     = require "./lib/type_detector"

# add some mixins here
MixinSupported  = require "./lib/mixin_supported"

ArgParserable   = require "./mixin/arg_parser"
Collectable     = require "./mixin/collector"

class TinyData extends MixinSupported

  @include ArgParserable
  @include Collectable

  constructor: (@_original_obj_={}, @_options_={}) ->
    # hm, its actually is bad things, but I don`t know how do it well
    @_dot_ = 
      internal : "\uFE45"
      external : '.'

    # and it needed to polish our dirty hack :)
    @_convert_income_seek_regexp_ = yes # take user RegExp (as string or RegExp) 
                                         # and replace dots to @_as_dot_.internal, 
                                         # not applied to function !!!!

    # this is logger status parser and keeper
    @_logger_ = new LogState @_options_
    # to transform path delimiter  
    @_dot_forger_ = new RegExpDotForger @getPathDelimiter('internal'), log : @_logger_.mustDo 'logging'
    @_stringificator_ = new Stringificator @_original_obj_, @getPathDelimiter('internal'), @doTransormRegExp, log : @_logger_.mustDo 'logging'
    @_finalizer_ = new Finalizer @getPathDelimiter('internal'), @getPathDelimiter('external')

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
    if @_logger_.mustDo('warning') and interp_sequence.key >= interp_sequence.value
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
    if @_logger_.mustDo('warning') and interp_sequence.value >= interp_sequence.key
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
      if @_logger_.mustDo('logging') then console.log "doTransormRegExp: skip converting for |#{original_regexp}|"
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
  This method return data by path
  It will auto-recognize delimiter, or use force
  ###
  getDataByPath : (path, obj = @_original_obj_, force_delimiter) ->
    force_delimiter or= unless -1 is path?.indexOf @getPathDelimiter('internal')
      @getPathDelimiter('internal')
    else
      @getPathDelimiter('external')
    steps = path.split force_delimiter
    _.reduce steps, ((obj, i) -> obj[i]), obj

  ###
  That's all, folks!
  Just few public methods :)
  ###

  ###
  This is realy seek processor code, one for any directions
  ###
  _seekOutAny : (in_seek_rule, finalize_function, interp_sequence ) ->
    # for timing call itself
    stringifyed_object = @rakeStringify()
    
    # we are need some prepare stuff
    [seek_rule_type, seek_rule] = @_argParser in_seek_rule, 'seek_rule'
    seek_function = @_buildSeekFunction seek_rule_type, seek_rule, interp_sequence    
    raked_object = @_proceedSeekingOut seek_function, stringifyed_object

    @_proceedFinalization finalize_function, raked_object

  ###
  Internal method for wrap timing 
  ###
  _proceedFinalization : ( timeOnDemand 'finalization', (finalize_function, raked_object) ->
    @_finalizer_.finalizeResult finalize_function, raked_object
    )

  ###
  Internal method for wrap timing 
  ###
  _proceedSeekingOut: ( timeOnDemand 'seekingOut', (seek_function, stringifyed_object) ->
    seek_function stringifyed_object
    )

  ###
  This method return rake function itself, its different for 
  RegExp or Function
  ###
  _buildSeekFunction : (rake_rule_type, rake_rule, interp_sequence) ->
    switch rake_rule_type
      when 'REGEXP'
        # if incoming RegExp needed to be transformed
        if @_convert_income_seek_regexp_
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

