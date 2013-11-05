[![Build Status](https://travis-ci.org/traviskaufman/cycloneJS.png)](https://travis-ci.org/traviskaufman/cycloneJS)
[![browser support](https://ci.testling.com/traviskaufman/cycloneJS.png)](https://ci.testling.com/traviskaufman/cycloneJS)

Cyclone is an attempt to implement an adaptation of the HTML5 [Structured
Cloning
Algorithm](http://www.w3.org/TR/html5/infrastructure.html#safe-passing-of-structured-data).

It is meant to be:

* Synchronous
* Agnostic to the JS environment (doesn't rely on `postMessage()`,
  `replaceState()`, etc), and therefore agnostic to types such as `File`,
  `Blob`, etc (which also allows it to be synchronous in the first place).
* Serve the <strong>majority of use cases out of the box</strong>, but also
  provide a mechanism to be extensible (coming soon).
* Able to copy functions (including function objects) by reference.
  <strong>This is the only property that's copied by reference.</strong>
  See above about serving the *majority* of use cases.
* Able to copy DOM objects via `cloneNode`

It can handle objects containing:

* Primitives
* `null`
* `undefined`
* Number objects
* String objects
* Boolean objects
* Date objects
* RegExp objects
* Array objects
* Object (or "plain") objects
* In most cases, Objects instantiated with the use of a custom constructor (e.g. `function Foo() { this.bar = 'baz' }; var cloneable = new Foo();`)
* Cyclic references to itself, including nested cyclic references
* Cyclic references to objects within itself, including nested cyclic references to those objects

## Usage
This module exposes a single object, `CY`, into the global scope when used within browsers. A client can then use
this module's `clone` method to perform clone operations.

```javascript
  var o = {
    date: new Date(),
    number: Math.random()
  };
  o.self = o;
  o.tricky = { self: o };

  var c = CY.clone(o);

  c === o; // false
  c.date === o.date; // false

  +(c.date) === +(o.date); // true
  c.number === o.number;  // true
  c.self === c;  // true
  c.tricky.self === c;  // true
```

Note that cycloneJS also supports AMD loading as well as use within nodeJS/CJS environments, so with node you could do something like
```javascript
var CY = require('cyclonejs');
// Do some CY.clone()-ing
```

## Contributing/Testing
First install the module
```sh
$ git clone https://github.com/traviskaufman/cycloneJS.git
$ cd /path/to/cycloneJS
$ npm install .
```
Then just run `npm test` within the module's directory whenever you want to test. This will run jshint on all javascript
files as well as run tests against cyclone.

## Coming Soon
* Ability to define your own protocols for copying unsupported and/or custom
  objects.
* Features other people contribute.
