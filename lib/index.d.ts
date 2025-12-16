import {
  ValueType,
  FactoryType,
  TypeType,
  InjectAnnotated,
  Constructor
} from 'didi';

export {
  ValueType,
  FactoryType,
  TypeType,
  InjectAnnotated,
  Constructor
};

export type Annotated = InjectAnnotated;

export type FactoryFunction<T> = {
  (...args: any[]): T | Promise<T>;
} & Annotated;

export type ArrayArgs<T> = [ ...string[], T ];

export type ArrayFunc<T> = [ ...string[], FactoryFunction<T> ];

export type ArrayConstructor<T> = [ ...string[], Constructor<T> ];

export type FactoryDefinition<T> = FactoryFunction<T> | ArrayArgs<FactoryFunction<T>>;

export type TypeDefinition<T> = Constructor<T> | ArrayArgs<Constructor<T>>;

export type ValueDefinition<T> = T;

export type ServiceDefinition<T> = FactoryDefinition<T> | TypeDefinition<T> | ValueDefinition<T>;

export type TypedDeclaration<T, D> = [ T, D ];

export type ServiceDeclaration<T> =
  TypedDeclaration<ValueType, ValueDefinition<T>> |
  TypedDeclaration<TypeType, TypeDefinition<T>> |
  TypedDeclaration<FactoryType, FactoryDefinition<T>>;

export type ModuleDeclaration = {
  [name: string]: ServiceDeclaration<unknown> | unknown;
};

// async-injector.js

export type InjectionContext = unknown;
export type LocalsMap = {
  [name: string]: unknown
};

export type ModuleDefinition = ModuleDeclaration;


export class AsyncInjector<
  ServiceMap = null
> {

  /**
   * Create an injector from a set of modules.
   */
  constructor(modules: ModuleDefinition[]);

  /**
   * Return a named service, looked up from the existing service map.
   */
  get<Name extends keyof ServiceMap>(name: Name): Promise<ServiceMap[Name]>;

  /**
   * Return a named service, and throws if it is not found.
   */
  get<T>(name: string): Promise<T>;

  /**
   * Return a named service.
   */
  get<T>(name: string, strict: true): Promise<T>;

  /**
   * Return a named service or `null`.
   */
  get<T>(name: string, strict: boolean): Promise<T | null>;

  /**
   * Invoke the given function, injecting dependencies. Return the result.
   *
   * @example
   *
   * ```javascript
   * await injector.invoke(async function(car) {
   *   console.log(car.started);
   * });
   * ```
   */
  invoke<T>(func: FactoryFunction<T>, context?: InjectionContext, locals?: LocalsMap): Promise<T>;

  /**
   * Invoke the given function, injecting dependencies provided in
   * array notation. Return the result.
   *
   * @example
   *
   * ```javascript
   * await injector.invoke([ 'car', async function(car) {
   *   console.log(car.started);
   * } ]);
   * ```
   */
  invoke<T>(func: ArrayFunc<T>, context?: InjectionContext, locals?: LocalsMap): Promise<T>;

  /**
   * Instantiate the given type, injecting dependencies.
   *
   * @example
   *
   * ```javascript
   * const car = await injector.instantiate(Car);
   * ```
   */
  instantiate<T>(constructor: Constructor<T>): Promise<T>;

  /**
   * Instantiate the given type, injecting dependencies provided in array notation.
   *
   * @example
   *
   * ```javascript
   * const car = await injector.instantiate([ 'hifi', Car ]);
   * ```
   */
  instantiate<T>(constructor: ArrayConstructor<T>): Promise<T>;

  /**
   * @internal
   */
  _providers: object;
}

// helpers.js

export {
  annotate,
  parseAnnotations
} from 'didi';