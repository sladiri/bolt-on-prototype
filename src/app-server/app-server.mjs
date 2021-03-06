import Koa from "koa";
import mount from "koa-mount";
import compress from "koa-compress";
import { couchDbProxy } from "./control/couchdb";
import { Files } from "./control/files";
import { ProductionIndex } from "../ssr-index/production-index";
import { DevelopmentIndex } from "../ssr-index/development-index";

const isProduction = process.env.NODE_ENV === "production";
const couchOptions = {
    protocol: "http",
    hostname: "localhost",
    port: 5984,
};

export const AppServer = async ({ publicPath }) => {
    const couchDb = mount("/api/couch", couchDbProxy(couchOptions));
    const filesPath = isProduction ? "/" : `/${publicPath}`;
    const files = mount(filesPath, Files({ publicPath }));
    const ssrIndex = isProduction
        ? ProductionIndex({ publicPath })
        : await DevelopmentIndex();
    const app = new Koa();
    app.use(errorHandler);
    app.use(setXResponseTime);
    if (isProduction) {
        app.use(compress());
    }
    app.use(couchDb);
    app.use(ssrIndex);
    app.use(files);
    return app;
};

export const errorHandler = async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        console.error("errorHandler", error);
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
