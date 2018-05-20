export const FetchPosts = ({ fetchPosts }) => {
    return async function(event) {
        this.setAttribute("disabled", "true");
        await fetchPosts();
        this.removeAttribute("disabled");
    };
};

export const FetchPostsSSR = (...args) => {
    return async function(event, action) {
        this.setAttribute("disabled", "true");
        await action();
        this.removeAttribute("disabled");
    };
};

export const _postItem = props => {
    const { render, post } = props;
    return render(post)`
        <li class="posts posts__post">
            <h2 class="posts posts__title">${post.title}</h2>
            <span class="posts posts__summary">${post.summary}</span>
            <p class="posts posts__content">${post.content}</p>
        </li>
    `;
};

export const postItem = post => (props, namespace) => {
    const state = { post };
    return props.connect(_postItem, state, namespace);
};

export const _posts = props => {
    if (typeof document === "object") {
        // @ts-ignore
        import("./posts.pcss");
    }
    const { render, dispatch, name, posts, fetchPosts } = props;
    return render()`
        <section>
            <h1>Posts List, ${name}</h1>
            <button onclick=${FetchPosts({ fetchPosts })}>Fetch Posts</button>
            <button
                onclick=${dispatch("fetchPosts", FetchPostsSSR, 42, 666)}
            >
                Fetch Posts SSR
            </button>
            <ul class="posts">
                ${posts.map(post => postItem(post)(props, render))}
            </ul>
        </section>
    `;
};

export const posts = (props, namespace) => {
    const state = {
        name: props._state.name,
        posts: props._state.posts,
        dispatch: props._actions.dispatch,
        fetchPosts: props._actions.fetchPosts,
    };
    return props.connect(_posts, state, namespace);
};
