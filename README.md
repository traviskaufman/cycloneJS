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
  See above abort serving the *majority* of use cases.

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
* Cyclic references to itself, including nested cyclic references.

## Usage
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

## Coming Soon
* `package.json`
* Tests and Documentation.
* Built-in support for cloning DOM nodes.
* Ability to define your own protocols for copying unsupported and/or custom
  objects.
* Features other people contribute.
