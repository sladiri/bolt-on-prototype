import Koa from "koa";
import route from "koa-route";
import mount from "koa-mount";
import serve from "koa-static";
import webpack from "koa-webpack";
// @ts-ignore
import { ssr } from "./ssr.mjs";
// @ts-ignore
import { config as webpackConfig } from "./webpack-config.mjs";

export const app = ({ publicPath }) => {
  const app = new Koa();
  app.use(
    webpack({
      config: webpackConfig({ publicPath }),
      hot: false, // Firefox does not allow insecure operation, requires allowinsecurefromhttps=true + fails
    }),
  );
  app.use(errorHandler);
  app.use(setXResponseTime);
  app.use(mount(publicPath, serve(`.${publicPath}`)));
  app.use(route.get("/", response({ publicPath })));
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
  console.log(`Responded to [ ${ctx.method} ${ctx.path} ] in ${ttTotalMs}ms`);
};

const response = ({ publicPath }) => {
  const render = ssr();
  return async ctx => {
    const { html, ttRenderMs } = await render({
      resetCache: "resetcache" in ctx.request.query,
      url: `${ctx.request.protocol}://${
        ctx.req.authority
      }${publicPath}/index.html`, // ctx.req.authority is a workaround for http2 and Koa2?
    });
    ctx.set(
      "Server-Timing",
      `Prerender;dur=${ttRenderMs};desc="Headless render time (ms)"`,
    );
    ctx.body = html;
    console.log(`Headless rendered page in: ${ttRenderMs}ms`);
  };
};

const posts = async ctx => {
  ctx.body = [
    { title: "post a", summary: "a summary", content: "hi there" },
    { title: "post b", summary: "b summary", content: "bye all" },
  ];
};
