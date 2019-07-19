import {
  isClass
} from './util';


// Current limitations:
// - can't put into "function arg" comments
// function /* (no parenthesis like this) */ (){}
// function abc( /* xx (no parenthesis like this) */ a, b) {}
//
// Just put the comment before function or inside:
// /* (((this is fine))) */ function(a, b) {}
// function abc(a) { /* (((this is fine))) */}
//
// - can't reliably auto-annotate constructor; we'll match the
// first constructor(...) pattern found which may be the one
// of a nested class, too.

var CONSTRUCTOR_ARGS = /constructor\s*[^(]*\(\s*([^)]*)\)/m;
var FN_ARGS = /^function\s*[^(]*\(\s*([^)]*)\)/m;
var FN_ARG = /\/\*([^*]*)\*\//m;

export function parse(fn) {

  if (typeof fn !== 'function') {
    throw new Error('Cannot annotate "' + fn + '". Expected a function!');
  }

  var match = fn.toString().match(isClass(fn) ? CONSTRUCTOR_ARGS : FN_ARGS);

  // may parse class without constructor
  if (!match) {
    return [];
  }

  return match[1] && match[1].split(',').map(function(arg) {
    match = arg.match(FN_ARG);
    return match ? match[1].trim() : arg.trim();
  }) || [];
}