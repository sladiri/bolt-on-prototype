export const Posts = ({ fetchPosts, postItems }) => async props => {
  if (typeof document === "object") {
    // @ts-ignore
    await import("./posts.pcss");
  }
  return props.render(props.state)`
    <section>
      <h1>Posts List, ${props.state.name}</h1>
      <button onclick=${fetchPosts(props)}>Fetch Posts</button>
      <ul class="posts">
        ${postItems(props)}
      </ul>
    </section>
  `;
};

export const fetchPosts = props =>
  async function(event) {
    this.setAttribute("disabled", "true");
    await props.actions.fetchPosts.call(this, event);
    this.removeAttribute("disabled");
  };

export const postItems = props =>
  props.state.posts.map(post => {
    return props.render(post)`
      <li class="posts posts__post">
        <h2
          class="posts posts__title"
        >${post.title}</h2>
        <span class="posts posts__summary">${post.summary}</span>
        <p
          class="posts posts__content"
        >${post.content}</p>
      </li>
    `;
  });

export const posts = Posts({ fetchPosts, postItems });
