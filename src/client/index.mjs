import assert from "assert";
// @ts-ignore
import { app } from "../app";

(async () => {
  const container = document.querySelector("#app");
  assert.ok(container);
  const { hyper } = await import("hyperhtml/esm");
  const title = document.title;
  await hyper(container)`${app({ render: hyper, model: { title } })}`;
  await new Promise(res => setTimeout(res, 5000)); // Test delay
  replayIntermediateEvents();
})().catch(error => {
  console.error("app index error", error);
});

const replayIntermediateEvents = async () => {
  // TODO signal to prevent actions during this phase?
  console.log("replaying start");
  window.dispatcher.dispatch = async action => {
    console.log("client side", await action);
  };
  for (const result of window.dispatcher.toReplay) {
    const foo = await result;
    console.log("action to replay", foo);
  }
  window.dispatcher.toReplay = [];
  console.log("replaying end");
};
