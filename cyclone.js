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

  function _iSClone(input, mMap, refs) {
    if (input === null) {
      return null;
    }

    if (typeof input === 'object') {
      return _handleObjectClone(input, mMap, refs);
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

  function _handleObjectClone(input, mMap, refs) {
    var _selfRef = _findSelfReference(input, mMap);
    if (_selfRef !== null) {
      return _selfRef;
    }

    var val = input.valueOf();
    var obType = _toString(input);
    var output;

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
        refs.push({input: input, output: output});
        output = _handleEnumClone(input, output, mMap, refs);
        break;

      case '[object Object]':
        output = {};
        refs.push({input: input, output: output});
        output = _handleEnumClone(input, output, mMap, refs);
        break;

      default:
        throw new TypeError(
          "Don't know how to clone object of type ' + obType"
        );
    }

    mMap.push({input: input, output: output});

    return output;
  }

  function _handleEnumClone(input, output, mMap, refs) {
    var prop;
    var propVal;
    var selfRef;

    for (prop in input) {
      if (_hasProp(input, prop)) {
        propVal = input[prop];
        selfRef = _findSelfReference(propVal, refs);

        if (propVal === input) { // Cyclic dependency
          output[prop] = output;
        } else if (selfRef !== null) { // Nested cyclic dependency! Oh my!
          output[prop] = selfRef;
        } else {
          output[prop] = _iSClone(propVal, mMap, refs);
        }
      }
    }

    return output;
  }

  var CY = {
    clone: function(input) {
      return _iSClone(input, [], []);
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
