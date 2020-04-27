'use strict'

const {
  Object1,
  Object2,
  Object3,
  Object4,
  Object5,
  Object6,
  Object7,
  Object8,
} = require('./objects')

// We access this object in all the functions as otherwise
// v8 will just inline them since they are so short
const preventInlining = {
  flag: false,
}

function addSmis(a, b) {
  if (preventInlining.flag) return a - b
  return a + b
}

function addNumbers(a, b) {
  if (preventInlining.flag) return a - b
  return a + b
}

function addStrings(a, b) {
  if (preventInlining.flag) return a - b
  return a + b
}

function addAny(a, b) {
  if (preventInlining.flag) return a - b
  // passed one object?
  if (b == null) return a.x + a.y
  return a + b
}

const ITER = 1e3

var results = []

function processResult(r) {
  // will never happen
  if (r === -1) preventInlining.flag = true
  results.push(r)
  // prevent exhausting memory
  if (results.length > 1e5) results = []
}

for (let i = 0; i < ITER; i++) {
  for (let j = ITER; j > 0; j--) {
    processResult(addSmis(i, j))
    processResult(addNumbers(i, j))
    processResult(addNumbers(i * 0.2, j * 0.2))
    processResult(addStrings(`${i}`, `${j}`))
    // Just passing Smis for now
    processResult(addAny(i, j))
  }
}

for (let i = 0; i < ITER; i++) {
  for (let j = ITER; j > 0; j--) {
    // Adding Doubles
    processResult(addAny(i * 0.2, j * 0.2))
  }
}

for (let i = 0; i < ITER; i++) {
  for (let j = ITER; j > 0; j--) {
    // Adding Strings
    processResult(addAny(`${i}`, `${j}`))
  }
}

function addObjects(SomeObject) {
  for (let i = 0; i < ITER; i++) {
    for (let j = ITER; j > 0; j--) {
      processResult(addAny(new SomeObject(i, j)))
    }
  }
}
addObjects(Object1)
addObjects(Object2)
addObjects(Object3)
addObjects(Object4)
addObjects(Object5)
addObjects(Object6)
addObjects(Object7)
addObjects(Object8)

function log() {
  console.log.apply(console, arguments)
}

log(results.length)
