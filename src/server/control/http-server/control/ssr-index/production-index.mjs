import fs from "fs";
// @ts-ignore
import { isIndexPath, appString } from "./control";

export const index = ({ isIndexPath, appString }) => ({ publicPath }) => {
  const cache = new Map();
  const ssrResponse = async ({ body, ctx }) => {
    console.log("SSR Cache Length", cache.size);
    const cacheKey = ctx.path;
    const isCached = cache.has(cacheKey);
    const start = isCached ? 0 : Date.now();
    const html = isCached
      ? cache.get(cacheKey)
      : await appString({ body, query: ctx.query });
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

  return async (ctx, next) => {
    if (isIndexPath({ path: ctx.path })) {
      const indexFile = fs.readFileSync(
        "./" + publicPath + "/index.html",
        "utf8",
      ); // syntax colour bug with template literal
      await ssrResponse({ body: indexFile, ctx });
    } else {
      await next();
    }
  };
};

export const productionIndex = index({ isIndexPath, appString });
