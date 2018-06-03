import viper from "viperhtml";
import { appShell, pages } from "../../app-shell/app-shell";
import { Accept } from "../../app-shell/model";
import { SsrApp } from "../../app-container/server";
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
    const { accept, AppString } = SsrApp({ state, Accept });
    await accept({ route, query, title, description, posts });
    const appString = AppString(appShell, {
        title: state.title,
        rand: state.rand,
    });
    const ssrString = viper.wire()`
        <input
            id="app-ssr-data"
            type="hidden"
            value=${JSON.stringify(state)}
        />
        <script>window.dispatcher = { toReplay: [] };</script>
        ${appString}
    `;
    const index = body
        .toString()
        .replace("#title#", title)
        .replace("#description#", description)
        .replace(/<body></, `<body>${ssrString}<`);
    return index;
};
