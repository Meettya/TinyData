###
This is RegExp helper for TinyData

Its convert users RegExp with escaped dot \.
 or dot as a part of character set [.] - like this,
 by replace all of that to something else 

Raison d'être - inside TinyData for entity devision used dot_replacer,
  but for the simplicity we are MAY (and I believe MUST) cloak this fact.
###

###
Logging method decorator
###
logOnDemand = (methodBody) ->
  (args...)->
    __rval__ = methodBody.apply this, args
    if @_do_logging_
      console.log "#{args[0]} -> #{__rval__}"
    __rval__

# resolve require from [window] or by require() 
# use _.isPlainObject(x) to speedup type resolution
_ = @_ ? require 'lodash'

class RegExpDotForger 

  constructor: (@_dot_substitute_, @_options_={}) ->
    unless @_dot_substitute_? and _.isString @_dot_substitute_
      throw Error """
                  constructor must be called with string as dot substitute, but got:
                  |dot_substitute| = |#{@_dot_substitute_}|
                  """
    # for debugging 
    @_do_logging_ = if @_options_.log? and @_options_.log is on and console?.log? then yes else no

  ###
  This method return pattern RegExp by name or throw exception
  why it public? for tests
  ####
  getPatternByName : (pattern_name) ->
    switch pattern_name.toUpperCase()
      when 'CHARACTER_SET'  then /((?:^|(?:(?:^|[^\\])\\(?:\\{2})*\\)|[^\\]+))(\[(?:]|(?:[^\\]+])|(?:.*?[^\\]+])|(?:.*?[^\\]+\\(?:\\{2})*\\])))/
      when 'ESCAPED_DOT'    then /((?:^|[^\\])(?:\\{2})*)(\\\.)/
      else
        throw Error """
                    so far don`t know pattern, named |#{pattern_name}|, mistype?
                    """
  ###
  This method forge dots in incoming regexp and return 'corrected' one
  ###
  doForgeDots : ( logOnDemand (in_regexp) ->
    unless in_regexp? and _.isRegExp in_regexp
      throw Error """
                  must be called with RegExp, but got:
                  |in_regexp| = |#{in_regexp}|
                  """
    # sequence is important!
    # character set, THAN escaped dots
    new RegExp @_forgeEscapedDots @_forgeCharacterSet in_regexp.source
  )

  ###
  This method change dots to substitute in character sets
  ###
  _forgeCharacterSet : (in_regexp_as_string) ->
    global_char_set_pattern = new RegExp @getPatternByName('character_set').source, 'g'

    dot_replacer = (match, captured_1, captured_2) =>
      # in this case we are change ONLY dot |.| and keep alive escape symbol
      # because escape symbol have now power on dot in character set
      forged_set = captured_2.replace /\./g, @_dot_substitute_
      captured_1 + forged_set

    in_regexp_as_string.replace global_char_set_pattern, dot_replacer

  ###
  This method change escaped dots to substitute
  ###
  _forgeEscapedDots : (in_regexp_as_string) ->
    global_escaped_dot_pattern = new RegExp @getPatternByName('escaped_dot').source, 'g'
    
    escaped_dot_replacer = (match, captured_1, captured_2) =>
      # in this case we are change BOTH dot |.| AND escape symbol
      # because its one escape symbol 
      forged_set = captured_2.replace /\\\./, @_dot_substitute_
      captured_1 + forged_set

    in_regexp_as_string.replace global_escaped_dot_pattern, escaped_dot_replacer


module.exports = RegExpDotForger
