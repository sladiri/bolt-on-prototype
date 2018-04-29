import assert from "assert";
import { hyper as render, wire } from "hyperhtml/esm";
// @ts-ignore
import { app } from "../app";

const state = {
  posts: [],
};

const dispatch = (hook, ...data) => e => hook.call(null, e, ...data);

const acceptor = proposal => {
  if (!proposal) {
    return;
  }

  if (Array.isArray(proposal.posts)) {
    for (const post of proposal.posts) {
      const currentIndex = state.posts.findIndex(p => p.title === post.title);
      if (currentIndex !== -1) {
        Object.assign(state.posts[currentIndex], post);
      } else {
        state.posts.push(post);
      }
    }
  }

  console.log("acceptor with state", state);
};

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
    const proposal = await action;
    console.log("client side action", proposal);
    await acceptor(proposal);
  };
  for (const result of window.dispatcher.toReplay) {
    console.log("action to replay", await result);
  }
  window.dispatcher.toReplay = null;
  console.log("replaying end");
};
