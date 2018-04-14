const { paths, commonConfig } = require("./webpack.common.config");

module.exports = commonConfig({
  publicPath: "/public",
  paths: paths({ publicPath: "/public" }),
});
