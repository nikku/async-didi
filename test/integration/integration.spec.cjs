const { expect } = require('chai');


describe('integration', function() {

  describe('node bundle', function() {

    const {
      annotate,
      AsyncInjector
    } = require('async-didi');


    it('should expose API', function() {
      expect(annotate).to.exist;
      expect(AsyncInjector).to.exist;
    });


    it('should work bundled', async function() {

      class BubType {
        constructor() {
          this.name = 'bub';
        }
      }

      function BazType() {
        this.name = 'baz';
      }

      const injector = new AsyncInjector([
        {
          foo: [
            'factory',
            function() {
              return 'foo-value';
            }
          ],
          bar: [ 'value', 'bar-value' ],
          baz: [ 'type', BazType ],
          bub: [ 'type', BubType ]
        }
      ]);

      expect(await injector.get('foo')).to.equal('foo-value');
      expect(await injector.get('bar')).to.equal('bar-value');

      const bub = await injector.get('bub');
      expect(bub).to.be.an.instanceof(BubType);
      expect(bub.name).to.eql('bub');

      const baz = await injector.get('baz');
      expect(baz).to.be.an.instanceof(BazType);
      expect(baz.name).to.eql('baz');
    });

  });


  describe('esm bundle', function() {

    it('should expose API', async function() {

      // when
      const {
        annotate,
        AsyncInjector
      } = await import('async-didi');

      // then
      expect(annotate).to.exist;
      expect(AsyncInjector).to.exist;
    });

  });

});
