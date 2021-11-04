export function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

export function hasOwnProp(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}