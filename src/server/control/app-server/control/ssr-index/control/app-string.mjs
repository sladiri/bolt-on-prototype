import viper from "viperhtml";
// @ts-ignore
import { app, Accept } from "../../../../../../app";
// @ts-ignore
import { posts } from "../../../entity";

export const titleRegex = /<title>\n*(?<title>.*)\n*<\/title>/;

export const State = ({ titleRegex, body, query }) => ({
    // _ssr: true,
    query,
    posts: [],
    // @ts-ignore
    title: titleRegex.exec(body).groups.title,
    name: "EMPTY",
    todos: [],
    counters: [10, 10],
});

export const dispatch = (_name, _handler, ..._args) => `{
    const name = '${_name}';
    const handler = (${_handler});
    const args = ${JSON.stringify(_args)};
    window.dispatcher.toReplay.push({
        name,
        handler,
        args,
        target: this,
        event,
    });
}`;

export const AppString = ({
    wire,
    State,
    Accept,
    titleRegex,
    app,
    posts,
}) => async ({ body, query }) => {
    const state = State({ titleRegex, body, query });
    const accept = Accept({ state });
    await accept({ posts }); // Test server side state update
    const appString = app({
        render: () => wire(),
        wire: () => () => wire(),
        state,
        actions: {},
        dispatch,
    });
    const ssrString = wire()`
        <script>
            window.dispatcher = { toReplay: [] };
        </script>
        <section id="app" data-app=${JSON.stringify(state)}>
            ${await appString}
        </section>
    `;
    return body.replace(/##SSR##/, ssrString);
};

export const appString = AppString({
    wire: viper.wire,
    State,
    Accept,
    titleRegex,
    app,
    posts,
});
