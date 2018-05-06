import webpack from "koa-webpack";
// @ts-ignore
import { webpackConfig } from "./webpack-ssr-config";
// @ts-ignore
import { isIndexPath } from "./is-index-path";
// @ts-ignore
import { appString } from "./app-string";

export const index = ({ webpackConfig, isIndexPath, appString }) => () => {
  const webpackMiddleWare = webpack({
    config: webpackConfig({ publicPath: "/", outputPath: "/" }),
    hot: false, // Firefox does not allow insecure operation, requires allowinsecurefromhttps=true + fails
  });
  return async (ctx, next) => {
    await webpackMiddleWare(ctx, next);
    if (isIndexPath({ path: ctx.path })) {
      const html = await appString({
        body: ctx.body.toString(),
        query: ctx.query,
      });
      ctx.body = html;
    }
  };
};

export const developmentIndex = index({
  webpackConfig,
  isIndexPath,
  appString,
});
