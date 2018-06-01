import webpack from "koa-webpack";
import { config as ssrConfig } from "./control/webpack-ssr-config";
import { isIndexPath } from "./control/is-index-path";
import { appString } from "./control/app-string";

export const DevelopmentIndex = () => {
    const webpackMiddleWare = webpack({
        config: ssrConfig({ publicPath: "/", outputPath: "/" }),
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