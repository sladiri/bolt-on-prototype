import Koa from "koa";
import route from "koa-route";
import mount from "koa-mount";
import serve from "koa-static";
// @ts-ignore
import { posts, ProductionIndex, DevelopmentIndex } from "./control";

export const AppServer = ({ publicPath }) => {
    const isProduction = process.env.NODE_ENV === "production";
    const filePath = isProduction ? "/" : `/${publicPath}`;
    const ssrIndex = ({ publicPath, isProduction }) => {
        const response = isProduction
            ? ProductionIndex({ publicPath })
            : DevelopmentIndex();
        return response;
    };
    const app = new Koa();
    app.use(errorHandler);
    app.use(setXResponseTime);
    app.use(route.get("/posts", posts));
    app.use(ssrIndex({ publicPath, isProduction }));
    app.use(mount(filePath, serve(`./${publicPath}`)));
    return app;
};

export const errorHandler = async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        console.error("server error -", error);
        ctx.status = 500;
        ctx.body = error.message;
    }
};

export const setXResponseTime = async (ctx, next) => {
    const start = Date.now();
    await next();
    const ttTotalMs = Date.now() - start;
    ctx.set("X-Response-Time", `${ttTotalMs}ms`);
    console.log(`Responded to [ ${ctx.method} ${ctx.path} ] in ${ttTotalMs}ms`);
};
