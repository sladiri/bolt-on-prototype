// @ts-check
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
// const HtmlWebpackInlineSVGPlugin = require("html-webpack-inline-svg-plugin");

const PATHS = (() => {
  const src = path.join(__dirname, "src");
  const app = path.join(src, "app");
  return {
    polyfill: path.join(app, "polyfill"),
    src,
    app,
    favicon: path.join(src, "icons8-socks.png"),
    svg: path.join(src, "svg"),
    build: path.join(__dirname, "build")
  };
})();

const commonConfig = ({ modules, debug = false }) => ({
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
        include: PATHS.src,
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
                  debug,
                  useBuiltIns: true,
                  modules,
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
});

const productionConfig = () => {
  const webpack = require("webpack");
  const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
  const Visualizer = require("webpack-visualizer-plugin");
  const CompressionPlugin = require("compression-webpack-plugin");

  const baseConfig = commonConfig({ modules: false });

  return Object.assign({}, baseConfig, {
    devtool: "source-map",
    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production")
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new UglifyJSPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            drop_debugger: false
          }
        }
      }),
      ...baseConfig.plugins,
      new CompressionPlugin({
        asset: "[path].gz[query]",
        algorithm: "gzip",
        test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
        threshold: 10240,
        minRatio: 0.8
      }),
      new Visualizer({
        filename: "./statistics.html"
      })
    ]
  });
};

const developmentConfig = ({ host = "localhost", port = "3000" }) =>
  Object.assign({}, commonConfig({ modules: "commonjs" }), {
    // devtool: "eval-source-map",
    devtool: "cheap-module-eval-source-map", // line-only
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
