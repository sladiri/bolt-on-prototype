import assert from "assert";
import { hyper as render, wire } from "hyperhtml/esm";
// @ts-ignore
import { app } from "../app";
// @ts-ignore
import { acceptor } from "../app/acceptor";

const state = {
  posts: [],
};

const dispatch = (hook, ...data) => e => hook.call(null, e, ...data);

const accept = acceptor(state);

(async () => {
  const container = document.querySelector("#app");
  assert.ok(container);
  state.title = document.title;
  await render(container)`${app({
    render,
    wire,
    model: state,
    dispatch,
  })}`;
  await new Promise(res => setTimeout(res, 2000)); // Test delay
  replayIntermediateEvents();
})().catch(error => {
  console.error("app index error", error);
});

const replayIntermediateEvents = async () => {
  // TODO signal to prevent actions during this phase?
  console.log("replaying start");
  window.dispatcher.dispatch = async action => {
    // if (window.dispatcher.toReplay) {
    //   debugger;
    //   window.dispatcher.toReplay.push(action);
    //   return;
    // }
    console.log("DISPATCH ACTION awaiting proposal ...");
    const proposal = await action;
    console.log("DISPATCH ACTION accepting proposal ...", proposal);
    await accept(proposal);
    console.log("DISPATCH ACTION acceptor done", proposal);
  };
  for (const result of window.dispatcher.toReplay) {
    console.log("action to replay", await result);
  }
  window.dispatcher.toReplay = null;
  console.log("replaying end");
};
