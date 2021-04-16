/** */

module.exports = function (api, options, dirname) {
  api.cache(true);
  console.log(options, dirname);
  const presets = [
    [
      "@babel/env",
      {
        targets: {
          edge: "17",
          firefox: "60",
          chrome: "67",
          safari: "11.1",
        },
        useBuiltIns: "usage",
        corejs: "3.10.1",
      },
    ],
  ];
  const plugins = ["@babel/transform-arrow-functions"];

  return {
    presets,
    plugins,
  };
};
