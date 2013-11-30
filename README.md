[![Build Status](https://travis-ci.org/traviskaufman/cycloneJS.png)](https://travis-ci.org/traviskaufman/cycloneJS)

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
* Non-enumerable properties, or properties with custom descriptors
* Accessor properties

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

### Cloning options
`CY.clone` takes an options hash as a second argument, which accepts the following parameters:
* `allowFunctions`: (default: `false`) If set to true, `CY.clone` will simply pass functions through to the copied object, instead of throwing an error saying it can't clone a function.
```javascript
var fnObject = {
  f: function() {}
};
var copy = CY.clone(fnObject, {
  allowFunctions: true
});
console.log(copy.f === fnObject.f) // true
```
* `suppressErrors`: (default: `false`) If set to true, `CY.clone` will return `null` instead of throwing an Error if it comes across an object it doesn't know how to clone. If you need `CY.clone` to be extremely forgiving, this is the option for you.
```javascript
var mixedBag = {
  htmlElement: document.createElement('div'),
  ctx: document.getElementsByTagName('canvas')[0].getContext('2d')
};
var result = CY.clone(mixedBag, {
  suppressErrors: true
});
console.log(result); // null
```

### Extending `CY.clone()`'s functionality with `defineCloneProcedure`

Because cyclone is built to be environment-agnostic, it is incapable of handling certain cloneable host objects, such as DOM elements, out-of-the-box. However, that doesn't mean that these objects themselves aren't cloneable! For example, most DOM elements can be cloned using `cloneNode()`. Cyclone comes with a method called `defineCloneProcedure` that allows you to add in your own cloning methods for host objects, or other objects, that can't be handled in a standard way by `CY.clone`. Here's how you can add support for cloning DOM nodes using `CY.clone`:
```javascript
var elementTagRE = /^HTML\w*Element$/;
CY.defineCloneProcedure({
  detect: function(obj) {
    var klass = Object.prototype.toString.call(obj).slice(8, -1);
    return elementTagRE.test(klass) && typeof obj.cloneNode === 'function';
  },
  copy: function(el) {
    return el.cloneNode()
  }
});

var orig = document.createElement('div');
var clone = CY.clone(orig);
console.log(clone !== orig); // True
```

Here's another example of how to handle most jQuery objects:
```javascript
CY.defineCloneProcedure({
  detect: function(obj) {
    return 'jquery' in obj;
  },
  copy: function($el) {
    return $el.clone();
  }
});

CY.clone($('#main')); // Returns a cloned jQuery object.
```

`defineCloneProcedure` takes an object that _must_ contain two properties `detect` and `copy`.

`detect` should be a function that takes an object and returns `true` if and only if `obj` is of the type that you want to define your custom cloning procedure for. In the above example, `detect` ensures that the `[[Class]]` of `obj` is specified as some kind of HTML Element, and that it has a function called `cloneNode`.

`copy` should be a function that takes an object and returns a copy of that object. You are responsible for providing the procedure used to copy the object. In the case of an HTML Element, we simply call its `cloneNode` method.

`defineCloneProcedure` will return `true` if the cloning procedure is successfully defined, and `false` otherwise. Note that `defineCloneProcedure` gives priority to procedures that were defined most recently. That means if you define two cloning procedures whose `detect` functions both return true for a given type of object, the latter's `copy` function will be used.

You can erase all custom cloning procedures defined by calling `CY.clearCustomCloneProcedures()`.

## Contributing/Testing
First install the module
```sh
$ git clone https://github.com/traviskaufman/cycloneJS.git
$ cd /path/to/cycloneJS
$ npm install .
```
Then just run `npm test` within the module's directory whenever you want to test. This will run jshint on all javascript
files as well as run tests against cyclone.

Issues and Pull Requests are widely encouraged!!
