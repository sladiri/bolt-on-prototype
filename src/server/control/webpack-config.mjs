import webpackConfig from "../../../webpack.common.config.js";

export const config = ({ publicPath }) => {
  return webpackConfig.commonConfig({
    debug: true,
    publicPath,
    paths: webpackConfig.paths({ publicPath }),
  });
};
