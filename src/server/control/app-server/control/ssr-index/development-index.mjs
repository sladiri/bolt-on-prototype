import webpack from "koa-webpack";
import { debugConfig, isIndexPath, appString } from "./control";

export const DevelopmentIndex = () => {
    const webpackMiddleWare = webpack({
        config: debugConfig({ publicPath: "/", outputPath: "/" }),
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
