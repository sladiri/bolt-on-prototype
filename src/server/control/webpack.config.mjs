import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import FaviconsWebpackPlugin from "favicons-webpack-plugin";

export const config = ({ publicPath }) => {
  return commonConfig({
    debug: true,
    publicPath,
    paths: paths({ publicPath }),
  });
};

const paths = ({ publicPath }) => {
  const webroot = path.join(process.cwd(), publicPath);
  const favicon = path.join(process.cwd(), "icons8-socks.png");
  const src = path.join(process.cwd(), "src");
  const app = path.join(src, "app");

  return {
    webroot,
    favicon,
    src,
    app,
  };
};

const commonConfig = ({ debug = false, paths, publicPath }) => {
  return {
    mode: debug ? "development" : "production",
    entry: [paths.app],
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
      new HtmlWebpackPlugin({
        templateParameters: {
          production: !debug,
          title: "Bolt-on Prototype",
        },
        meta: {
          viewport: "width=device-width", // https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images
        },
        minify: { maxLineLength: 80 },
        template: "./index-html-template.ejs",
      }),
      new FaviconsWebpackPlugin({
        logo: paths.favicon,
        icons: {
          android: false,
          appleIcon: false,
          appleStartup: false,
          favicons: true,
          firefox: false,
        },
      }),
    ],
  };
};
