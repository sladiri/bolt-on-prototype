import viper from "viperhtml";
import { app, Accept } from "../../../../../../app";
import { SsrApp } from "../../../../../../sam-container";
import { posts } from "../../../entity";

const wire = viper.wire;

export const titleRegex = /<title>\n*(?<title>.*)\n*<\/title>/;

export const state = Object.assign(Object.create(null), {
    // _ssr: true,
    name: "EMPTY",
    posts: [],
    todos: [],
    counters: [20, 20],
});

export const appString = async ({ body, query }) => {
    Object.assign(state, {
        // _ssr: true,
        query,
        title: titleRegex.exec(body).groups.title,
    });
    const { accept, AppString } = SsrApp({
        state,
        Accept,
    });
    await accept({ posts }); // Test server side state update
    const { title, name } = state;
    const appString = AppString(app, { title, name });
    const ssrString = wire()`
        <script>
            window.dispatcher = { toReplay: [] };
        </script>
        <section id="app" data-app=${JSON.stringify(state)}>
            ${appString}
        </section>
    `;
    return body.replace(/##SSR##/, ssrString);
};
