###
This is log state object

Its configured by incoming object and return turned on statuses
###

class LogState 

  # NB - options may have some another settings from main object - just ignore it
  constructor: (@_options_={}) ->
    # this is object storage
    @_state_ = {}
    # debug turn on some switches
    if @_options_.debug? and @_options_.debug is on
      @_state_['DEBUGGING'] = yes
      @_options_.timing  = on
      @_options_.logging = on
      @_options_.warning = on
    else 
      @_state_.debug = no

    # for benchmarking
    @_state_['TIMING'] = if @_options_.timing? and @_options_.timing is on and console?.time? then yes else no
    # for debugging
    @_state_['LOGGING'] = if @_options_.logging? and @_options_.logging is on and console?.log? then yes else no
    @_state_['WARNING'] = if @_options_.warning? and @_options_.warning is on and console?.warn? then yes else no


  ###
  This method resolve log status 
  ###
  mustDo : (state_name) ->
    trite_arg = state_name.toUpperCase()
    unless @_state_[trite_arg]?
      throw Error "dont know |#{state_name}| state"
    @_state_[trite_arg]

module.exports = LogState