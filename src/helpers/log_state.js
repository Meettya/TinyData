/*
 * This is log state object
 *
 * Its configured by incoming object and return turned on statuses
 */
import getItType from './type_detector'

class LogState {
  constructor (options) {
    // NB - options may have some another settings from main object - just ignore it
    this.options = options
    this.state = {
      DEBUGGING: false,
      LOGGING: false,
      TIMING: false,
      WARNING: false
    }
    this.processOptions()
    this.initState()
  }

  /*
   * Complex options processor
   */
  processOptions () {
    if (this.options && this.options.debug === true) {
      this.state.DEBUGGING = true
      this.options.timing = true
      this.options.logging = true
      this.options.warning = true
    } else {
      this.state.debug = false
    }
  }

  /*
   * Set object state by options
   */
  initState () {
    // for benchmarking
    if (this.options) {
      if (this.options.timing === true && getItType(console.time) === 'FUNCTION') {
        this.state.TIMING = true
      }
      if (this.options.logging === true && getItType(console.log) === 'FUNCTION') {
        this.state.LOGGING = true
      }
      if (this.options.warning === true && getItType(console.warn) === 'FUNCTION') {
        this.state.WARNING = true
      }
    }
  }

  /*
   * Return statement is logger must do some thing
   */
  mustDo (stateName) {
    let upperStateName = stateName.toUpperCase()
    let res = this.state[upperStateName]

    if (getItType(res) !== 'BOOLEAN') {
      throw Error(`dont know |${stateName}| state`)
    }
    return res
  }
}

export default LogState
