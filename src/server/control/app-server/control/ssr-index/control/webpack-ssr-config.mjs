import config from "../../../../../../../webpack.common.config.js";

export const debugConfig = ({ publicPath, outputPath }) => {
    return config.config({
        debug: true,
        publicPath,
        paths: config.paths({ outputPath }),
    });
};
