import { wire, bind } from "hyperhtml/esm";
// import he from "he";
// @ts-ignore
import { Propose } from "./control";
// @ts-ignore
import { app, Accept, nextAction, Actions } from "../app";

const wait = delay => new Promise(res => setTimeout(res, delay));

export const restoreSsrState = ({ document }) => {
    const appContainer = document.querySelector("#app");
    console.assert(appContainer, "appContainer");
    console.assert(appContainer.dataset.app, "appContainer.dataset.app");
    const state = Object.assign(
        Object.create(null),
        JSON.parse(document.querySelector("#app").dataset.app),
    );
    appContainer.removeAttribute("data-app");
    return state;
};

export const Dispatch = ({ actions }) => (name, handler, ...args) => {
    return async function(event) {
        await handler(...args).apply(this, [event, actions[name]]);
    };
};

export const Connect = ({ defaultProps }) => {
    const idComponentMap = new WeakMap();
    return (namespace = [], id = Number.MIN_SAFE_INTEGER) => (
        component,
        ...args
    ) => {
        console.assert(id < Number.MAX_SAFE_INTEGER, "Connect ID exhuasted");
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
            render: wire(wireReference, wireNamespace),
            connect: _connect(childNamespace, id),
        });
        return component(props);
    };
};

export const AppState = ({ initialState, nextAction }) => {
    let defaultProps;
    let props;
    const render = ({ state, actions }) => {
        if (!defaultProps) {
            actions.dispatch = Dispatch({ actions });
            defaultProps = Object.assign(Object.create(null), {
                _actions: actions,
                _state: state,
            });
            defaultProps._connect = Connect({ defaultProps });
            props = Object.assign(Object.create(null), defaultProps);
            props.render = wire();
        }
        props._namespace = [];
        const { title, name } = state;
        const appString = defaultProps._connect()(app, { title, name });
        return bind(document.getElementById("app"))`${appString}`;
    };
    const propose = Propose({
        accept: Accept({ state: initialState }),
        render: () => render({ state: initialState, actions }),
        nextAction: () => nextAction({ state: initialState, actions }),
    });
    const actions = Actions({ propose });
    return actions;
};

export const initialRender = async ({ actions }) => {
    console.assert(document, "document");
    const container = document.querySelector("#app");
    console.assert(container, "container");
    await actions.refresh();
};

export const replayIntermediateEvents = async ({ actions }) => {
    console.assert(window["dispatcher"].toReplay, "dispatcher.toReplay");
    console.log(`replaying [${window["dispatcher"].toReplay.length}] actions`);
    for (const entry of window["dispatcher"].toReplay) {
        console.log("replaying entry", entry);
        const { handler, args, name, target, event } = entry;
        const action = handler.apply(null, args);
        const hook = actions[name];
        await action.apply(target, [event, hook]);
        await wait(500);
    }
    console.log("replaying end");
};

(async () => {
    console.assert(window["dispatcher"], "dispatcher");
    const actions = AppState({
        initialState: restoreSsrState({ document }),
        nextAction,
    });
    // return;
    // await wait(2000);
    initialRender({ actions });
    // TODO: Do not allow actions until replay done?
    await replayIntermediateEvents({ actions });
    window["dispatcher"] = null;
})().catch(error => {
    console.error("App error", error);
});
