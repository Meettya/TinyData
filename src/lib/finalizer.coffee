###
This is Finalizer for TinyData

Its get object and filter (and may be convert) it to natural dot notation

###

# resolve require from [window] or by require() 
# use _.isPlainObject(x) to speedup type resolution
_ = require 'lodash'

{getItType} = require "./type_detector"

# add some mixins here
MixinSupported  = require "./mixin_supported"

ArgParserable   = require "../mixin/arg_parser"
Collectable     = require "../mixin/collector"

class Finalizer extends MixinSupported

  @include ArgParserable
  @include Collectable

  constructor: (@_internal_path_delimiter_, @_extarnal_dot_sign_, @_options_={}) ->

    @_convert_before_finalize_function_ = yes # finalize_function get already converted data
    @_convert_out_result_ = yes       # before data returning 
                                      # (obsolete if convert_before_finalize_function is 'yes' )


  finalizeResult : (finalize_function, pre_result_obj) ->
    if finalization_name = @_getFinalizationName finalize_function
      finalizer = @_prepareFinalization finalization_name, finalize_function
      finalizer pre_result_obj
    else
      pre_result_obj

  ###
  Try to reduce logic level
  ###
  _getFinalizationName : (user_finalize_function) ->
    will_be_finalized = no

    if user_finalize_function? and @_argParser user_finalize_function, 'finalize_function', 'Function'
      if @_convert_before_finalize_function_ 
        return 'DECORATE_THEN_FINALAZE' # YES, its middle-method return, you are really want to talk about it?
      else
        will_be_finalized = yes

    if @_convert_out_result_
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
    dot_symbol = @_extarnal_dot_sign_
    delimiter_symbol = @_internal_path_delimiter_
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


module.exports = Finalizer
