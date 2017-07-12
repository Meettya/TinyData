/*
 * This is argument parser helper
 */
import getItType from './type_detector'

/*
 * This method parse arg and may ensure its type
 */
function argParser (arg, argName, strictType) {
  let parsedArg
  let argType = getItType(arg)
  const errFormatter = (errString, argType) => {
    return `${errString}\n|argName| = |${argName}|\n|type| = |${argType}|\n|arg| = |#{arg}|`
  }

  switch (argType) {
    case 'STRING':
      try {
        parsedArg = ['REGEXP', RegExp(arg)]
      } catch (e) {
        throw SyntaxError(errFormatter('cant compile this String to RegExp', argType))
      }
      break
    case 'REGEXP':
      parsedArg = ['REGEXP', arg]
      break
    case 'FUNCTION':
      parsedArg = ['FUNCTION', arg]
      break
    default:
      throw TypeError(errFormatter('argument must be String, RegExp or Function, but got', argType))
  }

  if (strictType && parsedArg[0] !== strictType.toUpperCase()) {
    throw TypeError(errFormatter(`argument must be ${strictType}, but got`, argType))
  }
  return parsedArg
}

export default argParser
