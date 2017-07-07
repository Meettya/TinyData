/*
 * Object Extender, sort of Object.assign
 */
import getItType from './type_detector'

function doExtendObject(original, addon) {
  let addonType
  let result = {}

  if(getItType(original) !== 'HASH'){
    throw TypeError(`must called with object, but get |${original}|`)
  }
  if(getItType(addon) !== 'HASH'){
    return original
  }
  Object.keys(original).forEach((key) => {
    addonType = getItType(addon[key])
    if (!(addonType === 'NULL' || addonType === 'UNDEFINED')){
      result[key] = addon[key]
    } else {
      result[key] = original[key]
    }
  })
  return result
}

export default doExtendObject
