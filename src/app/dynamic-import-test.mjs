import assert from "assert";

export const dynamicImportButton = async props => {
  if (typeof document === "object") {
    // SSR does not support pcss imports
    // @ts-ignore
    await import("./dynamic-import-test.pcss");
  }

  return props.render()`
    <section id="dynamicImportButton">
      <h2>Dynamic Import Test</h2>
      <button onclick="${onClick(props)}">Import</button>
    </section>
  `;
};

const onClick = props => async e => {
  console.log("clicked", e);
  return (async () => {
    const [{ posts }, postsData] = await Promise.all([
      import("./posts"),
      fetch("/posts").then(resp => resp.json()),
    ]);
    const container = document.querySelector("#posts");
    assert.ok(container);
    // Test delay
    await window["dispatcher"].dispatch(
      new Promise(res =>
        setTimeout(
          () => res({ action: "postsFetched", posts: postsData }),
          3000,
        ),
      ),
    );

    // await props.render(container)`
    //   <ul class="posts">
    //     ${posts(props)}
    //   </ul>
    // `;
    await posts(container)(props);
  })();
};
