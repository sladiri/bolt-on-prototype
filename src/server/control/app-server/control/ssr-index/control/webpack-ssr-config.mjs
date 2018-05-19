import config from "../../../../../../../webpack.common.config.js";

export const debugConfig = ({ commonConfig, paths }) => ({
    publicPath,
    outputPath,
}) => {
    return commonConfig({
        debug: true,
        publicPath,
        paths: paths({ outputPath }),
    });
};

export const webpackConfig = debugConfig({
    commonConfig: config.config,
    paths: config.paths,
});
