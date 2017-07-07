/*
 * Simply equality checker
 *
 * not fast, but dont get it
 */

function jsonEqual (a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export default jsonEqual
