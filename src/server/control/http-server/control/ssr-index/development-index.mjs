import webpack from "koa-webpack";
// @ts-ignore
import { webpackConfig, isIndexPath, appString } from "./control";

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
