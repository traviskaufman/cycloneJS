// Cyclone.js: An Adaptation of the HTML5 structured cloning alogrithm.
//
// Can recursively clone objects, including those containing number, boolean,
// string, date, and regex objects. It can also clone objects which included
// cyclic references to itself, including nested cyclic references.
//
// Works in ES5-compatible browsers.
//
// @todo Tests and Dox
// @todo structural typing for custom cloning procedures?
// @todo optsHash?

(function(root) {
  'use strict';

  var __call__ = Function.prototype.call;
  var _hasProp = __call__.bind({}.hasOwnProperty);
  var _toString = __call__.bind({}.toString);

  // Utilities for working with transfer maps. A transfer map is defined as an
  // object that has two properties, `inputs` and `outputs`, each of which
  // are arrays where for any object at inputs[i], the output value that should
  // be mapped to the cloned object for that object resides at outputs[i]. See
  // the W3 spec for more details. This was the closest I could get without
  // having to set custom properties on objects, which wouldn't work for
  // immutable objects anyway.
  function TransferMap() {
    this.inputs = [];
    this.outputs = [];
  }

  TransferMap.prototype.set = function(input, output) {
    if (this.inputs.indexOf(input) === -1) {
      this.inputs.push(input);
      this.outputs.push(output);
    }
  };

  TransferMap.prototype.get = function(input) {
    var idx = this.inputs.indexOf(input);
    var output = null;

    if (idx > -1) {
      output = this.outputs[idx];
    }

    return output;
  };

  function _iSClone(input, tMap) {
    if (input === null) {
      return null;
    }

    if (typeof input === 'object') {
      return _handleObjectClone(input, tMap);
    }

    return input;
  }

  function _handleObjectClone(input, tMap) {
    var _selfRef = tMap.get(input);
    if (_selfRef !== null) {
      return _selfRef;
    }

    var val = input.valueOf();
    var obType = _toString(input);
    var output;
    var isCollection = false;

    switch (obType) {
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
        output = Object.create(Object.getPrototypeOf(input));
        isCollection = true;
        break;

      default:
        throw new TypeError(
          "Don't know how to clone object of type " + obType
        );
    }

    tMap.set(input, output);

    if (isCollection) {
      _handleCollectionClone(input, output, tMap);
    }

    return output;
  }

  function _handleCollectionClone(input, output, tMap) {
    var prop;

    for (prop in input) {
      if (_hasProp(input, prop)) {
        output[prop] = _iSClone(input[prop], tMap);
      }
    }
  }

  var CY = {
    clone: function(input) {
      return _iSClone(input, new TransferMap());
    }
  };

  if (typeof module === 'object' && typeof module.exports === 'object') {
    // Node
    module.exports = CY;
  } else {
    // Not Node
    root.CY = CY;
  }
})(this);
