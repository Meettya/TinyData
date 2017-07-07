/*
 * This is tiny data-mining engine
 *
 * work as mapReduce, but in some different way and use RegExp as path pointer
 */

import RegExpDotForger from './lib/regexp_dot_forger'
import Stringificator from './lib/stringificator'
import Finalizer from './lib/finalizer'
import LogState from './helpers/log_state'
import argParser from './helpers/arg_parser'
import buildCollectorLayout from './helpers/collector'

// internal delimiter, as "special symbol"
const dotInternal = '\uFE45'
const dotExternal = '.'

class TinyData {
  constructor (originalObj = {}, options = {}) {
    this.originalObj = originalObj
    this.options = options
    // take user RegExp (as string or RegExp) and replace dots to dotInternal, not applied to function !!!!
    this.isConvertIncomePatterns = true
    // this is logger status parser and keeper
    this.logger = new LogState(options)
    // to transform path delimiter
    this.dotForger = new RegExpDotForger(dotInternal, {log: this.logger.mustDo('logging')})
    this.doTransormRegExp = this.doTransormRegExp.bind(this)
    this.stringificator = new Stringificator(originalObj, dotInternal, this.doTransormRegExp, {log: this.logger.mustDo('logging')})
    this.finalizer = new Finalizer(dotInternal, dotExternal)
  }

  /*
   * This method proceed 'seeking' through all stringifyed object and do some thing,
   * then may do some finalization code
   * Builded for common case of usage,
   * when rule is RegExp and we are want to map matched result in direct order:
   * first capture -> key
   * second capture -> value
   */
  search (inRule, finalizeFunc, interpSequence) {
    let sequence = {key: 1, value: 2}

    Object.assign(sequence, interpSequence)
    if (this.logger.mustDo('warning') && sequence.key >= sequence.value) {
      console.warn(`for reverse interpretation direction it would be better to use #searchBack()\n|key_order| = |${sequence.key}|\n|value_order| = |${sequence.value}|`)
    }
    return this.seekOutAny(inRule, finalizeFunc, sequence)
  }

  /*
   * This method proceed 'seeking' through all stringifyed object and do some thing,
   * then may do some finalization code
   * Builded for common case of usage,
   * when rule is RegExp and we are want to map matched result in reverse order:
   * first capture -> value
   * second capture -> key
   */
  searchBack (inRule, finalizeFunc, interpSequence) {
    let sequence = {key: 2, value: 1}

    Object.assign(sequence, interpSequence)
    if (this.logger.mustDo('warning') && sequence.value >= sequence.key) {
      console.warn(`for direct interpretation direction it would be better to use #search()\n|key_order| = |${sequence.key}|\n|value_order| = |${sequence.value}|`)
    }
    return this.seekOutAny(inRule, finalizeFunc, sequence)
  }

  /*
   * For backward compatibility
   */
  seekOut (inRule, finalizeFunc, interpSequence) {
    return this.search(inRule, finalizeFunc, interpSequence)
  }

  seekOutVerso (inRule, finalizeFunc, interpSequence) {
    return this.searchBack(inRule, finalizeFunc, interpSequence)
  }

  /*
   * Timing counter
   */
  timeOnDemand (label, fn) {
    let res
    let isTimed = this.logger.mustDo('timing')

    if (isTimed) {
      console.time(label)
    }
    res = fn()
    if (isTimed) {
      console.timeEnd(label)
    }
    return res
  }

  /*
   * This method stringify our original object (materialize full path + add leaf )
   * may be used to speed up all by reduce stringification work
   */
  rakeStringify (inStringifyFilter, inStubsList = []) {
    return this.timeOnDemand('rakeStringify', () => { return this.stringificator.stringifyObject(inStringifyFilter, inStubsList) })
  }

  /*
   * This method transform incoming RegExp changes \. (dot) to internal dot-substituter
   */
  doTransormRegExp (originalRegexp) {
    if (originalRegexp.source.indexOf(dotInternal) !== -1) {
      if (this.logger.mustDo('logging')) {
        console.log(`doTransormRegExp: skip converting for |${originalRegexp}|`)
      }
      return originalRegexp
    }
    return this.dotForger.doForgeDots(originalRegexp)
  }

  /*
   * This method may be used for user-defined function
   */
  getPathDelimiter (type) {
    let ucType = type.toUpperCase()

    switch (ucType) {
      case 'INTERNAL':
        return dotInternal
      case 'EXTERNAL':
        return dotExternal
      default:
        throw Error(`dont know path delimiter, named |${type}|, mistype?`)
    }
  }

  /*
   * This method return data by path
   *
   * It will auto-recognize delimiter, or use forced
   */
  getDataByPath (path, obj, forceDelimiter) {
    let steps, res

    if (!forceDelimiter) {
      if (path && path.indexOf(dotInternal) !== -1) {
        forceDelimiter = dotInternal
      } else {
        forceDelimiter = dotExternal
      }
    }
    if (!obj) {
      obj = this.originalObj
    }
    steps = path.split(forceDelimiter)
    res = steps.reduce((obj, val) => { return obj[val] }, obj)
    return res
  }

  /*
   * This is realy search processor code, one for any directions
   */
  seekOutAny (inRule, finalizeFunc, interpSequence) {
    let seekRuleType, seekRule, seekFunction, rakedObject
    let stringifyedObject = this.rakeStringify(); // or next line glued

    [seekRuleType, seekRule] = argParser(inRule, 'seek_rule')
    seekFunction = this.buildSeekFunction(seekRuleType, seekRule, interpSequence)
    rakedObject = this.proceedSeekingOut(seekFunction, stringifyedObject)
    return this.proceedFinalization(finalizeFunc, rakedObject)
  }

  /*
   * Internal method for wrap timing
   */
  proceedFinalization (finalizeFunc, rakedObject) {
    return this.timeOnDemand('finalization', () => { return this.finalizer.finalizeResult(finalizeFunc, rakedObject) })
  }

  /*
   * Internal method for wrap timing
   */
  proceedSeekingOut (seekFunction, stringifyedObject) {
    return this.timeOnDemand('searching', () => { return seekFunction(stringifyedObject) })
  }

  /*
   * his method return rake function itself
   *
   * its different for RegExp or Function
   */
  buildSeekFunction (seekRuleType, seekRule, interpSequence) {
    switch (seekRuleType) {
      case 'REGEXP':
        // if incoming RegExp needed to be transformed
        if (this.isConvertIncomePatterns) {
          seekRule = this.doTransormRegExp(seekRule)
        }
        // if user send RegExp - transform it into function
        return buildCollectorLayout((item, emit) => {
          let matchedObj = item.match(seekRule)

          if (matchedObj) {
            emit(matchedObj[interpSequence.key], matchedObj[interpSequence.value])
          }
        })
      case 'FUNCTION':
        // nothing to do
        return buildCollectorLayout(seekRule)
      default:
        throw Error(`cant process type |${seekRuleType}|, halt!`)
    }
  }
}

export default TinyData
