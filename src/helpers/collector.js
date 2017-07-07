/*
 * This is Collector mixin - its create layout for object walker and result collection
 */
import getItType from './type_detector'

function buildEmitCollector (resultObj) {
  return (key, value) => {
    let keyType = getItType(key)
    let valueType = getItType(value)

    if (!(keyType === 'NULL' || keyType === 'UNDEFINED' || valueType === 'NULL' || valueType === 'UNDEFINED')) {
      if (!resultObj[key]) {
        resultObj[key] = []
      }
      resultObj[key].push(value)
    }
  }
}

function buildCollectorLayout (workFn) {
  return (inObj) => {
    let result = {}
    let argType = getItType(inObj)
    let emit = buildEmitCollector(result)

    switch (argType) {
      case 'ARRAY':
        inObj.forEach((item) => {
          workFn(item, emit)
        })
        break
      case 'HASH':
        Object.keys(inObj).forEach((key) => {
          workFn(key, inObj[key], emit)
        })
        break
      default:
        throw Error(`cant work with object type |${argType}|`)
    }
    return result
  }
}

export default buildCollectorLayout
