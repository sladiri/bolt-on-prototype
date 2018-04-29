export const dynamicImportButton = async ({ render }) => {
  if (typeof document === "object") {
    // SSR does not support pcss imports
    // @ts-ignore
    await import("./dynamic-import-test.pcss");
  }

  return render`
    <section id="dynamicImportButton">
      <h2>Dynamic Import Test</h2>
      <button onclick="${onClick}">Import</button>
    </section>
    `;
};

const onClick = e => {
  console.log("clikkkk", e);
};
