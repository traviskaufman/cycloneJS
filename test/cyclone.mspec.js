/**
 * CycloneJS Unit Tests.
 */
var CY = require('../cyclone.js');
var expect = require('expect.js');

describe('cycloneJS', function() {
  var original;
  var number = Math.random();
  var regex = /^someRE$/g;
  var bool = false;
  var string = 'hey';
  var date = new Date();
  var array = [1, 2, 3];
  var object = {};

  // http://stackoverflow.com/questions/10776600/
  // testing-for-equality-of-regular-expressions
  function _isRegexEqual(r1, r2) {
    var props;
    var prop;
    if (r1 instanceof RegExp && r2 instanceof RegExp) {
      props = ["global", "multiline", "ignoreCase", "source"];
        for (var i = 0; i < props.length; i++) {
          prop = props[i];
            if (r1[prop] !== r2[prop]) {
              return false;
            }
          }
          return true;
    }
    return false;
  }

  beforeEach(function() {
    /*jshint -W053 */
    original = {
      number: Math.random(),
      bool: false,
      string: 'hello!',
      date: new Date(),
      numberObj: new Number(1),
      boolObj: new Boolean(true),
      stringObj: new String('hey'),
      regex: /^someRE$/g,
      array: [1, 2, {buckleMy: 'shoe'}],
      object: {
        foo: 1,
        bar: 2,
        nested: {
          array: ['holy', 'moly']
        }
      }
    };
  });

  describe('basic cloning functionality', function() {
    var clone;
    beforeEach(function() {
      clone = CY.clone(original);
    });

    it('creates a different object', function() {
      expect(clone).not.to.be(original);
    });

    describe('cloning primitives', function() {
      it('preserves number values', function() {
        expect(clone.number).to.be(original.number);
      });

      it('preserves boolean values', function() {
        expect(clone.bool).to.be(original.bool);
      });

      it('preserves string values', function() {
        expect(clone.string).to.be(original.string);
      });
    });

    describe('cloning object wrappers', function() {
      function _isClonedWrapper(w1, w2) {
        return (w1 !== w2 && w1.valueOf() === w2.valueOf());
      }

      it('clones number objects', function() {
        expect(_isClonedWrapper(original.numberObj, clone.numberObj)).to.be(true);
      });

      it('clones regex objects', function() {
        expect(original.regex).not.to.be(clone.regex);
        expect(_isRegexEqual(original.regex, clone.regex)).to.be(true);
      });

      it('clones boolean objects', function() {
        expect(_isClonedWrapper(original.boolObj, clone.boolObj)).to.be(true);
      });

      it('clones string objects', function() {
        expect(_isClonedWrapper(original.stringObj, clone.stringObj)).to.be(true);
      });
    });

    describe('cloning dates', function() {
      it('clones dates', function() {
        expect(original.date).not.to.be(clone.date);
      });

      it('preserves the same value from the original date', function() {
        expect(original.date.valueOf()).to.be(clone.date.valueOf());
      });
    });

    describe('cloning complex objects', function() {
      it('deep-clones arrays', function() {
        expect(original.array).not.to.be(clone.array);
        expect(original.array).to.eql(clone.array);

        expect(original.array[2]).not.to.be(clone.array[2]);
        expect(original.array[2]).to.eql(clone.array[2]);
      });

      it('deep-clones plain objects', function() {
        expect(original.object).not.to.be(clone.object);
        expect(original.object).to.eql(clone.object);

        expect(original.object.nested).not.to.be(clone.object.nested);
        expect(original.object.nested).to.eql(clone.object.nested);
      });

      it('GOES DEEPER!!!!', function() {
        // WE CAN GO DEEPER!
        expect(original.object.nested.array).not.to.be(clone.object.nested.array);
        expect(original.object.nested.array).to.eql(clone.object.nested.array);
      });
    });
  }); // Basic Functionality

  describe('Cyclic references', function() {
    beforeEach(function() {
      original.self = original;
      original.nestedSelf = {ref: original};  // ew
      clone = CY.clone(original);
    });

    it('clones cyclic references', function() {
      expect(original.self).not.to.be(clone.self);
      expect(clone.self).to.be(clone);
    });

    it('clones nested cyclic references', function() {
      expect(original.nestedSelf.ref).not.to.be(clone.nestedSelf.ref);
      expect(clone.nestedSelf.ref).to.be(clone);
    });
  });

  // Not yet implemented
  xdescribe('Custom cloning procedures', function() {
    function Person(name) {
      this.name = name;
    }
    Person.prototype.greet = function() {
      return 'Hi! My name is ' + this.name;
    };
    var eminem = 'The Real Shady';
    var theRealSlimShady;

    beforeEach(function() {
      theRealSlimShady = new Person(eminem);
    });

    afterEach(function() {
      CY.clearCustomCloneProcedures();
    });

    it('allows clients to define custom cloning procedures', function() {
      CY.defineCloneProcedure({
        detect: function(obj) {
          return (obj instanceof Person && obj.name === eminem);
        },
        copy: function(obj) {
          return new Person('Otha Slim Shady');
        }
      });

      var whackAssPretender = CY.clone(theRealSlimShady);
      expect(whackAssPretender).not.to.be(theRealSlimShady);
      expect(whackAssPretender.greet()).to.be('Hi! My name is Otha Slim Shady');
    });
  });

  describe('edge cases', function() {
    it('returns the value of a primitive if it is explicitly passed one', function() {
      expect(CY.clone(1)).to.be(1);
      expect(CY.clone('hey')).to.be('hey');
      expect(CY.clone(false)).to.be(false);
    });

    it('returns null when passed null', function() {
      expect(CY.clone(null)).to.be(null);
    });

    it('returns undefined when passed undefined', function() {
      expect(CY.clone(undefined)).to.be(undefined);
    });
  });
});
