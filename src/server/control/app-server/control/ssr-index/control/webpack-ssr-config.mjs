import config from "../../../../../../../webpack.common.config.js";

export const DebugConfig = ({ commonConfig, paths }) => ({
    publicPath,
    outputPath,
}) => {
    return commonConfig({
        debug: true,
        publicPath,
        paths: paths({ outputPath }),
    });
};

export const debugConfig = DebugConfig({
    commonConfig: config.config,
    paths: config.paths,
});
