# `async-didi`

[![Build Status](https://github.com/nikku/async-didi/workflows/CI/badge.svg)](https://github.com/nikku/async-didi/actions?query=workflow%3ACI)

An async version of [`didi`](didi), the tiny dependency injection container for JavaScript.


## Example

```js
import {
  AsyncInjector
} from 'async-didi';

function Car(engine) {
  this.start = function() {
    return engine.start();
  };
}

async function createEngine(power) {
  return {
    async start() {
      console.log('Starting engine with ' + power + 'hp');
    }
  };
}

const injector = new AsyncInjector([
  {
    'car': ['type', Car],
    'engine': ['factory', createEngine],
    'power': ['value', 1184]
  }
]);

await injector.invoke(async function(car) {
  await car.start();
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
