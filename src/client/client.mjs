import assert from "assert";
import { hyper, wire as hyperWire, bind, Component } from "hyperhtml/esm";
// import he from "he";
// @ts-ignore
import { Propose, Actions } from "./control";
// @ts-ignore
import { app, Accept } from "../app";

const wait = delay => new Promise(res => window.setTimeout(res, delay));

// assert.ok(window["dispatcher"], "dispatcher");

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

export const initialRender = async ({ actions }) => {
  assert.ok(document, "document");
  const container = document.querySelector("#app");
  assert.ok(container, "container");
  await actions.refresh();
};

export const replayIntermediateEvents = async ({ actions }) => {
  assert.ok(window["dispatcher"].toReplay, "dispatcher.toReplay");
  console.log(
    `replaying start [${window["dispatcher"].toReplay.size} actions]`,
  );
  for (const entry of window["dispatcher"].toReplay) {
    console.log("replayIntermediateEvents", entry);
    const { name, handler, args, target, event } = entry;
    const action = handler.apply(null, args);
    const hook = actions[name];
    await action.apply(target, [event, hook]);
    await wait(500);
  }
  console.log("replaying end");
};

(async () => {
  // #region restoreSsrState
  const initialState = restoreSsrState({ document });
  // #endregion

  // #region setup HyperHTML render
  const wire = nameSpace => (reference = null) =>
    hyperWire(reference, nameSpace);
  const render = ({ state, actions }) =>
    bind(document.getElementById("app"))`${app({
      render: wire(), // no namespace in wire here exposes missing child NS
      wire,
      state,
      actions,
      dispatch: (name, handler, ...args) =>
        async function(event) {
          await handler(...args).apply(this, [event, actions[name]]);
        },
    })}`;
  // #endregion

  // #region setup SAM container
  const accept = Accept({
    state: initialState,
  });
  const propose = Propose({
    accept,
    render: () => render({ state: initialState, actions }),
  });
  const actions = Actions({ propose });
  // #endregion

  // return;
  await wait(3000);
  await initialRender({ actions });
  // TODO: Do not allow actions until replay done?
  await replayIntermediateEvents({ actions });
  window["dispatcher"] = null;
})().catch(error => {
  console.error("app error", error);
});
