// Cyclone.js: An Adaptation of the HTML5 structured cloning alogrithm.
//
// Can recursively clone objects, including those containing number, boolean,
// string, date, and regex objects. It can also clone objects which included
// cyclic references to itself, including nested cyclic references.
//
// Works in ES5-compatible browsers.

(function(root) {
  'use strict';

  var __call__ = Function.prototype.call;
  var _hasProp = __call__.bind({}.hasOwnProperty);
  var _toString = __call__.bind({}.toString);

  // Utilities for working with transfer maps. A transfer map is defined as an
  // object that has two properties, `inputs` and `outputs`, each of which
  // are arrays where for any object at inputs[i], the output value that should
  // be mapped to the cloned object for that object resides at outputs[i]. See
  // the W3C spec for more details. This was the closest I could get without
  // having to set custom properties on objects, which wouldn't work for
  // immutable objects anyway.
  function TransferMap() {
    this.inputs = [];
    this.outputs = [];
  }

  // Map a given `input` object to a given `output` object. Relatively
  // straightforward.
  TransferMap.prototype.set = function(input, output) {
    // We only want to set a reference if the reference already doesn't exist.
    // This is included for defensive reasons.
    if (this.inputs.indexOf(input) === -1) {
      this.inputs.push(input);
      this.outputs.push(output);
    }
  };

  // Retrieve the object that's mapped to `input`, or null if input is not
  // found within the transfer map.
  TransferMap.prototype.get = function(input) {
    var idx = this.inputs.indexOf(input);
    var output = null;

    if (idx > -1) {
      output = this.outputs[idx];
    }

    return output;
  };

  // Regex used to test whether or not an object could be an HTML Element.
  var _htmlElementRE = /^\[object\sHTML(.*?)Element\]$/;

  // Performs the "internal structured clone" portion of the structured cloning
  // algorithm. `input` is any valid object, and `tMap` is a(n empty)
  // TransferMap instance.
  function _iSClone(input, tMap) {
    if (input === null) {
      return null;
    }

    if (typeof input === 'object') {
      return _handleObjectClone(input, tMap);
    }

    return input;
  }

  // Here lies the meat and potatoes of the algorithm. _handleObjectClone
  // is responsible for creating deep copies of complex data. Its parameters
  // are the same as for _isClone.
  function _handleObjectClone(input, tMap) {
    // First we make sure that we aren't dealing with a circular reference.
    var _selfRef = tMap.get(input);
    if (_selfRef !== null) {
      return _selfRef;
    }

    // Most supported object types can be copied just be creating a new
    // instance of the object using its current value, so we save that in this
    // variable.
    var val = input.valueOf();
    var obType = _toString(input);
    var output;
    // We defined a collection as either an array of Object other than String,
    // Number, Boolean, Date, or RegExp objects. Basically any structure where
    // recursive cloning may be necessary.
    var isCollection = false;

    switch (obType) {
      // These cases follow the W3C's specification for how certain objects
      // are handled.
      case '[object String]':
        output = new String(val);
        break;

      case '[object Number]':
        output = new Number(val);
        break;

      case '[object Boolean]':
        output = new Boolean(val);
        break;

      case '[object Date]':
        output = new Date(val);
        break;

      case '[object RegExp]':
        output = new RegExp(val);
        break;

      case '[object Array]':
        output = new Array(input.length);
        isCollection = true;
        break;

      case '[object Object]':
        // Although the spec says to simply create an empty object when
        // encountered with this scenario, we set up the proper prototype chain
        // in order to correctly copy objects that may not directly inherit
        // from Object.prototype.
        output = Object.create(Object.getPrototypeOf(input));
        isCollection = true;
        break;

      default:
        // If it's an HTML Element, try to clone it.
        if (_htmlElementRE.test(obType) &&
            typeof input.cloneNode === 'function') {

          output = input.cloneNode();
        } else {
          // Otherwise just throw an error.
          throw new TypeError(
            "Don't know how to clone object of type " + obType
          );
        }
    }

    // Map this specific object to its output in case its cyclically referenced
    tMap.set(input, output);

    if (isCollection) {
      _handleCollectionClone(input, output, tMap);
    }

    return output;
  }

  // Handles the recursive portion of structured cloning.
  function _handleCollectionClone(input, output, tMap) {
    var prop;

    for (prop in input) {
      // Note that we use the hasOwnProperty guard here since we've already
      // used either Object.create() to create the duplicate, so we have
      // already acquired the original object's prototype. Note that the W3C
      // spec explicitly states that this algorithm does *not* walk the
      // prototype chain, and therefore all Object prototypes are live
      // (assigned as a reference).
      if (_hasProp(input, prop)) {
        output[prop] = _iSClone(input[prop], tMap);
      }
    }
  }

  // This is the module that we expose to the rest of the world, with one
  // singular method. CY.clone...get it? :)
  var CY = {
    clone: function(input) {
      return _iSClone(input, new TransferMap());
    }
  };

  // Finally we take care of exporting business.

  if (typeof module === 'object' && typeof module.exports === 'object') {
    // Node
    module.exports = CY;
  } else if (typeof define === 'function' && typeof require === 'function') {
    // AMD/RequireJS
    define([], function() { return CY; });
  } else {
    // Browser or some other environment. Simply attach the module to the root
    // object.
    root.CY = CY;
  }
})(this);
