###
This is Stringificator for TinyData

Its get object and return materialized path, with some changes, like:
  * filter some data
  * cut long text values
  * change data values to stub (not realized) 

###

# resolve require from [window] or by require() 
# use _.isPlainObject(x) to speedup type resolution
_ = @_ ? require 'lodash'

{getItType} = require "./type_detector"

class Stringificator 

  constructor: (@_original_obj_, @_internal_path_delimiter_, @_regexp_transformation_fn_, @_options_={}) ->
    # stringification need to be cached
    @_cache_stringifyed_object_ = null
    # settings object to validate cache 
    @_stringification_rule = 
      stubs_list        : []    # nodes list, witch context will be replaced by __STUB__ 
      stringify_filter  : null  # rule to add to stringificated object ONLY matched nodes
    # this is our seatbelt for long texts - do not put it into index
    @_max_text_long_ = 120

    @_convert_stringify_filter = yes    # take user RegExp (as string or RegExp)
                                        # and replace dots to @_as_dot_.internal
    @_do_logging_ = if @_options_.log? and @_options_.log is on and console?.log? then yes else no


  ###
  This is public method, wrapper for internal and realize a cache
  ###
  stringifyObject : (in_stringify_filter, in_stubs_list) ->
    stringy_filter      = @_stringification_rule.stringify_filter
    stringify_stub_list = @_stringification_rule.stubs_list
    # on void call use old values
    in_stringify_filter  or= stringy_filter
    in_stubs_list        or= stringify_stub_list
    if not @_cache_stringifyed_object_? or not _.isEqual(in_stringify_filter, stringy_filter) or not _.isEqual in_stubs_list, stringify_stub_list
      console.log 'stringify cache miss' if @_do_logging_
      [stringy_filter, stringify_stub_list] = [in_stringify_filter, in_stubs_list]
      @_cache_stringifyed_object_ = @_doStringification in_stringify_filter, in_stubs_list
    else
      console.log 'stringify cache hit' if @_do_logging_
      @_cache_stringifyed_object_


  ###
  This method stringify object
  ###
  _doStringification: (stringify_rule, stubs_list) ->
    # filter may be applied only in correct depth  
    filter_body = @_makeElementFilter stringify_rule
    # this is filter for string elements
    string_limiter = @_makeStringLimiter @_max_text_long_
    # its filter itself, assembled and ready to fire
    is_filter_passed = if stringify_rule? then filter_body else -> yes
    dot_sign = @_internal_path_delimiter_

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
      if @_convert_stringify_filter
        stringify_pattern = @_regexp_transformation_fn_ stringify_pattern

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


module.exports = Stringificator