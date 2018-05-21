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

export const _postSummary = props => {
    const { render, summary, name } = props;
    return render`
        <span class="posts posts__summary">${summary}, ${name}</span>
    `;
};

export const postSummary = props => {
    const state = {
        summary: props.summary,
        name: props._state.name,
    };
    return props.connect(_postSummary, props, state);
};

export const postItem = props => {
    const { render, connect, post } = props;
    return render`
        <li class="posts posts__post">
            <h2 class="posts posts__title">${post.title}</h2>
            ${connect(postSummary, props, { summary: post.summary })}
            <p class="posts posts__content">${post.content}</p>
        </li>
    `;
};

export const _posts = props => {
    if (typeof document === "object") {
        // @ts-ignore
        import("./posts.pcss");
    }
    const { render, connect, dispatch, name, posts, fetchPosts } = props;
    const onClick = dispatch("fetchPosts", FetchPostsSSR, 42, 666);
    return render`
        <section>
            <h1>Posts List, ${name}</h1>
            <button onclick=${FetchPosts({ fetchPosts })}>Fetch Posts</button>
            <button
                onclick=${onClick}
            >
                Fetch Posts SSR
            </button>
            <ul class="posts">
                ${posts.map((post, i) => connect(postItem, props, { post }, i))}
            </ul>
        </section>
    `;
};

export const posts = props => {
    const state = {
        name: props._state.name,
        posts: props._state.posts,
        dispatch: props._actions.dispatch,
        fetchPosts: props._actions.fetchPosts,
    };
    return props.connect(_posts, props, state);
};
