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
              disabled=${props.model._replay}
              onclick=${props.dispatch(update2, post.title)}
            >${post.content}</p>
          </li>
        `;
      },
  );
  return result;
};

const update = props =>
  function(event) {
    console.log("propose test", this, props, event);
    props.propose({ title: `${Math.random()}` });
  };

const update2 = data =>
  function(event) {
    console.log("dispatch test", this, event, data);
    return { title: `${Math.random()}` };
  };
