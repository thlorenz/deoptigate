'use strict'

/* global print */

class Object1 {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class Object2 {
  constructor(x, y) {
    this.y = y
    this.x = x
  }
}

class Object3 {
  constructor(x, y) {
    this.hello = 'world'
    this.x = x
    this.y = y
  }
}

class Object4 {
  constructor(x, y) {
    this.x = x
    this.hello = 'world'
    this.y = y
  }
}

class Object5 {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.hello = 'world'
  }
}

class Object6 {
  constructor(x, y) {
    this.hola = 'mundo'
    this.x = x
    this.y = y
    this.hello = 'world'
  }
}

class Object7 {
  constructor(x, y) {
    this.x = x
    this.hola = 'mundo'
    this.y = y
    this.hello = 'world'
  }
}

class Object8 {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.hola = 'mundo'
    this.hello = 'world'
  }
}
// We access this object in all the functions as otherwise
// v8 will just inline them since they are so short
const preventInlining = {
  flag: false
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

const ITER = 1E3

var results = []

function processResult(r) {
  // will never happen
  if (r === -1) preventInlining.flag = true
  results.push(r)
  // prevent exhausting memory
  if (results.length > 1E5) results = []
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

// make this work with d8 and Node.js
function log() {
  if (typeof print === 'function') {
    print.apply(this, arguments)
  } else {
    console.log.apply(console, arguments)
  }
}

log(results.length)
