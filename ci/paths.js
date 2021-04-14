const path = require("path");

const R = (...p) => path.resolve(__dirname, "../", ...p);

const src = path.resolve(__dirname, "../src");

module.exports = {
  src,
  dist: path.resolve(__dirname, "..", "publish"),
  eidBase: R(src, "eidqr"),
  demoBase: R(src, "signin"),
  R,
};
