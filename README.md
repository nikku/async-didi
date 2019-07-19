# `async-didi`

[![Build Status](https://travis-ci.com/nikku/async-didi.png?branch=master)](https://travis-ci.com/nikku/async-didi)

An async version of [`didi`](didi), the dependency injection library for JavaScript.


## Example

```js
function Car(engine) {
  this.start = function() {
    engine.start();
  };
}

const createEngine = async function(power) {
  return {
    start: function() {
      console.log('Starting engine with ' + power + 'hp');
    }
  };
};

const {
  AsyncInjector
} = require('async-didi');

var injector = new AsyncInjector([
  {
    'car': ['type', Car],
    'engine': ['factory', createEngine],
    'power': ['value', 1184]
  }
]);

await injector.invoke(function(car) {
  car.start();
});
```

For more examples, check out [the tests](https://github.com/nikku/async-didi/blob/master/test/async-injector.spec.js).


## Comparison to [`didi`][didi]

* Same core features
* Exposes an `AsyncInjector`
* Injector API functions `get`, `invoke` and `instantiate` are async
* Factory functions may be async
* No support for child injectors and scopes


## License

MIT


[didi]: https://github.com/nikku/didi
