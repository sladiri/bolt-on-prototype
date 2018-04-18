import puppeteer from "puppeteer";
import urlModule from "url";

export const renderChrome = () => {
  const cache = new Map();
  return async ({ url, resetCache = false }) => {
    return !resetCache && cache.has(url)
      ? cachedPage(cache, url)
      : cache.set(url, render(url)).get(url);
  };
};

const cachedPage = async (cache, url) => {
  return {
    ...(await cache.get(url)),
    ttRenderMs: 0,
  };
};

const render = async url => {
  const start = Date.now();

  const browser = await puppeteer.launch({
    devtools: true,
    slowMo: 250,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  // Intercept + self-signed SSL is broken https://github.com/GoogleChrome/puppeteer/issues/1159
  // await page.setRequestInterception(true);
  // const whitelist = ["document", "script", "xhr", "fetch"];
  // page.on("request", request => {
  //   if (!whitelist.includes(request.resourceType())) {
  //     console.log("aborting request", request.url);
  //     return request.abort();
  //   }
  //   request.continue();
  // });

  try {
    const renderUrl = new urlModule.URL(url);
    renderUrl.searchParams.set("headless", "");
    // networkidle0 waits for the network to be idle (no requests for 500ms).
    // The page's JS has likely produced markup by this point, but wait longer
    // if your site lazy loads, etc.
    await page.goto(renderUrl.toString(), { waitUntil: "networkidle0" });
    await page.waitForSelector("#posts"); // ensure #posts exists in the DOM.
  } catch (err) {
    console.error(err);
    throw new Error("page.goto/waitForSelector timed out.");
  }

  const html = await page.content();
  await browser.close();

  const ttRenderMs = Date.now() - start;

  return { html, ttRenderMs };
};
