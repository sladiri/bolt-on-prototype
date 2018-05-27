import assert from "assert";
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
    const idComponentMap = new WeakMap();
    return (namespace = [], id = Number.MIN_SAFE_INTEGER) => (
        component,
        ...args
    ) => {
        assert.ok(id < Number.MAX_SAFE_INTEGER, "Connect ID exhuasted");
        let componentId;
        if (!component.name) {
            componentId = id++;
        } else if (idComponentMap.has(component)) {
            componentId = idComponentMap.get(component);
        } else {
            idComponentMap.set(component, id++);
            componentId = id;
        }
        const childNamespace = [...namespace, componentId];
        let childProps = Object.create(null);
        let wireNamespace;
        let wireReference;
        if (args.length === 1) {
            if (Object.prototype.toString.call(args[0]) === "[object Object]") {
                childProps = Object.assign(childProps, args[0]);
            }
            if (typeof args[0] === "number" || typeof args[0] === "string") {
                wireNamespace = `:${args[0]}`;
                childNamespace.push(`${args[0]}`); // mark namespaced
            }
        }
        if (args.length > 1) {
            childProps = Object.assign(childProps, args[0]);
            wireReference = args[1];
        }
        if (wireReference) {
            const parentNs = childNamespace
                .filter(x => typeof x === "string")
                .join("--");
            wireNamespace = wireNamespace || ":";
            wireNamespace = `${wireNamespace}|${parentNs}`;
        }
        const { _connect } = defaultProps;
        const props = Object.assign(Object.create(defaultProps), childProps, {
            render: viper.wire(wireReference, wireNamespace),
            connect: _connect(childNamespace, id),
        });
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
    _actions: Object.assign(Object.create(null), { dispatch }),
    _state: defaultState,
    render: viper.wire(),
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
    const { title, name } = defaultState;
    defaultProps._connect = Connect({ defaultProps });
    const appString = defaultProps._connect()(app, { title, name });
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
