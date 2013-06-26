/**
 * Adaptation of the HTML5 structured cloning alogrithm.
 *
 * Can recursively clone objects, including those containing number, boolean,
 * string, date, and regex objects. It can also clone objects which included
 * cyclic references to itself, including nested cyclic references.
 *
 * Works in ES5-compatible browsers.
 *
 * @todo HTMLEntities
 * @todo Tests and Dox
 * @todo Does this really work?
 * @todo structural typing for custom cloning procedures?
 * @todo optsHash?
 */

(function(root) {
  var __call__ = Function.prototype.call;
  var _hasProp = __call__.bind({}.hasOwnProperty);
  var _toString = __call__.bind({}.toString);
  var _forEach = __call__.bind([].forEach);

  function _iSClone(input, mMap) {
    if (input === null) {
      return null;
    }

    if (typeof input === 'object') {
      return _handleObjectClone(input, mMap);
    }

    return input;
  }

  function _findSelfReference(input, mMap) {
    var _selfReferenceVal = null;
    var isFound = false;

    mMap.forEach(function(pair) {
      if (!isFound && pair.input === input) {
        isFound = true;
        _selfReferenceVal = pair.output;
      }
    });

    return _selfReferenceVal;
  }

  function _handleObjectClone(input, mMap) {
    var _selfRef = _findSelfReference(input, mMap);
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
        output = {};
        isCollection = true;
        break;

      default:
        throw new TypeError(
          "Don't know how to clone object of type ' + obType"
        );
    }

    mMap.push({input: input, output: output});

    if (isCollection) {
      _handleCollectionClone(input, output, mMap);
    }

    return output;
  }

  function _handleCollectionClone(input, output, mMap) {
    var prop;

    for (prop in input) {
      if (_hasProp(input, prop)) {
        propVal = input[prop];
        output[prop] = _iSClone(input[prop], mMap);
      }
    }
  }

  var CY = {
    clone: function(input) {
      return _iSClone(input, []);
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
