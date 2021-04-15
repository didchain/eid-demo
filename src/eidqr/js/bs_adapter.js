/**
 * Object.assign() polyfill for IE11
 * @see <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign>
 */
if (typeof Object.assign != "function") {
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      "use strict";
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      var to = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true,
  });
}

/**
 * IE
 */
var navMatches = navigator.userAgent
  .toLocaleLowerCase()
  .match(/rv:([\d.]+)\) like gecko/);

if (navMatches) {
  var ieVer = navMatches[1];
  var head = document.head || document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.setAttribute("src", "js/ie-polyfill.min.js");
  head.appendChild(script);
}
