const { paths, commonConfig } = require("./webpack.common.config");

module.exports = commonConfig({
  publicPath: "/",
  paths: paths({ outputPath: "public" }),
});
