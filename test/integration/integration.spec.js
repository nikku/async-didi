var expect = require('chai').expect;


describe('integration', function() {

  describe('cjs bundle', function() {

    var annotate = require('async-didi').annotate;
    var AsyncInjector = require('async-didi').AsyncInjector;
    var Module = require('async-didi').Module;


    it('should expose API', function() {
      expect(annotate).to.exist;
      expect(AsyncInjector).to.exist;
      expect(Module).to.exist;
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

      var module = {
        foo: [
          'factory',
          async function() {
            return 'foo-value';
          }
        ],
        bar: ['value', 'bar-value'],
        baz: ['type', BazType],
        bub: ['type', BubType]
      };
      var injector = new AsyncInjector([module]);

      expect(await injector.get('foo')).to.equal('foo-value');
      expect(await injector.get('bar')).to.equal('bar-value');

      var bub = await injector.get('bub');
      expect(bub).to.be.an.instanceof(BubType);
      expect(bub.name).to.eql('bub');

      var baz = await injector.get('baz');
      expect(baz).to.be.an.instanceof(BazType);
      expect(baz.name).to.eql('baz');
    });

  });


  describe('umd bundle', function() {

    var didi = require('../../dist/async-didi.umd.prod.js');

    it('should expose API', function() {
      expect(didi.annotate).to.exist;
      expect(didi.AsyncInjector).to.exist;
      expect(didi.Module).to.exist;
    });

  });

});
