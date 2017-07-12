/*
 * This is RegExp helper for TinyData
 *
 * Its convert users RegExp with escaped dot \.
 *  or dot as a part of character set [.] - like this,
 *  by replace all of that to something else

 * Raison d'être - inside TinyData for entity devision used dot_replacer,
 *  but for the simplicity we are MAY (and I believe MUST) cloak this fact.
 */
import getItType from '../helpers/type_detector'

const CHARACTER_SET_RE = /((?:^|(?:(?:^|[^\\])\\(?:\\{2})*\\)|[^\\]+))(\[(?:]|(?:[^\\]+])|(?:.*?[^\\]+])|(?:.*?[^\\]+\\(?:\\{2})*\\])))/
const ESCAPED_DOT_RE = /((?:^|[^\\])(?:\\{2})*)(\\\.)/

class RegExpDotForger {
  constructor (dotSubstitute, options = {}) {
    this.dotSubstitute = dotSubstitute
    this.isDoLogging = options.log
    this.doValidateDotSubstitute(this.dotSubstitute)
  }

  /*
   * Ensure we are have valid substitute
   */
  doValidateDotSubstitute (dotSubstitute) {
    if (!(dotSubstitute && getItType(dotSubstitute) === 'STRING')) {
      throw TypeError(`constructor must be called with string as dot substitute, but got:\n|dotSubstitute| = |${dotSubstitute}|`)
    }
  }

  /*
   * This method return pattern RegExp by name or throw exception
   */
  getPatternByName (patternName) {
    switch (patternName.toUpperCase()) {
      case 'CHARACTER_SET':
        return CHARACTER_SET_RE
      case 'ESCAPED_DOT':
        return ESCAPED_DOT_RE
      default:
        throw Error(`so far dont know pattern, named |${patternName}|, mistype?`)
    }
  }

  /*
   * This method forge dots in incoming regexp and return 'corrected' one
   */
  doForgeDots (inRegexp) {
    if (!(inRegexp && getItType(inRegexp) === 'REGEXP')) {
      throw TypeError(`must be called with RegExp, but got:\n|inRegexp| = |${inRegexp}|`)
    }
    // sequence is important!
    // character set, THAN escaped dots
    return new RegExp(this.forgeEscapedDots(this.forgeCharacterSet(inRegexp.source)))
  }

  /*
   * This method change dots to substitute in character sets
   */
  forgeCharacterSet (inRegexpAsString) {
    let globalCharSetPattern = new RegExp(this.getPatternByName('character_set').source, 'g')
    let dotReplacer = (match, captured1, captured2) => {
      // in this case we are change ONLY dot |.| and keep alive escape symbol
      // because escape symbol have now power on dot in character set
      let forgedSet = captured2.replace(/\./g, this.dotSubstitute)
      return `${captured1}${forgedSet}`
    }

    return inRegexpAsString.replace(globalCharSetPattern, dotReplacer)
  }

  /*
   * This method change escaped dots to substitute
   */
  forgeEscapedDots (inRegexpAsString) {
    let globalEscapedDotPattern = new RegExp(this.getPatternByName('escaped_dot').source, 'g')
    let escapedDotReplacer = (match, captured1, captured2) => {
      // in this case we are change BOTH dot |.| AND escape symbol
      // because its one escape symbol
      let forgedSet = captured2.replace(/\\\./, this.dotSubstitute)
      return `${captured1}${forgedSet}`
    }

    return inRegexpAsString.replace(globalEscapedDotPattern, escapedDotReplacer)
  }
}

export default RegExpDotForger
