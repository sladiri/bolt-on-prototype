import viper from "viperhtml";
import { appShell, pages } from "../../app-shell/app-shell";
import { Accept } from "../../app-shell/model";
import { SsrApp } from "../../sam-container/server";
import { posts } from "../../posts-data/posts";

const wire = viper.wire;

export const routeRegex = /^\/app\/(?<route>.+)?$/;

export const state = Object.assign(Object.create(null), {
    // _ssr: true,
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
    let html = body.toString();
    const { accept, AppString } = SsrApp({
        state,
        Accept,
    });
    const routeMatch = routeRegex.exec(ctx.path);
    const route = routeMatch ? routeMatch.groups.route : "/";
    const query = Object.assign(Object.create(null), ctx.query);
    const { title, description } = pages[route] || pages["/"];
    html = html.replace("#title#", title).replace("#description#", description);
    await accept({ route, query, title, description, posts });
    const appString = AppString(appShell, {
        title: state.title,
        rand: state.rand,
    });
    const ssrString = wire()`
        <input
            id="app-ssr-data"
            type="hidden"
            value=${JSON.stringify(state)}
        />
        <script>
            window.dispatcher = { toReplay: [] };
        </script>
        ${appString}
    `;
    return html.replace(/<body></, `<body>${ssrString}<`);
};
