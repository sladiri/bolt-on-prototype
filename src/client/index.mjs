import assert from "assert";
import { hyper as render, wire } from "hyperhtml/esm";
// @ts-ignore
import { app } from "../app";
// @ts-ignore
import { acceptor } from "../app/acceptor";

const state = {
  posts: [],
};
const actionsInProgress = new Set();
const accept = acceptor(state);

(async () => {
  const container = document.querySelector("#app");
  assert.ok(container);
  state.title = document.title;
  await render(container)`${app({
    render,
    wire,
    model: state,
    dispatch: (hook, ...data) => e => hook.call(null, e, ...data),
  })}`;
  await new Promise(res => setTimeout(res, 3000)); // Test delay
  await replayIntermediateEvents();
})().catch(error => {
  console.error("app index error", error);
});

const replayIntermediateEvents = async () => {
  // TODO signal to prevent actions during this phase?
  console.log("replaying start");
  window.dispatcher.dispatch = dispatch;
  for (const action of window.dispatcher.toReplay) {
    console.log("action to replay", action);
    await dispatch(action, true);
  }
  window.dispatcher.toReplay = null;
  console.log("replaying end");
};

const dispatch = async (action, isInitialReplay) => {
  try {
    if (!isInitialReplay && window.dispatcher.toReplay) {
      console.warn("DISPATCH: Abort, non-empty window.dispatcher.toReplay.");
      return;
    }

    if (actionsInProgress.size) {
      console.warn(
        `DISPATCH: Abort, proposals in progress [${[
          ...actionsInProgress.values(),
        ]}] ...`,
      );
      return;
    }

    let actionId = Math.random();
    while (actionsInProgress.has(actionId)) {
      actionId = Math.random();
    }
    actionsInProgress.add(actionId);
    console.log(`DISPATCH: awaiting proposal [${actionId}] ...`, action);

    const proposal = await action;
    const newState = await accept(proposal);
    actionsInProgress.delete(actionId);

    console.log(`DISPATCH: acceptor done [${actionId}]`, proposal, newState);
  } catch (error) {
    console.error("DISPATCH error:", error);
  }
};
