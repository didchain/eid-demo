const { eidBase } = require("./paths");

const { createProxyMiddleware } = require("http-proxy-middleware");

const apiProxy = createProxyMiddleware("/api", {
  target: "http://39.99.198.143:60998", //"http://eid.baschain.cn", //http://39.99.198.143:60998
  changeOrigin: true, // for vhosted sites
});

module.exports = {
  port: 28964,
  browser: ["chrome"],
  files: ["./src/**/*.{html,css,js}"],
  server: {
    baseDir: eidBase,
    middleware: {
      10: apiProxy,
    },
  },
  open: false,
};
