'use strict';

/**
 * Unit tests for array buffers and typed arrays
 */
var CY = require('../cyclone.js');
var expect = global.expect;

var TYPED_ARRAY_CLASSES = Object.getOwnPropertyNames(global)
                            .filter(function(p) {
                              return /^(?:.+)Array$/.test(p);
                            });

describe('CycloneJS (typed arrays and array buffers)', function() {
  it('clones array buffers', function() {
    var orig = buffer();
    var cloned = CY.clone(orig);

    expect(cloned).not.to.equal(orig);
    expect(cloned).to.eql(orig);
  });

  TYPED_ARRAY_CLASSES.forEach(function(className) {
    it('clones ' + className + 's', function() {
      var orig = typedArray(className);
      var cloned = CY.clone(orig);

      expect(Object.getPrototypeOf(cloned).constructor.name)
        .to.equal(className);
      expect(cloned.buffer).not.to.equal(orig.buffer);
      expect(cloned.buffer).to.eql(orig.buffer);
      expect(cloned.byteOffset).to.equal(orig.byteOffset);
      expect(cloned.length).to.equal(orig.length);
    });
  });
});

function typedArray(klass, len) {
  var Ctor = global[klass];
  if (typeof Ctor != 'function') {
    throw new ReferenceError('Cannot find constructor for ' + klass);
  }

  var buf = buffer(len, Ctor.prototype.BYTES_PER_ELEMENT);
  return new Ctor(buf);
}

function buffer(len, bytesPerElement) {
  bytesPerElement = bytesPerElement || 8;
  assertCorrectByteSize(bytesPerElement);

  var buf = new ArrayBuffer(len || 64);
  for (var i = 0, l = buf.byteLength; i < l; i++) {
    buf[i] = randRange(0, Math.pow(2, bytesPerElement)-1);
  }

  return buf;
}

function randRange(min, max) {
  return Math.floor(Math.random() * (max-min) + min);
}

function assertCorrectByteSize(byteSize) {
  byteSize = parseInt(byteSize, 10);
  if (byteSize != byteSize) {
    throw new TypeError('invalid byteSize number');
  }
  if ([1, 2, 4, 8].indexOf(byteSize) < 0) {
    throw new Error('invalid byteSize ' + byteSize);
  }
}
