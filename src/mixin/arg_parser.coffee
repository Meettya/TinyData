###
This is argument parser helper mixin
###

{getItType} = require "../lib/type_detector"

module.exports = instanceProperties = 
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

