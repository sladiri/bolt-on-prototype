const path = require("path");
const Html = require("html-webpack-plugin");
const Favicons = require("favicons-webpack-plugin");
// https://hackernoon.com/a-tale-of-webpack-4-and-how-to-finally-configure-it-in-the-right-way-4e94c8e7e5c1
const MiniCssExtract = require("mini-css-extract-plugin");
const postcssCssnext = require("postcss-cssnext");
const Visualiser = require("webpack-visualizer-plugin");

const paths = ({ outputPath }) => {
  const base = process.cwd();
  const webroot = path.join(base, outputPath);
  const favicon = path.join(base, "icons8-socks.png");
  const src = path.join(base, "src");
  const app = path.join(src, "app");
  const viperSsr = path.join(src, "server", "control", "viper-ssr.js");

  return {
    webroot,
    favicon,
    src,
    app,
    viperSsr,
  };
};

const commonConfig = ({ debug = false, paths, publicPath }) => {
  return {
    mode: debug ? "development" : "production",
    entry: { index: [paths.app] },
    output: {
      pathinfo: debug,
      path: paths.webroot,
      filename: "[name].[hash].mjs",
      publicPath,
    },
    optimization: debug ? undefined : { splitChunks: { chunks: "initial" } },
    module: {
      rules: [
        {
          test: /\.js$|\.jsm$/,
          include: paths.src,
          use: {
            loader: "babel-loader",
            options: {
              cacheDirectory: debug,
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
                    modules: false,
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
        {
          test: /\.pcss$/,
          use: [
            // MiniCssExtractPlugin has no HMR support https://github.com/webpack-contrib/mini-css-extract-plugin/issues/34
            // debug
            //   ? { loader: "style-loader", options: { sourceMap: true } }
            //   : MiniCssExtractPlugin.loader,
            // But we cannot use it in HTTPS (Firefox), so we use it anyway
            MiniCssExtract.loader,
            { loader: "css-loader", options: { sourceMap: debug } },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: debug ? "inline" : false, // true does not seem to work, with dev-server at least, need to try production
                plugins: [postcssCssnext],
              },
            },
          ],
        },
        { test: /\.ejs$/, use: [paths.viperSsr] }, // ViperHTML uses UglifyJS, which causes bundling error, remove usage in C:\Users\sladj\repos\bolt-on-prototype\node_modules\viperhtml\index.js https://github.com/tmaslen/colly/issues/3
      ],
    },
    plugins: [
      new Favicons({
        logo: paths.favicon,
        icons: {
          android: false,
          appleIcon: false,
          appleStartup: false,
          favicons: true,
          firefox: false,
        },
      }),
      new MiniCssExtract({ filename: "index.[contenthash].css" }),
      new Html({
        // Template is generated from SSR via ViperHtml (ejs-loader)
        templateParameters: {
          title: "Bolt-on Prototype",
        },
        meta: {
          viewport: "width=device-width", // https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
        },
        minify: {
          maxLineLength: 80,
        },
      }),
      new Visualiser({ filename: "statistics.html" }),
    ],
  };
};

module.exports = {
  paths,
  commonConfig,
};
