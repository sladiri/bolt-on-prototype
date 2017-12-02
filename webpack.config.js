// @ts-check
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
// const HtmlWebpackInlineSVGPlugin = require("html-webpack-inline-svg-plugin");

const PATHS = (() => {
  const build = path.join(__dirname, "build");
  const assets = path.join(__dirname, "assets");
  const svgSprite = path.join(__dirname, "svg-sprite");
  const favicon = path.join(assets, "icons8-socks.png");
  const src = path.join(__dirname, "src");
  const polyfill = path.join(src, "polyfill");
  const app = path.join(src, "app");
  const elements = path.join(src, "elements");
  const boltOn = path.join(src, "bolt-on");
  const pouch = path.join(src, "pouch");
  const sam = path.join(src, "sam");

  return {
    build,
    assets,
    svgSprite,
    favicon,
    src,
    polyfill,
    app,
    elements,
    boltOn,
    pouch,
    sam
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
      app: PATHS.app,
      assets: PATHS.assets,
      svgSprite: PATHS.svgSprite,
      elements: PATHS.elements,
      boltOn: PATHS.boltOn,
      pouch: PATHS.pouch,
      sam: PATHS.sam
    }
  },
  module: {
    rules: [
      {
        test: /\.(jpg|png|svg)$/,
        include: PATHS.assets,
        loader: "url-loader"
      },
      {
        test: /\.svg$/,
        include: PATHS.svgSprite,
        use: [
          "svg-sprite-loader" // "svgo-loader" // Currently broken?
          // { loader: 'react-svg-loader', options: { jsx: true } },
        ]
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
              "transform-react-jsx",
              "syntax-dynamic-import"
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
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Browser Boiler",
      minify: { maxLineLength: 80 },
      template: "index-html-template.html"
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
    // new HtmlWebpackInlineSVGPlugin()
  ]
});

const productionConfig = () => {
  const webpack = require("webpack");
  const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
  const ExtractTextPlugin = require("extract-text-webpack-plugin");
  const Visualizer = require("webpack-visualizer-plugin");
  const CompressionPlugin = require("compression-webpack-plugin");

  const baseConfig = commonConfig({ modules: false });

  return Object.assign({}, baseConfig, {
    devtool: "source-map",
    module: {
      ...baseConfig.module,
      rules: [
        ...baseConfig.module.rules,
        {
          test: /\.css$/,
          include: PATHS.src,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
              {
                loader: "css-loader",
                options: { importLoaders: 1 }
              },
              {
                loader: "postcss-loader",
                options: {
                  plugins: () => [
                    require("postcss-import")({
                      path: ["src"]
                    }),
                    require("postcss-cssnext"),
                    require("cssnano")
                  ]
                }
              }
            ]
          })
        }
      ]
    },
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
      new ExtractTextPlugin({
        filename: "[name].css"
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: "vendor",
        minChunks: ({ resource }) => /node_modules/.test(resource)
      }),
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
  const baseConfig = commonConfig({ modules: "commonjs" });

  return Object.assign({}, baseConfig, {
    // devtool: "eval-source-map",
    devtool: "cheap-module-eval-source-map", // line-only,
    module: {
      ...baseConfig.module,
      rules: [
        ...baseConfig.module.rules,
        {
          test: /\.css$/,
          include: PATHS.src,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: { importLoaders: 1 }
            },
            {
              loader: "postcss-loader",
              options: {
                plugins: () => [
                  require("postcss-import")({
                    path: ["src"]
                  }),
                  require("postcss-cssnext")
                ]
              }
            }
          ]
        }
      ]
    },
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
