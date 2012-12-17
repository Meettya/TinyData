###
This is type detector for any JS type.

Will be used as simply module with one exported function,
not a class - its dont needed
###

# resolve require from [window] or by require() 
# use _.isPlainObject(x) to speedup type resolution
_ = @_ ? require 'lodash'

module.exports = 
  ###
  This method return type of incoming things
  HASH mean NOT a function or RegExp or something else  - just simple object
  ###
  getItType : (x) ->
    # REMEMBER!!!
    # order is IMPORTANT for proceed speed!!!
    if _.isPlainObject(x)
      'HASH'
    else if _.isArray(x)
      'ARRAY' 
    else if _.isString(x)
      'STRING'
    else if _.isNumber(x)
      'NUMBER'
    else if _.isBoolean(x)
      'BOOLEAN'
    else if _.isNull(x)
      'NULL'
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