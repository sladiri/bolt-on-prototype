import assert from "assert";
import { SsrApp } from "hypersam/src/server";
import PouchDB from "pouchdb";
import { appShell as app, pages } from "../../app-shell/app-shell";
import { Accept } from "../../app-shell/model";
import { Service } from "../../app-shell/service";

assert(pages.home && pages.home.page, "Routing: Home page");

export const state = Object.seal(
    Object.assign(Object.create(null), {
        route: "",
        query: Object.create(null),
        title: "",
        description: "",
        busy: false,
        foo: 42,
    }),
);

export const protocol = "http:";
export const hostname = "localhost";
export const port = 5984;
export const dbPath = `${protocol}//${hostname}:${port}`;
export const dbName = "bolton";

const shimId = "a";
// TODO shimId can be per client or per server
// TODO read/write existing cookie
// const shimId = process.pid; // TODO use ENV or disk?
// const tick = Number.MIN_SAFE_INTEGER; // TODO use BigInt?
const tick = 10; // TODO use BigInt?

export const service = (() => {
    let ensured;
    let _service;
    return async () => {
        if (!ensured) {
            _service = Service({ PouchDB, dbPath, dbName, shimId, tick });
            ensured = true;
        }
        return _service;
    };
})();

export const routeRegex = /^\/(.+)?$/;

export const appIndex = async ({ ctx, body }) => {
    const [, route = "home"] = routeRegex.exec(ctx.path) || [];
    const query = Object.assign(Object.create(null), ctx.query);
    const { title, description } = pages[route] || pages.home;
    const { renderHTMLString, accept } = SsrApp({
        state,
        app,
        accept: Accept({ service }),
    });
    await accept({ state, proposal: { route, query, title, description } });
    const appString = renderHTMLString();
    const index = body
        .toString()
        .replace("#title#", title)
        .replace("#description#", description)
        .replace(/<body></, `<body>${appString}<`);
    return index;
};
