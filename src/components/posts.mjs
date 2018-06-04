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
    const { render, summary, rand } = props;
    return render`
        <p class="posts posts__summary">${summary}, ${rand}</p>
        `;
};

export const postSummary = props => {
    const state = {
        summary: props.summary,
        rand: props.state.rand,
    };
    return props.cn(_postSummary, state);
};

export const _postItem = props => {
    const { render, cn, title, summary, content } = props;
    return render`
        <li class="posts posts__post">
            <p class="posts posts__title">${title}</p>
            ${cn(postSummary, { summary })}
            <p class="posts posts__content">${content}</p>
        </li>
        `;
};

export const _posts = props => {
    if (typeof window === "object") {
        import("./posts.pcss");
    }
    const { render, cn, dispatch, posts, fetchPosts } = props;
    const onClick = dispatch("fetchPosts", FetchPostsSSR, 42, 666);
    const postItem = post => {
        return cn(_postItem, { ...post }, post);
    };
    return render`
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
        `;
};

export const posts = props => {
    const state = {
        posts: props.state.posts,
        fetchPosts: props.actions.fetchPosts,
    };
    return props.cn(_posts, state);
};
