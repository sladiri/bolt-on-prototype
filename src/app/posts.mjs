export const posts = async ({
  render,
  model: {
    posts,
    ssrAction = (hook, ...data) => e => hook.call(null, e, ...data),
  },
}) => {
  if (typeof document === "object") {
    await import("./posts.pcss");
  }

  const result = posts.map(
    // any object can be wired
    // to a declarative content
    post =>
      // this will return, per each item
      // an actual <LI> DOM node
      {
        return render(post)`
          <li class="posts posts__post" onclick="${ssrAction(
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

  return render`
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
