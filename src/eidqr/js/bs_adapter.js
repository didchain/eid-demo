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
