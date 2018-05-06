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
        onclick=${e =>
          props.propose(updateSSR(props.model.title).call(this, e))}
      >Update</button>
      <button
        disabled=${props.model._replay}
        onclick=${props.dispatch(updateSSR, props.model.title)}
      >Update 2</button>
    </section>
  `;
};

const updateSSR = data =>
  function(event) {
    console.log("dispatch test", this, event, data);
    return { title: `${Math.random()}` };
  };

const onClick = props =>
  function(event) {
    console.log("propose test", this, props, event);
    (async () => {
      const postsData = await fetch("/posts").then(resp => resp.json());

      await props.propose({ posts: postsData });

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
  };
