/*
 * This is Stringificator for TinyData
 *
 * Its get object and return materialized path, with some changes, like:
 * - filter some data
 * - cut long text values
 * change data values to stub (not realized)
 */
import getItType from '../helpers/type_detector'
import jsonEqual from '../helpers/json_equal'

class Stringificator {
  constructor (originalObj, internalPathDelimiter, regexpTransformationFn, options = {}) {
    this.originalObj = originalObj
    this.internalPathDelimiter = internalPathDelimiter
    this.regexpTransformationFn = regexpTransformationFn
    // stringification must to be cached
    this.cacheStringifyedObject = null
    // settings object to validate cache
    this.stringificationRule = {
      stubsList: [], // nodes list, witch context will be replaced by __STUB__
      stringifyFilter: null // rule to add to stringificated object ONLY matched nodes
    }
    // this is our seatbelt for long texts - do not put it into index
    this.maxTextLong = 120
    // take user RegExp (as string or RegExp) and replace dots to dotInternal, not applied to function !!!!
    this.isConvertIncomePatterns = true
    this.isDoLogging = options.log
  }

  /*
   * This is public method, wrapper for internal and realize a cache
   */
  stringifyObject (inStringifyFilter, inStubsList) {
    let isCacheHit = false
    let stringyFilter = this.stringificationRule.stringifyFilter
    let stringifyStubList = this.stringificationRule.stubsList

    // on void call use old values
    if (!inStringifyFilter) {
      inStringifyFilter = stringyFilter
    }
    if (!inStubsList) {
      inStubsList = stringifyStubList
    }
    isCacheHit = this.cacheStringifyedObject && jsonEqual(inStringifyFilter, stringyFilter) && jsonEqual(inStubsList, stringifyStubList)
    if (this.isDoLogging) {
      console.log(`stringify cache ${isCacheHit ? 'hit' : 'miss'}`)
    }
    if (!isCacheHit) {
      this.cacheStringifyedObject = this.doStringification(inStringifyFilter, inStubsList)
    }
    return this.cacheStringifyedObject
  }

  /*
   * This method stringify object
   */
  doStringification (stringifyRule, stubsList) {
    let inObjType, objKeys
    let result = []
    // filter may be applied only in correct depth
    let filterBody = this.makeElementFilter(stringifyRule)
    // this is filter for string elements
    let stringLimiter = this.makeStringLimiter(this.maxTextLong)
    let dotSign = this.internalPathDelimiter
    // its filter itself, assembled and ready to fire
    let isFilterPassed = stringifyRule ? filterBody : () => { return true }
    let innnerLoop = (inObj, prefix, depth) => {
      inObjType = getItType(inObj)
      switch (inObjType) {
        case 'HASH':
          objKeys = Object.keys(inObj)
          if (objKeys.length) {
            objKeys.forEach((key) => {
              if (isFilterPassed(prefix, key, depth)) {
                innnerLoop(inObj[key], `${prefix}${key}${dotSign}`, depth + 1)
              }
            })
          } else {
            innnerLoop('__EMPTY__|HASH|', prefix, depth)
          }
          break
        case 'ARRAY':
          if (inObj.length) {
            inObj.forEach((value, idx) => {
              if (isFilterPassed(prefix, idx, depth)) {
                innnerLoop(value, `${prefix}${idx}${dotSign}`, depth + 1)
              }
            })
          } else {
            innnerLoop('__EMPTY__|ARRAY|', prefix, depth)
          }
          break
        case 'NUMBER':
        case 'BOOLEAN':
        case 'NULL':
          result.push(`${prefix}${inObj}`)
          break
        case 'STRING':
          result.push(stringLimiter(prefix, inObj, depth))
          break
        case 'DATE':
        case 'REGEXP':
          result.push(`${prefix}__${inObjType}__|${inObj}|__`)
          break
        default:
          result.push(`${prefix}__${inObjType}__`)
      }
    }
    // TODO - check 0 on hashes, is it correct ?
    innnerLoop(this.originalObj, '', 0)
    return result
  }

  /*
   * This method create limiter for long text
   */
  makeStringLimiter (maxLength) {
    return (fullElemPath, elemContent) => {
      let elemLength = elemContent.length
      if (elemLength >= maxLength) {
        return `${fullElemPath}__LONG_TEXT__|${elemLength}|`
      } else {
        return `${fullElemPath}${elemContent}`
      }
    }
  }

  /*
   * This method create stringify filter
   *
   * to reduce part of values to speed up stringification and seeking
   */
  makeElementFilter (stringifyRule) {
    let nameMatcher, stringifyPattern

    if (getItType(stringifyRule) === 'HASH' && stringifyRule.originPattern) {
      stringifyPattern = stringifyRule.originPattern
      // if incoming RegExp needed to be transformed
      if (this.isConvertIncomePatterns) {
        stringifyPattern = this.regexpTransformationFn(stringifyPattern)
      }
      nameMatcher = (matcherElemName, matcherElemOrigin) => {
        return matcherElemName === stringifyRule.elementName && stringifyPattern.test(matcherElemOrigin)
      }
    } else {
      nameMatcher = (matcherElemName) => {
        return matcherElemName === stringifyRule.elementName
      }
    }
    // filter may be applied only in correct depth
    return (elemOrigin, elemName, elemDepth) => {
      if (stringifyRule.applyOnDepth === elemDepth) {
        return nameMatcher(elemName, elemOrigin)
      } else {
        return true
      }
    }
  }
}

export default Stringificator
