export const posts = async props => {
  if (typeof document === "object") {
    // @ts-ignore
    await import("./posts.pcss");
  }

  const result = props.model.posts.map(
    // any object can be wired
    // to a declarative content
    post =>
      // this will return, per each item
      // an actual <LI> DOM node
      {
        return props.wire(post)`
          <li class="posts posts__post">
            <h2
              class="posts posts__title"
              onclick=${update(props)}
            >${post.title}</h2>
            <span class="posts posts__summary">${post.summary}</span>
            <p
              class="posts posts__content"
              onclick=${props.dispatch(onClick, post.title, post.content)}
            >${post.content}</p>
          </li>
        `;
      },
  );
  return result;
};

const update = props => event => {
  console.log("propose test", this, props, event);
  props.propose({ title: `${Math.random()}` });
};

const onClick = (event, ...data) => {
  console.log("dispatch test", this, data, event);
  return { title: `${Math.random()}` };
};
