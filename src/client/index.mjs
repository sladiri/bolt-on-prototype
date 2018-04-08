export const app = (async () => {
  let dynamicImportSupported = false;
  try {
    Function('import("")');
    dynamicImportSupported = true;
    console.log(dynamicImportSupported);
  } catch (err) {
    console.log(dynamicImportSupported);
  }

  const renderPosts = async container => {
    const posts = await fetch("/posts").then(resp => resp.json());
    const html = posts.reduce((html, post) => {
      return `${html}
    <li class="post">
      <h2>${post.title}</h2>
      <div class="summary">${post.summary}</div>
      <p>${post.content}</p>
    </li>`;
    }, "");

    // CAREFUL: assumes html is sanitized.
    container.innerHTML = `<ul id="posts">${html}</ul>`;
  };

  const container = document.querySelector("#container");

  const PRE_RENDERED = container.querySelector("#posts");
  if (PRE_RENDERED) {
    console.log("Prerendered, abort");
    return;
  }

  await renderPosts(container);
})();
