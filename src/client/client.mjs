import assert from "assert";
import { wire, bind } from "hyperhtml/esm";
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

export const Connect = ({ namespaceSet, defaultProps }) => {
    return (component, parentProps, ...args) => {
        let childProps = {};
        let addNamespace = true;
        if (args.length === 1) {
            if (
                typeof args[0] === "boolean" ||
                typeof args[0] === "string" ||
                typeof args[0] === "number"
            ) {
                addNamespace = args[0];
            } else {
                childProps = args[0];
            }
        }
        if (args.length > 1) {
            childProps = args[0] !== undefined ? args[0] : childProps;
            addNamespace = args[1] !== undefined ? args[1] : addNamespace;
        }
        const { _wire } = defaultProps;
        const { render: parentRender, _namespace } = parentProps;
        const namespace = [..._namespace];
        let childRender = null;
        if (addNamespace === false) {
            childRender = parentRender;
        } else {
            namespace.push(component.name);
            if (addNamespace !== true) {
                namespace.push(addNamespace);
            }
            const childNs = `:${namespace.join(":")}`;
            if (namespaceSet.has(childNs)) {
                console.warn("Connect: Duplicate namespace", childNs);
            } else {
                namespaceSet.add(childNs);
            }
            childRender = _wire(childNs)();
        }
        const props = Object.assign(Object.create(defaultProps), childProps, {
            _namespace: namespace,
            render: childRender,
        });
        return component(props);
    };
};

export const AppState = ({ initialState, nextAction }) => {
    const _wire = nameSpace => (reference = initialState) => {
        // default wire reference is app state object
        return wire(reference, nameSpace);
    };
    const namespaceSet = new Set();
    let defaultProps;
    let connect;
    let props;
    const render = ({ state, actions }) => {
        if (!defaultProps) {
            actions.dispatch = Dispatch({ actions });
            defaultProps = Object.assign(Object.create(null), {
                _wire,
                _actions: actions,
                _state: state,
            });
            connect = Connect({ namespaceSet, defaultProps });
            defaultProps.connect = connect;
            props = Object.assign(Object.create(null), defaultProps);
            props.render = _wire()(); // no namespace in wire here exposes missing child NS
        }
        props._namespace = [];
        namespaceSet.clear();
        const { title, name } = state;
        const appString = connect(app, props, { title, name }, false);
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
    console.error("App error", error);
});
