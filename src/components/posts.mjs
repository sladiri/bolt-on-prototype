export const Posts = ({ fetchPosts, postItem }) => async props => {
    if (typeof document === "object") {
        // @ts-ignore
        await import("./posts.pcss");
    }
    const { render, state, dispatch } = props;
    return render(state)`
        <section>
            <h1>Posts List, ${state.name}</h1>
            <button onclick=${fetchPosts(props)}>Fetch Posts</button>
            <button
                onclick=${dispatch("fetchPosts", fetchPostsSSR, 42, 666)}
            >
                Fetch Posts SSR
            </button>
            <ul class="posts">
                ${state.posts.map(post => postItem({ ...props, post }))}
            </ul>
        </section>
    `;
};

export const fetchPostsSSR = (...args) => {
    return async function(event, action) {
        this.setAttribute("disabled", "true");
        await action();
        this.removeAttribute("disabled");
    };
};

export const fetchPosts = props => {
    return async function(event) {
        this.setAttribute("disabled", "true");
        await props.actions.fetchPosts();
        this.removeAttribute("disabled");
    };
};

export const postItem = ({ render, post }) => {
    return render(post)`
        <li class="posts posts__post">
            <h2 class="posts posts__title">${post.title}</h2>
            <span class="posts posts__summary">${post.summary}</span>
            <p class="posts posts__content">${post.content}</p>
        </li>
    `;
};

export const posts = Posts({ fetchPosts, postItem });
