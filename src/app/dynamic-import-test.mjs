export const dynamicImportButton = async ({ render }) => {
  if (typeof document === "object") {
    // SSR does not support pcss imports
    // @ts-ignore
    await import("./dynamic-import-test.pcss");
  }

  return render()`
    <section id="dynamicImportButton">
      <h2>Dynamic Import Test</h2>
      <button onclick="${onClick}">Import</button>
    </section>
  `;
};

const onClick = async e => {
  console.log("clikkkk", e);
  const [{ hyper }, { posts }, postsData] = await Promise.all([
    import("hyperhtml/esm"),
    import("./posts"),
    fetch("/posts").then(resp => resp.json()),
  ]);
  const container = document.querySelector("#posts");
  await hyper(container)`${posts({
    render: hyper,
    model: { posts: postsData },
  })}`;
};
