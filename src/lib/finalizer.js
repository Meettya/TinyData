/*
 * This is Finalizer for TinyData
 *
 * Its get object and filter (and may be convert) it to natural dot notation
 */
import getItType from '../helpers/type_detector'
import argParser from '../helpers/arg_parser'
import buildCollectorLayout from '../helpers/collector'

class Finalizer {
  constructor (dotInternal, dotExternal) {
    this.dotInternal = dotInternal
    this.dotExternal = dotExternal
    this.convertBeforeFinalizeFunction = true // finalizeFn get already converted data
    this.convertOutResult = true // before data returning (obsolete if convert_before_finalize_function is 'true' )
  }

  finalizeResult (finalizeFn, preResultObj) {
    let finalizer
    let finalizationName = this.getFinalizationName(finalizeFn)

    if (finalizationName) {
      finalizer = this.prepareFinalization(finalizationName, finalizeFn)
      return finalizer(preResultObj)
    }
    return preResultObj
  }

  getFinalizationName (finalizeFn) {
    let isWillBeFinalized = false

    if (finalizeFn && argParser(finalizeFn, 'finalizeFn', 'Function')) {
      if (this.convertBeforeFinalizeFunction) {
        return 'DECORATE_THEN_FINALAZE'
      } else {
        isWillBeFinalized = true
      }
    }
    if (this.convertOutResult) {
      if (isWillBeFinalized) {
        return 'FINALAZE_THEN_DECORATE'
      } else {
        return 'DECORATE'
      }
    }
  }

  /*
   * This method build all finalization stuff and return simple function
   */
  prepareFinalization (finalizationName, finalizeFn) {
    let resultConverter = this.buildResultConvertor()
    let userFinalizer = this.buildUserFinalizer(finalizeFn)

    switch (finalizationName) {
      case 'DECORATE':
        return (inObj) => { return resultConverter(inObj) }
      case 'FINALAZE_THEN_DECORATE':
        return (inObj) => { return resultConverter(userFinalizer(inObj)) }
      case 'DECORATE_THEN_FINALAZE':
        return (inObj) => { return userFinalizer(resultConverter(inObj)) }
      default:
        throw Error(`unknown finalization style |${finalizationName}| used, halt!`)
    }
  }

  /*
   * This method create function to wipe 'orchid' delimiter
   */
  makeBuffingDelimiterWeel () {
    let dotSymbol = this.dotExternal
    let delimiterSymbol = this.dotInternal
    let delimiterPattern = new RegExp(delimiterSymbol, 'g')

    // if it string - trim orchid delimiter (from right end) than replace it
    return (inData) => {
      let fullString

      if (getItType(inData) !== 'STRING') {
        return inData
      }
      if (delimiterSymbol === inData.charAt(inData.length - 1)) {
        fullString = inData.slice(0, -1)
      } else {
        fullString = inData
      }
      return fullString.replace(delimiterPattern, dotSymbol)
    }
  }

  /*
   * This method trim orchid internal delimiters at the end of keys AND values,
   * than replace all internal dot to external (in values and keys too)
   */
  buildResultConvertor () {
    let buffingDelimiter = this.makeBuffingDelimiterWeel()

    return (inObj) => {
      let resKey, value
      let result = {}

      Object.keys(inObj).forEach((key) => {
        value = inObj[key]
        resKey = buffingDelimiter(key)
        result[resKey] = new Array(value.length) // create same size array
        value.forEach((item, idx) => {
          result[resKey][idx] = buffingDelimiter(item)
        })
      })
      return result
    }
  }

  /*
   * To separate logic of finalizator actually just wrapper
   */
  buildUserFinalizer (userFn) {
    return buildCollectorLayout(userFn)
  }
}

export default Finalizer
