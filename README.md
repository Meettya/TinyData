[![Build Status](https://travis-ci.org/Meettya/TinyData.png?branch=master)](http://travis-ci.org/Meettya/TinyData) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# TinyData

Simple and tiny DB engine, driven by RegExp and inspired by map-reduce.

## Description:

TinyData implement simple 'text-like' searching in any deep-structure data, for example as MongoDB inner collection, with RegExp or simple function.
Work in node and in browser too.

## Install:

In node.js

    npm install tiny-data

At browser (see 'lib_browser' dir)

    <script src="tinydata.min.js"></script>

## Example:

```javascript
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
```

With dataset as
```json
{
  "mathematics": [
    {
      "date": "2001-09-10",
      "grades": {
        "Bertie Ramos":4,
        "Kirsten Lloyd":5...
      }
    }...
  ],
  "physics": [
    {
      "date": "2001-09-10",
      "grades": {
        "Katelyn Mooney":4,
        "Andrea Rhodes":4...
      }
    }...
  ]
}

```

result for questions "What total average score by student" will be:
```json
{ "Bertie Ramos": [ "4.5" ],
  "Kirsten Lloyd": [ "3.3" ],
  "Rojas Hester": [ "5.0" ],
  "Katelyn Mooney": [ "5.0" ],
  "Brenda Carney": [ "2.0" ],
  "Dickerson Marshall": [ "5.0" ],
  "Francis Mcdaniel": [ "3.0" ],
  "Gregory Rivera": [ "2.0" ]...
}
```

## Usage:

### Constructor

```javascript
let tinyDataObj = new TinyData(dataset/*Object*/)

```
Create new object with dataset.

Dataset wil be stringified internal like this

```javascript
let dataset = {
  foo: [10,20,30],
  bar: {
    baz: 'one',
    rebar: 'two'
  },
  quix: 2
}

// internal represention as array (simplified - realy dots '.' not a dot but some internal delimiter)
[
  "foo.0.10",
  "foo.1.20",
  "foo.2.30",
  "bar.baz.one",
  "bar.rebar.two",
  "quix.2"
]
```

### Search methods

```javascript
let result = tinyDataObj.search(rule /*RegExp|function*/, finalizer/*function*/, interpSequence/*object*/)
```
Do search with some `rule` and process selected data with `finalizer`.

#### About rule

In depth - `rule` may be RegExp or function. If `rule` is RegExp - it may be usefull set `interpSequence` - how interpretate matched data - by default it `{key: 1, value: 2}` - first RegExp capture group us key and second - values.

In case of reverse position as `{key: 2, value: 1}` to readability code will be used ` tinyDataObj.searchBack()` method.

If `rule` is function it must have next structure
```javascript
let rule = (stringifiedItem/*String*/, emit/*function*/) => {
  // logic to process stringifiedItem
  emit(key, value)
}
```
#### About finalizer

As last step selected data may be prosecced with `finalizer` - its function with next structure
```javascript

let finalizer = (key/*String|Number*/, values /*Array*/, emit/*function*/) => {
  // logic to process data
  emit(someKey, someValue)
}
```

Its called for every 'key', selected in first stage, but MAY return different key (even duplicated) and any value as result

### Internal delimiter

```javascript
let internalDelimiter = tinyDataObj.getInternalDelimiter()
```

This method return internal delimiter, which used internal instead of dots ('.'), to separete full stringified value.
In case of RegExp used at `search` - all transformation cloaked, but in case of function used - internal delimiter must be used. For example:

``javascript
// search for black color at foo at { foo : { color : 'black' }, bar : { color: 'white'} }
if (stringifiedItem === `foo${internalDelimiter}color${internalDelimiter}black`) {
  // some logic
}
```

### RegExp transfomtation

``javascript
// search for white color at foo at { foo : { color : 'black' }, bar : { color: 'white'} }
let color = 'white'
let re = new RegExp(`[^.]\\.color\\.${color}`)
let internalRegExp = tinyDataObj.doTransormRegExp(re/*RegExp*/)

if (stringifiedItem.test(internalRegExp) {
  // some logic
}
```

To simplify delimiter transfomtation and use dots ('.') for readability, `doTransormRegExp` may be used

### Data by path helper

``javascript
let path = 'foo.color'
let fooColor = tinyDataObj.getDataByPath(path/*string*/)
```

Helper to get data by path

## General Notes:

In some cases `TinyData` may be faster and cleaner than routine forEach cycles. In some cases not.





