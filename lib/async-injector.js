import {
  annotate,
  parseAnnotations
} from 'didi';

import {
  isArray,
  hasOwnProp
} from './util.js';

/**
 * @typedef { import('./index.js').ModuleDeclaration } ModuleDeclaration
 * @typedef { import('./index.js').ModuleDefinition } ModuleDefinition
 *
 * @typedef { import('./index.js').TypedDeclaration<any, any> } TypedDeclaration
 */


/**
 * Create a new injector with the given modules.
 *
 * @param {ModuleDefinition[]} modules
 */
export default function AsyncInjector(modules) {

  const parent = {
    get: function(name, strict) {
      currentlyResolving.push(name);

      if (strict === false) {
        return null;
      } else {
        throw error(`No provider for "${ name }"!`);
      }
    }
  };

  const currentlyResolving = [];
  const providers = this._providers = Object.create(parent._providers || null);
  const instances = this._instances = Object.create(null);
  const loadingInstances = this._loadingInstances = Object.create(null);

  instances.injector = this;

  const error = function(msg) {
    const stack = currentlyResolving.join(' -> ');
    currentlyResolving.length = 0;
    return new Error(stack ? `${ msg } (Resolving: ${ stack })` : msg);
  };

  /**
   * Return a named service.
   *
   * @param {string} name
   * @param {boolean} [strict=true] if false, resolve missing services to null
   *
   * @return {Promise<Object>}
   */
  async function get(name, strict) {
    if (!providers[name] && name.indexOf('.') !== -1) {
      const parts = name.split('.');
      let pivot = await get(/** @type { string } */ (parts.shift()));

      while (parts.length) {
        pivot = pivot[/** @type { string } */ (parts.shift())];
      }

      return pivot;
    }

    if (hasOwnProp(instances, name)) {
      return instances[name];
    }

    if (hasOwnProp(loadingInstances, name)) {
      return loadingInstances[name];
    }

    if (hasOwnProp(providers, name)) {
      if (currentlyResolving.indexOf(name) !== -1) {
        currentlyResolving.push(name);
        throw error('Cannot resolve circular dependency!');
      }

      currentlyResolving.push(name);
      loadingInstances[name] = providers[name][0](providers[name][1]);
      instances[name] = await loadingInstances[name];

      currentlyResolving.pop();

      return instances[name];
    }

    return parent.get(name, strict);
  }

  async function fnDef(fn, locals) {

    if (typeof locals === 'undefined') {
      locals = {};
    }

    if (typeof fn !== 'function') {
      if (isArray(fn)) {
        fn = annotate(fn.slice());
      } else {
        throw error(`Cannot invoke "${ fn }". Expected a function!`);
      }
    }

    /**
     * @type {string[]}
     */
    const inject = fn.$inject || parseAnnotations(fn);
    const dependencies = await Promise.all(
      inject.map(function(dep) {
        if (hasOwnProp(locals, dep)) {
          return locals[dep];
        } else {
          return get(dep);
        }
      })
    );

    return {
      fn,
      dependencies
    };
  }

  /**
   * Instantiate the given type, injecting dependencies.
   *
   * @template T
   *
   * @param { Function | [...string[], Function ]} type
   *
   * @return Promise<T>
   */
  async function instantiate(type) {
    const {
      fn,
      dependencies
    } = await fnDef(type);

    // instantiate var args constructor
    const Constructor = Function.prototype.bind.call(fn, null, ...dependencies);

    return new Constructor();
  }

  /**
   * Invoke the given function, injecting dependencies. Return the result.
   *
   * @template T
   *
   * @param { Function | [...string[], Function ]} func
   * @param { Object } [context]
   * @param { Object } [locals]
   *
   * @return {Promise<T>} invocation result
   */
  async function invoke(func, context, locals) {
    const {
      fn,
      dependencies
    } = await fnDef(func, locals);

    return fn.apply(context, dependencies);
  }

  const factoryMap = {
    factory: invoke,
    type: instantiate,
    value: function(value) {
      return value;
    }
  };

  modules.forEach(function(moduleDefinition) {

    function arrayUnwrap(type, value) {
      if (type !== 'value' && isArray(value)) {
        value = annotate(value.slice());
      }

      return value;
    }

    if (typeof moduleDefinition === 'object') {
      if (moduleDefinition.__exports__) {
        throw new Error('private modules are not supported');
      } else {

        Object.keys(moduleDefinition).forEach(key => {

          const typeDeclaration = /** @type { TypedDeclaration } */ (
            moduleDefinition[key]
          );

          const type = typeDeclaration[0];
          const value = typeDeclaration[1];

          providers[key] = [ factoryMap[type], arrayUnwrap(type, value), type ];
        });
      }
    }
  });

  // public API
  this.get = get;
  this.invoke = invoke;
  this.instantiate = instantiate;
}