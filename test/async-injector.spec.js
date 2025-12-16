import { expect } from 'chai';

import {
  AsyncInjector
} from 'async-didi';

/**
 * @typedef {import('async-didi').ModuleDeclaration} ModuleDeclaration
 */


describe('async-injector', function() {

  it('should consume an object as a module', async function() {

    class BubType {
      constructor() {
        this.name = 'bub';
      }
    }

    function BazType() {
      this.name = 'baz';
    }

    const module = /** @type ModuleDeclaration */ ({
      foo: [
        'factory',
        async function() {
          return 'foo-value';
        }
      ],
      bar: [ 'value', 'bar-value' ],
      baz: [ 'type', BazType ],
      bub: [ 'type', BubType ]
    });

    const injector = new AsyncInjector([ module ]);

    expect(await injector.get('foo')).to.equal('foo-value');
    expect(await injector.get('bar')).to.equal('bar-value');

    const bub = await injector.get('bub');
    expect(bub).to.be.an.instanceof(BubType);
    expect(bub.name).to.eql('bub');

    const baz = await injector.get('baz');
    expect(baz).to.be.an.instanceof(BazType);
    expect(baz.name).to.eql('baz');
  });


  describe('get', function() {

    it('should return an instance', async function() {
      class BazType {
        constructor() {
          this.name = 'baz';
        }
      }

      const module = /** @type ModuleDeclaration */ ({
        'foo': [ 'factory', async function() {
          return {
            name: 'foo'
          };
        } ],
        'bar': [ 'value', 'bar value' ],
        'baz': [ 'type', BazType ]
      });

      const injector = new AsyncInjector([ module ]);

      expect(await injector.get('foo')).to.deep.equal({
        name: 'foo'
      });
      expect(await injector.get('bar')).to.equal('bar value');
      expect(await injector.get('baz')).to.deep.equal({
        name: 'baz'
      });
      expect(await injector.get('baz')).to.be.an.instanceof(BazType);

      // default to strict=true
      expect(await injector.get('bar', true)).to.equal('bar value');
    });


    it('should always return the same instance', async function() {
      class BazType {
        constructor() {
          this.name = 'baz';
        }
      }

      const module = /** @type ModuleDeclaration */ ({
        'foo': [ 'factory', async function() {
          return {
            name: 'foo'
          };
        } ],
        'bar': [ 'value', 'bar value' ],
        'baz': [ 'type', BazType ]
      });

      const injector = new AsyncInjector([ module ]);

      expect(await injector.get('foo')).to.equal(await injector.get('foo'));
      expect(await injector.get('bar')).to.equal(await injector.get('bar'));
      expect(await injector.get('baz')).to.equal(await injector.get('baz'));
    });


    it('should reuse module', async function() {
      class FooType {
        constructor() {
          this.name = 'foo';
        }
      }

      function barFactory(foo) {
        return foo;
      }

      const module = /** @type ModuleDeclaration */ ({
        'foo': [ 'type', FooType ],
        'bar': [ 'factory', barFactory ]
      });

      const injector1 = new AsyncInjector([ module ]);
      expect(await injector1.get('foo')).to.equal(await injector1.get('bar'));

      const injector2 = new AsyncInjector([ module ]);
      expect(await injector2.get('foo')).to.equal(await injector2.get('bar'));
    });


    it('should reuse inject fn', async function() {
      class FooType {
        constructor() {
          this.name = 'foo';
        }

      }

      function barFactory(foo) {
        return foo;
      }

      const module = /** @type ModuleDeclaration */ ({
        'foo': [ 'type', FooType ],
        'bar': [ 'factory', barFactory ]
      });

      const injector = new AsyncInjector([ module ]);
      async function fn(foo, bar) {
        expect(foo).to.equal(await injector.get('foo'));
        expect(bar).to.equal(await injector.get('bar'));

        return false;
      }

      await injector.invoke([ 'foo', 'bar', fn ]);

      await injector.invoke([ 'foo', 'bar', fn ]);
    });


    it('should resolve dependencies', async function() {
      class Foo {
        constructor(bar1, baz1) {
          this.bar = bar1;
          this.baz = baz1;
        }
      }
      Foo.$inject = [ 'bar', 'baz' ];

      async function bar(baz, abc) {
        return {
          baz: baz,
          abc: abc
        };
      }
      bar.$inject = [ 'baz', 'abc' ];

      const module = /** @type ModuleDeclaration */ ({
        'foo': [ 'type', Foo ],
        'bar': [ 'factory', bar ],
        'baz': [ 'value', 'baz-value' ],
        'abc': [ 'value', 'abc-value' ]
      });

      const injector = new AsyncInjector([ module ]);
      const barInstance = await injector.get('bar');

      expect(barInstance).to.deep.equal({
        baz: 'baz-value',
        abc: 'abc-value'
      });

      const fooInstance = await injector.get('foo');

      expect(fooInstance.bar).to.deep.equal({
        baz: 'baz-value',
        abc: 'abc-value'
      });

      expect(fooInstance.baz).to.equal('baz-value');
    });


    it('should resolve dependencies (array notation)', async function() {
      class Foo {
        constructor(bar1, baz1) {
          this.bar = bar1;
          this.baz = baz1;
        }
      }

      const bar = async function(baz, abc) {
        return {
          baz: baz,
          abc: abc
        };
      };

      const module = /** @type ModuleDeclaration */ ({
        'foo': [ 'type', [ 'bar', 'baz', Foo ] ],
        'bar': [ 'factory', [ 'baz', 'abc', bar ] ],
        'baz': [ 'value', 'baz-value' ],
        'abc': [ 'value', 'abc-value' ]
      });

      const injector = new AsyncInjector([ module ]);
      const fooInstance = await injector.get('foo');

      expect(fooInstance.bar).to.deep.equal({
        baz: 'baz-value',
        abc: 'abc-value'
      });
      expect(fooInstance.baz).to.equal('baz-value');
    });


    it('should inject properties', async function() {

      const module = /** @type ModuleDeclaration */ ({
        'config': [ 'value', {
          a: 1,
          b: {
            c: 2
          }
        } ]
      });

      const injector = new AsyncInjector([ module ]);

      expect(await injector.get('config.a')).to.equal(1);
      expect(await injector.get('config.b.c')).to.equal(2);
    });


    it('should inject dotted service if present', async function() {

      const injector = new AsyncInjector([
        {
          'a.b': [ 'value', 'a.b value' ]
        }
      ]);

      expect(await injector.get('a.b')).to.equal('a.b value');
    });


    it('should provide "injector"', async function() {
      const injector = new AsyncInjector([]);

      expect(await injector.get('injector')).to.equal(injector);
    });


    it('should throw error with full path if no provider', async function() {

      // a requires b requires c (not provided)
      function aFn(b) {
        return 'a-value';
      }
      aFn.$inject = [ 'b' ];

      function bFn(c) {
        return 'b-value';
      }
      bFn.$inject = [ 'c' ];

      const injector = new AsyncInjector([
        {
          'a': [ 'factory', aFn ],
          'b': [ 'factory', bFn ]
        }
      ]);

      await expectThrows(function() {
        return injector.get('a');
      }, 'No provider for "c"! (Resolving: a -> b -> c)');
    });


    it('should return null if non-strict and no provider', async function() {
      const injector = new AsyncInjector([ ]);
      const notDefined = await injector.get('not-defined', false);

      return expect(notDefined).to.be.null;
    });


    it('should throw error if circular dependency', async function() {
      function aFn(b) {
        return 'a-value';
      }
      aFn.$inject = [ 'b' ];

      function bFn(a) {
        return 'b-value';
      }
      bFn.$inject = [ 'a' ];

      const module = /** @type ModuleDeclaration */ ({
        a: [ 'factory', aFn ],
        b: [ 'factory', bFn ]
      });

      const injector = new AsyncInjector([ module ]);

      await expectThrows(function() {
        return injector.get('a');
      }, 'Cannot resolve circular dependency! ' + '(Resolving: a -> b -> a)');
    });


    it('should instantiate asynchronously', async function() {

      class Store {
        constructor(config) {
          this.config = config;
        }

        async getConfig(key) {
          return this.config[key];
        }
      }

      class Service {
        constructor(key) {
          this.key = key;
        }
      }

      async function createService(store, injector) {

        const config = await store.getConfig('service');

        return new Service(config);
      }

      // when
      const injector = new AsyncInjector([
        {
          'store': [ 'type', Store ],
          'service': [ 'factory', createService ],
          'config': [ 'value', { 'service': 'FOO' } ]
        }
      ]);

      const service = await injector.get('service');

      // then
      expect(service.key).to.eql('FOO');
    });

  });


  describe('invoke', function() {

    it('should resolve dependencies', async function() {
      function bar(baz, abc) {
        return {
          baz: baz,
          abc: abc
        };
      }
      bar.$inject = [ 'baz', 'abc' ];

      const module = /** @type ModuleDeclaration */ ({
        'baz': [ 'value', 'baz-value' ],
        'abc': [ 'value', 'abc-value' ]
      });

      const injector = new AsyncInjector([ module ]);

      expect(await injector.invoke(bar)).to.deep.equal({
        baz: 'baz-value',
        abc: 'abc-value'
      });
    });


    it('should resolve dependencies (array notation)', async function() {
      function bar(baz, abc) {
        return {
          baz: baz,
          abc: abc
        };
      }

      const module = /** @type ModuleDeclaration */ ({
        'baz': [ 'value', 'baz-value' ],
        'abc': [ 'value', 'abc-value' ]
      });

      const injector = new AsyncInjector([ module ]);

      expect(await injector.invoke([ 'baz', 'abc', bar ])).to.deep.equal({
        baz: 'baz-value',
        abc: 'abc-value'
      });
    });


    it('should invoke function on given context', async function() {
      const context = {};
      const injector = new AsyncInjector([ ]);

      await injector.invoke((function() {

        // @ts-expect-error
        expect(this).to.equal(context);
      }), context);
    });


    it('should throw error if a non function given', async function() {
      const injector = new AsyncInjector([]);

      await expectThrows(function() {

        // @ts-expect-error
        return injector.invoke(123);
      }, 'Cannot invoke "123". Expected a function!');

      await expectThrows(function() {

        // @ts-expect-error
        return injector.invoke('abc');
      }, 'Cannot invoke "abc". Expected a function!');

      await expectThrows(function() {

        // @ts-expect-error
        return injector.invoke(null);
      }, 'Cannot invoke "null". Expected a function!');

      await expectThrows(function() {

        // @ts-expect-error
        return injector.invoke(void 0);
      }, 'Cannot invoke "undefined". ' + 'Expected a function!');

      await expectThrows(function() {

        // @ts-expect-error
        return injector.invoke({});
      }, 'Cannot invoke "[object Object]". ' + 'Expected a function!');
    });


    it('should auto parse arguments/comments if no $inject defined', async function() {
      function fn(/* baz */ a, abc) {
        return { baz: a, abc: abc };
      }

      async function asyncFn(/* baz */ a, abc) {
        return { baz: a, abc: abc };
      }

      const closure = (/* baz */ a, abc) => {
        return { baz: a, abc: abc };
      };

      const asyncClosure = async (/* baz */ a, abc) => {
        return { baz: a, abc: abc };
      };

      const module = /** @type ModuleDeclaration */ ({
        'baz': [ 'value', 'baz-value' ],
        'abc': [ 'value', 'abc-value' ]
      });

      const injector = new AsyncInjector([ module ]);

      expect(await injector.invoke(fn)).to.deep.equal({
        baz: 'baz-value',
        abc: 'abc-value'
      });

      expect(await injector.invoke(asyncFn)).to.deep.equal({
        baz: 'baz-value',
        abc: 'abc-value'
      });

      expect(await injector.invoke(closure)).to.deep.equal({
        baz: 'baz-value',
        abc: 'abc-value'
      });

      expect(await injector.invoke(asyncClosure)).to.deep.equal({
        baz: 'baz-value',
        abc: 'abc-value'
      });
    });


    it('should resolve with local overrides', async function() {
      class FooType {
        constructor() {
          throw new Error('foo broken');
        }
      }

      const module = {
        foo: [ 'type', FooType ]
      };

      const injector = new AsyncInjector([ module ]);

      await injector.invoke([ 'foo', 'bar', function(foo, bar) {
        expect(foo).to.eql('FOO');
        expect(bar).to.equal(undefined);
      } ], null, { foo: 'FOO', bar: undefined });
    });

  });


  describe('instantiate', function() {

    it('should resolve dependencies', async function() {
      class Foo {
        constructor(abc1, baz1) {
          this.abc = abc1;
          this.baz = baz1;
        }
      }
      Foo.$inject = [ 'abc', 'baz' ];

      const module = /** @type ModuleDeclaration */ ({
        'baz': [ 'value', 'baz-value' ],
        'abc': [ 'value', 'abc-value' ]
      });

      const injector = new AsyncInjector([ module ]);

      expect(await injector.instantiate(Foo)).to.deep.equal({
        abc: 'abc-value',
        baz: 'baz-value'
      });
    });

    it('should return returned value from constructor if an object returned', async function() {

      const injector = new AsyncInjector([ ]);
      const returnedObj = {};
      function ObjCls() {
        return returnedObj;
      }
      function StringCls() {
        return 'some string';
      }
      function NumberCls() {
        return 123;
      }

      expect(await injector.instantiate(ObjCls)).to.equal(returnedObj);
      expect(await injector.instantiate(StringCls)).to.be.an.instanceof(StringCls);
      expect(await injector.instantiate(NumberCls)).to.be.an.instanceof(NumberCls);
    });

  });


  describe('override', function() {

    it('should replace definition via override module', async function() {
      class Foo {
        constructor(bar1, baz1) {
          this.bar = bar1;
          this.baz = baz1;
        }
      }

      function createBlub(foo1) {
        return foo1;
      }

      const base = /** @type ModuleDeclaration */ ({
        'foo': [ 'type', [ 'bar', 'baz', Foo ] ],
        'blub': [ 'factory', [ 'foo', createBlub ] ],
        'baz': [ 'value', 'baz-value' ],
        'abc': [ 'value', 'abc-value' ]
      });

      const extension = /** @type ModuleDeclaration */ ({
        'foo': [ 'type', [ 'baz', 'abc', Foo ] ]
      });

      const injector = new AsyncInjector([ base, extension ]);
      const expectedFoo = {
        bar: 'baz-value',
        baz: 'abc-value'
      };

      expect(await injector.get('foo')).to.deep.equal(expectedFoo);
      expect(await injector.get('blub')).to.deep.equal(expectedFoo);
    });


    it('should mock element via value', async function() {
      function createBar() {
        return {
          a: 'realA'
        };
      }

      const base = /** @type ModuleDeclaration */ ({
        'bar': [ 'factory', createBar ]
      });

      const mocked = {
        a: 'A'
      };

      const mock = /** @type ModuleDeclaration */ ({
        'bar': [ 'value', mocked ]
      });

      const injector = new AsyncInjector([ base, mock ]);

      expect(await injector.get('bar')).to.equal(mocked);
    });

  });

});



// helpers /////////////////

async function expectThrows(asyncFn, message) {

  try {
    await asyncFn();

    expect.fail('expected error');
  } catch (err) {
    expect(/** @type { Error } */ (err).message).to.eql(message);
  }
}