###
Just two function to parse regexp
Pool out for testing
###

module.exports = 
  character_set : /(?:^|(?:(?:^|[^\\])\\(?:\\{2})*\\)|[^\\]+)(\[(?:]|(?:[^\\]+])|(?:.*?[^\\]+])|(?:.*?[^\\]+\\(?:\\{2})*\\])))/

#matched ALL content inside []
#/(?:^|(?:(?:^|[^\\])\\(?:\\{2})*\\)|[^\\]+)(\[(?:]|(?:[^\\]+])|(?:.*?[^\\]+])|(?:.*?[^\\]+\\(?:\\{2})*\\])))/ 

#sub-perfect
#/(?:^|(?:(?:^|[^\\])\\(?:\\{2})*\\)|[^\\]+)(\[(?:]|(?:[^\\]+])|(?:\\(?:\\{2})*\\])|(?:.*?[^\\]+])|(?:.*?[^\\]+\\(?:\\{2})*\\])))/

# excellent
#/(?:^|(?:(?:^|[^\\])\\(?:\\{2})*\\)|[^\\]+)(\[(?:]|(?:[^\\]+])|(?:.*?[^\\]+])|(?:.*?[^\\]+\\(?:\\{2})*\\])))/

#perfect 
#/(?:^|(?:(?:^|[^\\])\\(?:\\{2})*\\)|[^\\]+)(\[.*?(?:]|(?:[^\\]\\(?:\\{2})*\\)]))/

# perfect
#/((?:^|(?:(?:^|[^\\])\\(?:\\{2})*\\)|[^\\]+)\[.*?(?:]|(?:[^\\]\\(?:\\{2})*\\)]))/

# worked!!!
#/((?:^|(?:(?:^|[^\\])\\(?:\\{2})*\\)|[^\\]+)\[.*?(?:]|(?:\\(?:\\{2})*\\)]))/

#/(?:^|(?:[^\\]|\\{2})+)(\[(?:]|(?:(?:[^\\]|\\{2})+])))/


# /(?:^|[^\\]+)(?:\\{2})*(\[.*?(?:(?:\\{2})+|[^\\]+)])/
