import { SsrApp } from "hypersam/src/server";
import { appShell, pages } from "../../app-shell/app-shell";
import { Accept } from "../../app-shell/model";
import { posts } from "../../posts-data/posts";

export const routeRegex = /^\/app\/(?<route>.+)?$/;

export const state = Object.assign(Object.create(null), {
    route: "",
    query: Object.create(null),
    title: "",
    description: "",
    rand: "",
    posts: [],
    todos: [],
    counters: [20, 20],
});

export const appIndex = async ({ ctx, body }) => {
    const routeMatch = routeRegex.exec(ctx.path);
    const route = routeMatch ? routeMatch.groups.route : "/";
    const query = Object.assign(Object.create(null), ctx.query);
    const { title, description } = pages[route] || pages["/"];
    const { renderHTMLString, accept } = SsrApp({
        state,
        app: appShell,
        Accept,
    });
    await accept({ proposal: { route, query, title, description, posts } });
    const appString = renderHTMLString();
    const index = body
        .toString()
        .replace("#title#", title)
        .replace("#description#", description)
        .replace(/<body></, `<body>${appString}<`);
    return index;
};
