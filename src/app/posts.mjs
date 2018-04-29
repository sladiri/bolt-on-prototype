export const posts = container => async ({ render, wire, model, dispatch }) => {
  if (typeof document === "object") {
    // @ts-ignore
    await import("./posts.pcss");
  }

  const result = model.posts.map(
    // any object can be wired
    // to a declarative content
    post =>
      // this will return, per each item
      // an actual <LI> DOM node
      {
        return wire(post)`
          <li class="posts posts__post" onclick="${dispatch(
            onClick,
            post.title,
          )}">
            <h2 class="posts posts__title">${post.title}</h2>
            <span class="posts posts__summary">${post.summary}</span>
            <p class="posts posts__content">${post.content}</p>
          </li>
        `;
      },
  );

  // return result;
  return render(container)`
    <ul class="posts">
      ${result}
    </ul>
  `;
};

const onClick = (e, data) => {
  window.dispatcher.dispatch(
    Promise.resolve({ action: "postClicked", payload: data }),
  );
};
