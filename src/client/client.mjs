import assert from "assert";
import { wire as hyperWire, bind } from "hyperhtml/esm";
// import he from "he";
// @ts-ignore
import { Propose } from "./control";
// @ts-ignore
import { app, Accept, nextAction, Actions } from "../app";

const wait = delay => new Promise(res => setTimeout(res, delay));

export const restoreSsrState = ({ document }) => {
    const appContainer = document.querySelector("#app");
    assert.ok(appContainer, "appContainer");
    assert.ok(appContainer.dataset.app, "appContainer.dataset.app");
    const state = JSON.parse(document.querySelector("#app").dataset.app);
    appContainer.removeAttribute("data-app");
    // Object.defineProperty(state, "_ssr", {
    //   value: state._ssr,
    //   enumerable: false,
    //   writable: false,
    //   configurable: true,
    // });
    return state;
};

export const Dispatch = ({ actions }) => (name, handler, ...args) => {
    return async function(event) {
        await handler(...args).apply(this, [event, actions[name]]);
    };
};

export const Connect = props => {
    const namespaceSet = new Set();
    return (component, state = {}, _namespace = true) => {
        if (!component) {
            console.error("connect: missing component");
        }
        if (!props) {
            console.error("connect: missing props");
        }
        if (_namespace === true && !component.name) {
            console.error("connect: invalid namespace");
        }
        const inheritedRender = typeof _namespace === "function";
        const namespace =
            _namespace === false || inheritedRender
                ? false
                : _namespace === true
                    ? `:${component.name}`
                    : `:${component.name}-${_namespace}`;
        // Inherited render uses object references as namespaces
        if (!inheritedRender) {
            if (namespaceSet.has(namespace)) {
                console.error("connect: duplicate namespace", namespace);
            }
            namespaceSet.add(namespace);
        }
        const { connect, render: _render, _wire, _actions, _state } = props;
        const render = namespace
            ? _wire(namespace)
            : inheritedRender
                ? _namespace
                : _render;
        return component({
            ...state,
            _wire,
            _actions,
            _state,
            connect,
            render,
        });
    };
};

export const AppState = ({ initialState, nextAction }) => {
    const wire = nameSpace => (reference = initialState) => {
        // default wire reference is app state object
        return hyperWire(reference, nameSpace);
    };
    const Render = ({ state, actions }) => {
        const props = {
            _wire: wire,
            _actions: { ...actions, dispatch: Dispatch({ actions }) },
            _state: state,
            connect: null,
            render: null,
        };
        const connect = Connect(props);
        props.connect = connect;
        props.render = wire(); // no namespace in wire here exposes missing child NS
        const appString = app({
            ...props,
            connect,
        });
        return bind(document.getElementById("app"))`${appString}`;
    };
    const propose = Propose({
        accept: Accept({ state: initialState }),
        render: () => Render({ state: initialState, actions }),
        nextAction: () => nextAction({ state: initialState, actions }),
    });
    const actions = Actions({ propose });
    return actions;
};

export const initialRender = async ({ actions }) => {
    assert.ok(document, "document");
    const container = document.querySelector("#app");
    assert.ok(container, "container");
    await actions.refresh();
};

export const replayIntermediateEvents = async ({ actions }) => {
    assert.ok(window["dispatcher"].toReplay, "dispatcher.toReplay");
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
    assert.ok(window["dispatcher"], "dispatcher");
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
    console.error("app error", error);
});
