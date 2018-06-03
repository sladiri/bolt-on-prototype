import viper from "viperhtml";
import { appShell } from "../../app-shell/app-shell";
import { Accept } from "../../app-shell/model";
import { SsrApp } from "../../sam-container/server";
import { posts } from "../../posts-data/posts";

const wire = viper.wire;

export const titleRegex = /<title>\n*(?<title>.*)\n*<\/title>/;
export const routeRegex = /\/app\/(?<route>.+)?/;

export const state = Object.assign(Object.create(null), {
    // _ssr: true,
    route: "",
    query: Object.create(null),
    title: "",
    rand: "",
    posts: [],
    todos: [],
    counters: [20, 20],
});

export const appIndex = async ({ ctx, body }) => {
    const html = body.toString();
    const { accept, AppString } = SsrApp({
        state,
        Accept,
    });
    const title = titleRegex.exec(html).groups.title;
    const routeMatch = routeRegex.exec(ctx.path);
    const route = routeMatch ? routeMatch.groups.route : "/";
    const query = Object.assign(Object.create(null), ctx.query);
    await accept({ route, query, title, posts });
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
