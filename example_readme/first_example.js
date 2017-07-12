/*
 * First example
 */
import TinyData from '../lib/tinydata'
import exampleData from './dataset'

let tinyDataObj = new TinyData(exampleData)

let gradeRule = /(?:[^.]+\.){2}grades\.([^.]+)\.([^.]+)/

let gradeSummator = (key, values, emit) => {
  let count = values.length
  let result = values.reduce((memo, val) => {
    return memo + val / count
  }, 0)
  
  emit(key, result.toFixed(1))
}

let averageGrades = tinyDataObj.search(gradeRule, gradeSummator)

console.log(averageGrades)
