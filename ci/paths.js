const path = require("path");

const R = (...p) => path.resolve(__dirname, "../", ...p);

module.exports = {
  dist: path.resolve(__dirname, "..", "publish"),
  R,
};
