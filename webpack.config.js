// @ts-check
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
// const HtmlWebpackInlineSVGPlugin = require("html-webpack-inline-svg-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const Visualizer = require("webpack-visualizer-plugin");

const PATHS = (() => {
  const src = path.join(__dirname, "src");
  const app = path.join(src, "app");
  return {
    src,
    app,
    favicon: path.join(src, "icons8-socks.png"),
    svg: path.join(src, "svg"),
    build: path.join(__dirname, "build"),
    polyfill: path.join(app, "polyfill")
  };
})();

const commonConfig = {
  // Entries have to resolve to files! They rely on Node
  // convention by default so if a directory contains *index.js*,
  // it resolves to that.
  entry: {
    app: [PATHS.polyfill, PATHS.app]
  },
  output: {
    path: PATHS.build,
    filename: "[name]-build.js"
    // pathinfo: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Browser Boiler",
      minify: { maxLineLength: 80 }
    }),
    new FaviconsWebpackPlugin({
      logo: PATHS.favicon,
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        favicons: true,
        firefox: false
      }
    })
    // new HtmlWebpackInlineSVGPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [
          "svg-sprite-loader",
          "svgo-loader"
          // { loader: 'file-loader' },
          // { loader: 'react-svg-loader', options: { jsx: true } },
        ],
        include: PATHS.svg
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            plugins: [
              "transform-object-rest-spread",
              "transform-async-generator-functions",
              "transform-do-expressions",
              "transform-function-bind",
              "transform-react-jsx"
            ],
            presets: [
              [
                "env",
                {
                  // debug: true,
                  useBuiltIns: true,
                  // modules: false, // for webpack2?, for concat plugin?
                  targets: {
                    browsers: ["last 2 versions"]
                  }
                }
              ]
            ]
          }
        }
      }
    ]
  }
};

const productionConfig = () =>
  Object.assign({}, commonConfig, {
    /*
             * 'source-map':
             * FF: does not stop at breakpoints.
             * Chrome and Edge: variables not visible at breakpoints.
             * 'eval-source-map' "works".
             */
    devtool: "source-map",
    plugins: [
      new UglifyJSPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            drop_debugger: false
          }
        }
      }),
      ...commonConfig.plugins,
      new Visualizer({
        filename: "./statistics.html"
      })
    ]
  });

const developmentConfig = ({ host = "localhost", port = "3000" }) =>
  Object.assign({}, commonConfig, {
    devtool: "eval-source-map",
    devServer: {
      historyApiFallback: true,
      stats: "errors-only",
      host,
      port
    }
  });

module.exports = env => {
  console.log("build-env is:", env);

  if (env && env.target === "production") {
    return productionConfig();
  }

  return developmentConfig({
    host: process.env.HOST,
    port: process.env.PORT
  });
};
