export const FetchPosts = ({ fetchPosts }) => {
    return async function(event) {
        this.setAttribute("disabled", "true");
        await fetchPosts();
        this.removeAttribute("disabled");
    };
};

export const CancelFetch = ({ fetchPosts }) => {
    return async function(event) {
        await fetchPosts({ cancel: true });
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
    return props.connect(_postSummary, state);
};

export const _postItem = props => {
    const { render, connect, title, summary, content } = props;
    return render`
        <li class="posts posts__post">
            <h2 class="posts posts__title">${title}</h2>
            ${connect(postSummary, { summary })}
            <p class="posts posts__content">${content}</p>
        </li>
    `;
};

export const _posts = props => {
    if (typeof document === "object") {
        import("./posts.pcss");
    }
    const { render, connect, dispatch, name, posts, fetchPosts } = props;
    const onClick = dispatch("fetchPosts", FetchPostsSSR, 42, 666);
    const postItem = post => {
        return connect(_postItem, { ...post }, post);
    };
    return render`
        <section>
            <h1>Posts List, ${name}</h1>
            <button onclick=${FetchPosts({ fetchPosts })}>Fetch Posts</button>
            <button
                onclick=${onClick}
            >
                Fetch Posts SSR
            </button>
            <button onclick=${CancelFetch({ fetchPosts })}>Cancel Fetch</button>
            <ul class="posts">
                ${posts.map(postItem)}
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
    return props.connect(_posts, state);
};
