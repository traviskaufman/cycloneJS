/**
 * Cyclone.js: An Adaptation of the HTML5 structured cloning alogrithm.
 * @author Travis Kaufman <travis.kaufman@gmail.com>
 * @license MIT
 */

// This module can recursively clone objects, including those containing
// number, boolean, string, date, and regex objects. It can also clone objects
// which include cyclic references to itself, including nested cyclic
// references. It is tested in all ES5-compatible environments.
(function(root) {
  'use strict';

  var __call__ = Function.prototype.call;
  var _hasOwn = _bind(__call__, {}.hasOwnProperty);
  var _toString = _bind(__call__, {}.toString);
  var _slice = _bind(__call__, [].slice);

  // Many environments seem to not support ES5's native bind as of now.
  // Because of this, we'll use our own implementation.
  function _bind(fn, ctx) {
    // Get a locally-scoped version of _slice here.
    var _slice = [].slice;
    // Like native bind, an arbitrary amount of arguments can be passed into
    // this function which will automatically be bound to it whenever it's
    // called.
    var boundArgs = _slice.call(arguments, 2);

    return function() {
      return fn.apply(ctx, boundArgs.concat(_slice.call(arguments)));
    };
  }

  function _isFunc(obj) {
    return (typeof obj === 'function');
  }

  // Quick and dirty shallow-copy functionality for options hash
  function _mergeParams(src/*, target1, ..., targetN*/) {
    return _slice(arguments, 1).reduce(function(target, mixin) {
      for (var key in mixin) {
        if (_hasOwn(mixin, key) && !_hasOwn(target, key)) {
          target[key] = mixin[key];
        }
      }
      return target;
    }, src);
  }

  // We shim ES6's Map here if it's not in the environment already. Although
  // it would be better to use WeakMaps here, this is impossible to do with ES5
  // since references to objects won't be garbage collected if they're still
  // in the map, so it's better to keep the implementation consistent.
  var Map = _isFunc(root.Map) ? root.Map : function Map() {
    Object.defineProperties(this, {
      inputs: {
        value: [],
        enumerable: false
      },
      outputs: {
        value: [],
        enumerable: false
      }
    });
  };

  // All we need are the `get` and `set` public-facing methods so we shim just
  // them.

  if (!_isFunc(Map.prototype.set)) {
    // Map a given `input` object to a given `output` object. Relatively
    // straightforward.
    Map.prototype.set = function(input, output) {
      var inputIdx = this.inputs.indexOf(input);
      if (inputIdx === -1) {
        this.inputs.push(input);
        this.outputs.push(output);
      } else {
        // Associate this input with the new output.
        this.outputs[inputIdx] = output;
      }
    };
  }

  if (!_isFunc(Map.prototype.get)) {
    // Retrieve the object that's mapped to `input`, or null if input is not
    // found within the transfer map.
    Map.prototype.get = function(input) {
      var idx = this.inputs.indexOf(input);
      var output = null;

      if (idx > -1) {
        output = this.outputs[idx];
      }

      return output;
    };
  }

  // Any custom cloning procedures defined by the client will be stored here.
  var _customCloneProcedures = [];

  // Performs the "internal structured clone" portion of the structured cloning
  // algorithm. `input` is any valid object, and `mMap` is a(n empty)
  // Map instance. `options` is the same as it is for `clone`
  function _iSClone(input, mMap, options) {
    options = _mergeParams(((typeof options === 'object') ? options : {}), {
      allowFunctions: false
    });

    if (input === null) {
      return null;
    }

    if (Object(input) === input) {
      return _handleObjectClone(input, mMap, options);
    }

    return input;
  }

  // Here lies the meat and potatoes of the algorithm. `_handleObjectClone`
  // is responsible for creating deep copies of complex objects. Its parameters
  // are the same as for `_isClone`.
  function _handleObjectClone(input, mMap, options) {
    // First we make sure that we aren't dealing with a circular reference.
    var _selfRef = mMap.get(input);
    if (_selfRef !== null) {
      return _selfRef;
    }

    // We also check up front to make sure that a client-defined custom
    // procedure has not been registered for this type of object. If it has,
    // it takes priority over any of the implementations below.
    var _cloneAttempt = _attemptCustomClone(input);
    if (typeof _cloneAttempt !== 'undefined') {
      return _cloneAttempt;
    }

    // Most supported object types can be copied simply by creating a new
    // instance of the object using its current value, so we save that in this
    // variable.
    var val = input.valueOf();
    var obType = _toString(input);
    var output;
    // We define a collection as either an array of Objects other than String,
    // Number, Boolean, Date, or RegExp objects. Basically it's any structure
    // where recursive cloning may be necessary.
    var isCollection = false;

    switch (obType) {
      // These cases follow the W3C's specification for how certain objects
      // are handled. Note that jshint will complain about using Object
      // wrappers for primitives (as it should), but we have to handle this
      // case should the client pass one in.

      /*jshint -W053 */
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
        output = _handleRegExpClone(val);
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
        // If `options.allowFunctions` is set to true, we allow functions to
        // be passed directly into the copied object.
        if (_isFunc(input) && (options.allowFunctions === true)) {
          output = input;
        } else {
          throw new TypeError(
            "Don't know how to clone object of type " + obType
          );
        }
        break;
    }

    // Map this specific object to its output in case its cyclically referenced
    mMap.set(input, output);

    if (isCollection) {
      _handleCollectionClone(input, output, mMap, options);
    }

    return output;
  }

  // Handles the safe cloning of RegExp objects, where we explicitly pass the
  // regex object, the source, and flags separately, as this prevents bugs
  // within phantomJS (and possibly other environments as well).
  function _handleRegExpClone(re) {
    var flags = '';
    if (re.global) {
      flags += 'g';
    }
    if (re.ignoreCase) {
      flags += 'i';
    }
    if (re.multiline) {
      flags += 'm';
    }

    return new RegExp(re.source, flags);
  }

  // Handles the recursive portion of structured cloning.
  function _handleCollectionClone(input, output, mMap, options) {
    var prop;

    for (prop in input) {
      // Note that we use the hasOwnProperty guard here since we've already
      // used `Object.create()` to create the duplicate, so we have
      // already acquired the original object's prototype. Note that the W3C
      // spec explicitly states that this algorithm does *not* walk the
      // prototype chain, and therefore all Object prototypes are live
      // (assigned as a reference).
      if (_hasOwn(input, prop)) {
        output[prop] = _iSClone(input[prop], mMap, options);
      }
    }
  }

  function _attemptCustomClone(obj) {
    var proc;
    var copy;
    var procIdx = _customCloneProcedures.length;
    // Note that if two procedures passed in detect the same type of object,
    // the latest procedure will take priority.
    while (procIdx--) {
      proc = _customCloneProcedures[procIdx];
      if (proc.detect(obj)) {
        copy = proc.copy(obj);
        break;
      }
    }

    return copy;
  }

  // This is the module that we expose to the rest of the world.
  // CY.clone...get it? :)
  var CY = {
    clone: function(input, options) {
      return _iSClone(input, new Map(), options);
    },

    // Returns true if the procedure is successfullly defined, false otherwise.
    defineCloneProcedure: function(procObj) {
      // Make sure we can use this procedure
      if (typeof procObj === 'object' &&
          _isFunc(procObj.detect) &&
          _isFunc(procObj.copy)) {

        _customCloneProcedures.push(procObj);
        return true;
      }

      return false;
    },

    clearCustomCloneProcedures: function() {
      _customCloneProcedures = [];
    }
  };

  // Finally we take care of exporting business.

  if (typeof module === 'object' && typeof module.exports === 'object') {
    // Node
    module.exports = CY;
  } else if (_isFunc(define) && _isFunc(require)) {
    // AMD/RequireJS
    define([], function() { return CY; });
  } else {
    // Browser or some other environment. Simply attach the module to the root
    // object.
    root.CY = CY;
  }
})(this);
