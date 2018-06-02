import viper from "viperhtml";
import { appShell } from "../../app-shell/app-shell";
import { Accept } from "../../app-shell/model";
import { SsrApp } from "../../sam-container/server";
import { posts } from "../../posts-data/posts";

const wire = viper.wire;

export const titleRegex = /<title>\n*(?<title>.*)\n*<\/title>/;

export const state = Object.assign(Object.create(null), {
    // _ssr: true,
    name: "EMPTY",
    posts: [],
    todos: [],
    counters: [20, 20],
});

export const appIndex = async ({ ctx, body }) => {
    const context = {
        html: body.toString(),
        path: ctx.path,
        query: Object.assign(Object.create(null), ctx.query),
        cookies: null, // TODO
    };
    Object.assign(state, {
        // _ssr: true,
        title: titleRegex.exec(context.html)["groups"].title,
    });
    const { accept, AppString } = SsrApp({
        state,
        Accept,
    });
    await accept({ posts }); // Test server side state update
    const { title, name } = state;
    const appString = AppString(appShell, { title, name });
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
    return context.html.replace(/<body></, `<body>${ssrString}<`);
};