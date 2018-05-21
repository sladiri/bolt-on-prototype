import viper from "viperhtml";
// @ts-ignore
import { app, Accept } from "../../../../../../app";
// @ts-ignore
import { posts } from "../../../entity";

export const titleRegex = /<title>\n*(?<title>.*)\n*<\/title>/;

export const defaultState = Object.assign(Object.create(null), {
    // _ssr: true,
    name: "EMPTY",
    posts: [],
    todos: [],
    counters: [20, 20],
});

export const Connect = ({ defaultProps }) => {
    return (component, parentProps, ...args) => {
        let childProps = {};
        if (
            args.length === 1 &&
            !(
                typeof args[0] === "boolean" ||
                typeof args[0] === "string" ||
                typeof args[0] === "number"
            )
        ) {
            childProps = args[0];
        }
        if (args.length > 1) {
            childProps = args[0] !== undefined ? args[0] : childProps;
        }
        const props = Object.assign(Object.create(defaultProps), childProps);
        return component(props);
    };
};

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

export const defaultProps = Object.assign(Object.create(null), {
    render: viper.wire(),
    _wire: viper.wire,
    _actions: Object.assign(Object.create(null), { dispatch }),
    _state: defaultState,
});

export const appString = async ({ body, query }) => {
    Object.assign(defaultState, {
        // _ssr: true,
        query,
        // @ts-ignore
        title: titleRegex.exec(body).groups.title,
    });
    const accept = Accept({ state: defaultState });
    await accept({ posts }); // Test server side state update
    const connect = Connect({ defaultProps });
    defaultProps.connect = connect;
    const { title, name } = defaultState;
    const appString = connect(app, defaultProps, { title, name });
    const ssrString = viper.wire()`
        <script>
            window.dispatcher = { toReplay: [] };
        </script>
        <section id="app" data-app=${JSON.stringify(defaultState)}>
            ${appString}
        </section>
    `;
    return body.replace(/##SSR##/, ssrString);
};
