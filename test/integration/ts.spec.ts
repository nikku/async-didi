import { AsyncInjector } from 'async-didi';

import { expect } from 'chai';


describe('typed', function() {

  class BubType {
    bar: string;

    constructor(bar: string) {
      this.bar = bar;
    }
  }

  class BazType {
    name: string;

    constructor() {
      this.name = 'baz';
    }
  }


  describe('AsyncInjector', function() {

    it('should instantiate', function() {

      // when
      const injector = new AsyncInjector([
        {
          foo: [
            'factory',
            function() {
              return 'foo-value';
            }
          ],
          bar: [ 'value', 'bar' ],
          baz: [ 'type', BazType ],
          bub: [ 'type', BubType ]
        }
      ]);

      // then
      expect(injector).to.exist;
    });


    it('should ignore extension', function() {

      // given
      const injector = new AsyncInjector([
        {
          __wooop__: [ 'bub' ]
        }
      ]);

      // then
      expect(injector).to.exist;
    });


    it('should offer typed injections', async function() {

      // given
      type ServiceMap = {
        'foo': 1,
        'bar': 'BAR'
      };

      // when
      const injector = new AsyncInjector<ServiceMap>([
        {
          foo: [ 'value', 1 ],
          bar: [ 'value', 'BAR' ]
        }
      ]);

      // then
      const foo = await injector.get('foo');
      expect(foo).to.eql(1);

      const bar = await injector.get('bar');
      expect(bar).to.eql('BAR');

      const baz = await injector.get('baz', false);
      expect(baz).not.to.exist;

      // illegal usage, but if you think you know better
      // we still accept it
      const boolBar = await injector.get<boolean>('bar');
      expect(boolBar).to.exist;

      // @ts-expect-error illegal type conversion
      const invalidFoo : string = await injector.get('foo');
    });

  });


  describe('#get', function() {

    it('should get', async function() {

      // given
      const injector = new AsyncInjector([
        {
          foo: [
            'factory',
            function() {
              return 'foo-value';
            }
          ],
          bar: [ 'value', 'bar-value' ],
          foop: [
            'factory',
            function(bar: string) {
              return bar;
            }
          ],
          baz: [ 'type', BazType ],
          bub: [ 'type', BubType ]
        }
      ]);

      // when
      const foo = await injector.get('foo') as string;
      const _bar = await injector.get('bar') as string;
      const foop = await injector.get('foop') as string;
      const bub = await injector.get<BubType>('bub');
      const baz = await injector.get('baz') as BazType;

      const typedFoo : string = await injector.get('foo');
      const maybeBar = await injector.get<string>('bar', false);

      // then
      expect(foo).to.eql('foo-value');
      expect(_bar).to.eql('bar-value');
      expect(foop).to.eql('bar-value');

      expect(maybeBar!.charAt(0)).to.eql('b');
      expect(typedFoo).to.eql('foo-value');

      expect(bub).to.be.an.instanceof(BubType);
      expect(bub.bar).to.eql('bar-value');

      expect(baz).to.be.an.instanceof(BazType);
      expect(baz.name).to.eql('baz');
    });


    it('should get dynamic', async function() {

      // given
      const injector = new AsyncInjector([]);

      // when
      const get = (service: string, strict: boolean) => {
        return injector.get(service, strict);
      };

      // then
      expect(await get('bar', false)).not.to.exist;
    });

  });


  describe('#invoke', function() {

    it('should invoke', async function() {

      // given
      const injector = new AsyncInjector([
        {
          one: [ 'value', 1 ],
          two: [ 'value', 2 ]
        }
      ]);

      type Four = {
        four: number;
      };

      type Five = {
        five: number;
      };

      // when
      // then
      expect(await injector.invoke((one, two) => {
        return one + two;
      })).to.eql(3);

      expect(await injector.invoke((one, two, three) => {
        return one + two + three;
      }, null, { three: 3 })).to.eql(6);

      expect(await injector.invoke(function(this: Four, one, two, three) {
        return one + two + three + this.four;
      }, { four: 4 }, { three: 3 })).to.eql(10);

      const result = await injector.invoke(function() : Five {

        const five : Five = {
          five: 5
        };

        return five;
      });

      expect(result.five).to.eql(5);

      expect(await injector.invoke(() => {})).not.to.exist;

    });

  });


  describe('#instantiate', function() {

    it('should instantiate Class', async function() {

      // given
      const injector = new AsyncInjector([
        {
          one: [ 'value', 1 ],
          two: [ 'value', 2 ]
        }
      ]);

      class Foo {
        one: number;

        constructor(one: number) {
          this.one = one;
        }
      }

      // when
      const fooInstance = await injector.instantiate(Foo);

      // then
      expect(fooInstance.one).to.eql(1);
    });

  });

});