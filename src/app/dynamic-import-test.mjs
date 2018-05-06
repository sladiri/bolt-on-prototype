import assert from "assert";
// @ts-ignore
import { posts } from "./posts";

let container;

export const dynamicImportButton = async props => {
  if (typeof document === "object") {
    // SSR does not support pcss imports
    // @ts-ignore
    await import("./dynamic-import-test.pcss");
  }
  return props.wire(props.model.posts)`
    <section id="dynamicImportButton">
      <h2>Dynamic Import Test</h2>
      <button
        disabled=${props.model._ssr}
        onclick=${onClick(props)}
      >Import</button>
      <button
        disabled=${props.model._ssr}
        onclick=${e => {
          console.log("propose test", this, event, props);
          props.propose(update(e, props.model.title));
        }}
      >Update</button>
      <button
        onclick=${props.dispatch(update, props.model.title)}
      >Update 2</button>
    </section>
  `;
};

const update = (event, ...data) => {
  console.log("dispatch test", this, event, data);
  return { title: `${Math.random()}` };
};

const onClick = props => event =>
  // TODO: test function block
  (async () => {
    console.log("propose test", this, props, event);

    const postsData = await fetch("/posts").then(resp => resp.json());

    props.propose({ posts: postsData });

    container = container || document.querySelector("#posts");
    assert.ok(container);

    props.bind(container)`
    <ul class="posts">
      ${await posts(props)}
    </ul>
  `;
  })().catch(error => {
    console.error("click handler error", error);
    throw error;
  });
