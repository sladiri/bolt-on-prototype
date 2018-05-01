import assert from "assert";
import { hyper as render, wire } from "hyperhtml/esm";
// @ts-ignore
import { app } from "../app";
// @ts-ignore
import { acceptor } from "../app/acceptor";
// @ts-ignore
import { dispatcher } from "./dispatch";

(async () => {
  assert.ok(document);

  const state = {
    posts: [],
    title: document.title,
  };

  const container = document.querySelector("#app");
  assert.ok(container);

  await render(container)`${app({
    render,
    wire,
    model: state,
    dispatch: (hook, ...data) => e => hook.call(null, e, ...data),
  })}`;
  await new Promise(res => setTimeout(res, 3000)); // Test delay
  await replayIntermediateEvents({ dispatch: globalDispatch({ state }) });
})().catch(error => {
  console.error("app index error", error);
});

const globalDispatch = ({ state }) =>
  dispatcher({
    actionsInProgress: new Set(),
    accept: acceptor(state),
  });

const replayIntermediateEvents = async ({ dispatch }) => {
  console.log("replaying start");
  window["dispatcher"].dispatch = dispatch;
  for (const action of window["dispatcher"].toReplay) {
    console.log("action to replay", action);
    await dispatch(action, true);
  }
  window["dispatcher"].toReplay = null;
  console.log("replaying end");
};
