/*
 * This is type detector for any JS type.
 */
import type from 'type-detect'

function getItType (val) {
  // for some reason 'type-detect' dont do it
  if (val === false || val === true) {
    return 'BOOLEAN'
  }
  switch (type(val)) {
    case 'Object':
      return 'HASH'
    case 'Array':
      return 'ARRAY'
    case 'string':
      return 'STRING'
    case 'number':
      return 'NUMBER'
    case 'null':
      return 'NULL'
    case 'undefined':
      return 'UNDEFINED'
    case 'function':
      return 'FUNCTION'
    case 'RegExp':
      return 'REGEXP'
    case 'Date':
      return 'DATE'
    case 'Arguments':
      return 'ARGUMENTS'
    default:
      return 'OTHER'
  }
}

export default getItType
