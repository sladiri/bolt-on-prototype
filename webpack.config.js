// @ts-check
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
// const HtmlWebpackInlineSVGPlugin = require("html-webpack-inline-svg-plugin");

const PATHS = (() => {
  const assets = path.join(__dirname, "assets");
  const src = path.join(__dirname, "src");
  const app = path.join(src, "app");
  return {
    assets,
    favicon: path.join(assets, "icons8-socks.png"),
    build: path.join(__dirname, "build"),
    polyfill: path.join(app, "polyfill"),
    src,
    app
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
  resolve: {
    alias: {
      assets: PATHS.assets
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Bolt-on Prototype",
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
          "svg-sprite-loader"
          // "svgo-loader" // Currently broken?
          // { loader: 'file-loader' },
          // { loader: 'react-svg-loader', options: { jsx: true } },
        ],
        include: PATHS.assets
      },
      {
        test: /\.js$/,
        include: PATHS.src,
        use: {
          loader: "babel-loader",
          options: {
            // cacheDirectory: true,
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
                    browsers: ["last 3 versions"]
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

const developmentConfig = ({ host = "localhost", port = "3000" }) => {
  const fs = require("fs");

  return Object.assign({}, commonConfig({ modules: "commonjs" }), {
    // devtool: "eval-source-map",
    devtool: "cheap-module-eval-source-map", // line-only
    devServer: {
      historyApiFallback: true,
      stats: "errors-only",
      host,
      port,
      https: {
        key: fs.readFileSync(
          "/mnt/c/Users/sladan.ristic/.ssl/server/privkey.pem"
        ),
        cert: fs.readFileSync("/mnt/c/Users/sladan.ristic/.ssl/server/cert.pem")
      }
    }
  });
};

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
