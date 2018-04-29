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
  console.log("clikkkk", e);
  const [{ default: assert }, { posts }, postsData] = await Promise.all([
    import("assert"),
    import("./posts"),
    fetch("/posts").then(resp => resp.json()),
  ]);
  const container = document.querySelector("#posts");
  assert(container);
  await window.dispatcher.dispatch({
    action: "postsFetched",
    posts: postsData,
  });

  // await props.render(container)`
  //   <ul class="posts">
  //     ${posts(props)}
  //   </ul>
  // `;
  await posts(container)(props);
};
