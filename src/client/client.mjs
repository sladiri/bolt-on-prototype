import assert from "assert";
import { hyper as render, wire, bind } from "hyperhtml/esm";
import he from "he";
// @ts-ignore
import { App, acceptor } from "../app";
// @ts-ignore
import { Propose, Dispatch } from "./control";

export const restoreSsrState = ({ window }) => {
  const state = JSON.parse(he.decode(window["dispatcher"].state));
  Object.defineProperty(state, "_ssr", {
    value: state._ssr,
    enumerable: false,
    writable: false,
    configurable: true,
  });
  return state;
};

export const replayIntermediateEvents = async ({ propose }) => {
  // TODO: Do not allow actions until replay done?
  console.log("replaying start", window["dispatcher"].toReplay);
  for (const action of window["dispatcher"].toReplay) {
    await propose(action, true);
    // await new Promise(res => window.setTimeout(res, 100)); // Test delay
  }
  console.log("replaying end");
};

(async () => {
  // return;
  // await new Promise(res => window.setTimeout(res, 2000)); // Test delay

  assert.ok(window["dispatcher"]);
  assert.ok(window["dispatcher"].state);
  const state = restoreSsrState({ window });
  window["dispatcher"].state = null;

  assert.ok(document);
  const container = document.querySelector("#app");
  assert.ok(container);

  const proposeInstance = Propose({
    actionsInProgress: new Set(),
    accept: acceptor(state),
  });

  const reRender = async () => bind(container)`${await app({ model: state })}`;

  const propose = async (action, isReplay = false) => {
    if (state._ssr && !isReplay) {
      throw new Error("PROPOSE called during initialisation");
    }
    const newState = await proposeInstance(action);
    // console.log("rerender after client propose");
    await reRender();
    return newState;
  };

  const app = App({
    render,
    bind,
    wire,
    dispatch: Dispatch({ propose }),
    propose,
    model: state,
  });

  // While replay is in progress, the user could already propose actions.
  Object.defineProperty(state, "_replay", {
    value: true,
    enumerable: false,
    writable: false,
    configurable: true,
  });
  await reRender();

  // await new Promise(res => window.setTimeout(res, 2000)); // Test delay

  assert.ok(Array.isArray(window["dispatcher"].toReplay));
  await replayIntermediateEvents({ propose });
  window["dispatcher"].toReplay = null;
  window["dispatcher"] = null;
  Object.defineProperty(state, "_ssr", {
    value: false,
    enumerable: false,
    writable: false,
    configurable: false,
  });
  Object.defineProperty(state, "_replay", {
    value: false,
    enumerable: false,
    writable: false,
    configurable: false,
  });
  await reRender();
})().catch(error => {
  console.error("app index error", error);
  throw error;
});
