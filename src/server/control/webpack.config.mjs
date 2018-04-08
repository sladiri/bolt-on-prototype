import path from "path";

export const config = ({ publicPath }) => {
  return commonConfig({
    debug: true,
    publicPath,
    paths: paths({ publicPath }),
  });
};

const paths = ({ publicPath }) => {
  const webroot = path.join(process.cwd(), publicPath);
  const src = path.join(process.cwd(), "src");
  const client = path.join(src, "client");

  return {
    webroot,
    src,
    client,
  };
};

const commonConfig = ({ debug = false, paths, publicPath }) => {
  // const HtmlWebpackPlugin = require("html-webpack-plugin");
  // const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
  return {
    mode: debug ? "development" : "production",
    entry: [paths.client],
    output: {
      pathinfo: debug,
      path: paths.webroot,
      filename: "index.mjs",
      publicPath,
    },
    module: {
      rules: [
        {
          test: /\.js$|\.jsm$/,
          include: paths.src,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              plugins: [
                "@babel/plugin-syntax-dynamic-import",
                // "@babel/plugin-proposal-async-generator-functions",
                "@babel/plugin-proposal-function-bind",
                "@babel/plugin-proposal-object-rest-spread",
              ],
              presets: [
                [
                  "@babel/preset-env",
                  {
                    debug: true,
                    spec: true,
                    modules: false, // Do not transpile modules
                    useBuiltIns: "usage",
                    targets: {
                      browsers: [
                        "edge >= 16",
                        "firefox >= 58",
                        "chrome >= 63",
                        "safari >= 11",
                        "ios_saf >= 10.3",
                        "and_chr >= 64",
                        "and_uc >= 11.8",
                        "samsung >= 6.2",
                      ],
                    },
                  },
                ],
              ],
            },
          },
        },
      ],
    },
    plugins: [
      // new HtmlWebpackPlugin({
      //   title: "Bolt-on Prototype",
      //   minify: { maxLineLength: 80 },
      //   template: "index-html-template.html",
      // }),
      // new FaviconsWebpackPlugin({ // Webpack 4 incompatible https://github.com/jantimon/favicons-webpack-plugin/issues/108
      //   logo: PATHS.favicon,
      //   icons: {
      //     android: false,
      //     appleIcon: false,
      //     appleStartup: false,
      //     favicons: true,
      //     firefox: false,
      //   },
      // }),
    ],
  };
};
