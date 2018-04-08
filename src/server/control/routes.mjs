import Koa from "koa";
import route from "koa-route";
import mount from "koa-mount";
import serve from "koa-static";
// import compress from "koa-compress";
// import c2k from "koa-connect";
import webpack from "koa-webpack";
// @ts-ignore
import { ssr } from "./ssr.mjs";
// @ts-ignore
import { config as webpackConfig } from "./webpack.config.mjs";

const publicPath = "/public";

export const createApp = () => {
  const app = new Koa();
  app.use(
    webpack({
      config: webpackConfig({ publicPath }),
      hot: true,
    }),
  );
  app.use(errorHandler);
  app.use(setXResponseTime);
  app.use(logger);
  // app.use(compress());
  app.use(mount(publicPath, serve(`.${publicPath}`)));
  app.use(route.get("/", response()));
  app.use(route.get("/posts", posts));

  return app;
};

const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error("server error -", error);
    ctx.status = 500;
    ctx.body = error.message;
  }
};

const setXResponseTime = async (ctx, next) => {
  const start = Date.now();
  await next();
  const ttTotalMs = Date.now() - start;
  ctx.set("X-Response-Time", `${ttTotalMs}ms`);
  console.info(`Response time for ${ctx.method} ${ctx.url} - ${ttTotalMs}ms`);
};

const logger = async (ctx, next) => {
  await next();
  console.info(`Responsed to request ${ctx.path} with ${ctx.status}`);
};

const render = ssr();
const response = () => async ctx => {
  const { html, ttRenderMs } = await render(
    // Using ctx.req.authority is a workaround for http2 and Koa2
    `${ctx.request.protocol}://${ctx.req.authority}${publicPath}/index.html`,
    // `${ctx.request.protocol}://${ctx.host}${publicPath}/index.html`,
  );
  ctx.set(
    "Server-Timing",
    `Prerender;dur=${ttRenderMs};desc="Headless render time (ms)"`,
  );
  ctx.body = html;
  console.info(`Headless rendered page in: ${ttRenderMs}ms`);
};

const posts = async ctx => {
  ctx.body = [
    { title: "post a", summary: "a summary", content: "hi there" },
    { title: "post b", summary: "b summary", content: "bye all" },
  ];
};
