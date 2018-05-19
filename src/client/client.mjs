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

export const dispatch = ({ actions }) => (name, handler, ...args) => {
    return async function(event) {
        await handler(...args).apply(this, [event, actions[name]]);
    };
};

export const setupRender = () => {
    const wire = nameSpace => (reference = null) =>
        hyperWire(reference, nameSpace);
    const render = ({ state, actions }) =>
        bind(document.getElementById("app"))`${app({
            render: wire(), // no namespace in wire here exposes missing child NS
            wire,
            state,
            actions,
            dispatch: dispatch({ actions }),
        })}`;
    return render;
};

export const setupAppState = ({ initialState, render, nextAction }) => {
    const accept = Accept({
        state: initialState,
    });
    const propose = Propose({
        accept,
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
    const initialState = restoreSsrState({ document });
    const render = setupRender();
    const actions = setupAppState({ initialState, render, nextAction });
    // return;
    await wait(2000);
    await initialRender({ actions });
    // TODO: Do not allow actions until replay done?
    await replayIntermediateEvents({ actions });
    window["dispatcher"] = null;
})().catch(error => {
    console.error("app error", error);
});
