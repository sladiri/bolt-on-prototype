import Koa from "koa";
import route from "koa-route";
import mount from "koa-mount";
import serve from "koa-static";
import webpack from "koa-webpack";
import viper from "viperhtml";
import fs from "fs";
// @ts-ignore
import { config as webpackConfig } from "./webpack.ssr.config";
// @ts-ignore
import { app as clientApp } from "../../app";
// @ts-ignore
import { posts as renderPosts } from "../../app/posts";

export const app = ({ publicPath }) => {
  const isProduction = process.env.NODE_ENV === "production";
  const serveSsr = isProduction
    ? produtionResponse({
        publicPath,
        ssr: ssrResponse({ renderApp: appString }),
      })
    : developResponse({ renderApp: appString });
  const serveFiles = mount(
    isProduction ? "/" : `/${publicPath}`,
    serve(`./${publicPath}`),
  );
  const app = new Koa();
  app.use(errorHandler);
  app.use(setXResponseTime);
  app.use(route.get("/posts", posts));
  app.use(serveSsr);
  app.use(serveFiles);
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

const posts = async ctx => {
  ctx.body = postsData;
};

const postsData = [
  { title: "post a", summary: "a summary", content: "hi there" },
  { title: "post b", summary: "b summary", content: "bye all" },
];

const produtionResponse = ({ publicPath, ssr }) => async (ctx, next) => {
  if (isIndexPath({ path: ctx.path })) {
    const indexFile = fs.readFileSync(`./${publicPath}/index.html`, "utf8");
    await ssr({ body: indexFile, ctx });
  } else {
    await next();
  }
};

const developResponse = ({ renderApp }) => {
  const webpackMiddleWare = webpack({
    config: webpackConfig({ publicPath: "/", outputPath: "/" }),
    hot: false, // Firefox does not allow insecure operation, requires allowinsecurefromhttps=true + fails
  });
  return async (ctx, next) => {
    await webpackMiddleWare(ctx, next);
    if (isIndexPath({ path: ctx.path })) {
      ctx.body = await renderApp({
        body: ctx.body.toString(),
        query: ctx.query,
      });
    }
  };
};

const isIndexPath = ({ path }) => {
  return !!/^\/(index\.html)?(\?.*)?(index\.html\/.*)?$/.exec(path);
};

const ssrResponse = ({ renderApp }) => {
  const cache = new Map();
  return async ({ body, ctx }) => {
    console.log("SSR Cache Length", cache.size);
    const cacheKey = ctx.path;
    const isCached = cache.has(cacheKey);
    const start = isCached ? 0 : Date.now();
    const html = isCached
      ? cache.get(cacheKey)
      : await renderApp({ body, query: ctx.query });
    if (!isCached) {
      cache.set(cacheKey, html);
    }
    ctx.body = html;
    const ttRenderMs = isCached ? 0 : Date.now() - start;
    ctx.set(
      "Server-Timing",
      `Prerender;dur=${ttRenderMs};desc="Headless render time (ms)"`,
    );
  };
};

const appString = async ({ body, query }) => {
  const match = /<title>\n*(?<title>.*)\n*<\/title>/.exec(body);
  let appString = await clientApp({
    render: viper,
    model: {
      title: match.groups.title,
      query,
    },
  });
  const postsString = await renderPosts({
    render: viper,
    model: {
      posts: postsData,
      ssrAction: (hook, ...data) =>
        `return (${hook}).call(this, event, ...${JSON.stringify(data)});`,
    },
  });
  appString = viper.wire()`
    <script>
      window.dispatcher = window.dispatcher || {
        toReplay: [],
        dispatch(action) {
          this.toReplay.push(action);
          console.log('pushed', this.toReplay.length);
        },
      };
    </script>
    <section id="app">
      ${appString}
    </section>
    <section id="postsssrtest">
      ${postsString}
    </section>
  `;
  return body.replace(/##SSR##/, appString);
};
