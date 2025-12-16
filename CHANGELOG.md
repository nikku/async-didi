# Changelog

All notable changes to [async-didi](https://github.com/nikku/async-didi) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 1.0.0

_Incorporate changes from `didi@11`._

* `FEAT`: turn into ES module ([#2](https://github.com/nikku/async-didi/pull/2))
* `FEAT`: add type declarations ([#5](https://github.com/nikku/async-didi/pull/5))
* `FEAT`: add initializers and dependent modules ([nikku/didi#13](https://github.com/nikku/didi/pull/13), [#6](https://github.com/nikku/async-didi/pull/6))
* `CHORE`: remove `Module` from public API ([nikku/didi#13](https://github.com/nikku/didi/pull/13), [#3](https://github.com/nikku/async-didi/pull/3))
* `CHORE`: drop UMD distribution ([#2](https://github.com/nikku/async-didi/pull/2))
* `CHORE`: drop CJS distribution ([#2](https://github.com/nikku/async-didi/pull/2))
* `DEPS`: update to `didi@11` ([#4](https://github.com/nikku/async-didi/pull/4))

### Breaking Changes

* Require `Node >= 20.12` for use in CommonJS modules
* Removed `Module` export. Use documented `ModuleDeclaration` to define a didi module

## 0.3.1

* `FIX`: export CommonJS with `js` extension (again)

## 0.3.0

* `CHORE`: add `exports` package JSON field
* `CHORE`: require `Node >= 14`

## 0.2.1

* `FIX`: correctly parse annotations in async closures

## 0.2.0

* `CHORE`: reuse `didi` internals
* `DOCS`: misc improvements
* `FIX`: correct annotations on async functions not being parsed

## 0.1.1

* `DOCS`: clarified `didi` relation

## 0.1.0

_Initial version._