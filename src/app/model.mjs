export const accept = async ({ state, proposal }) => {
    try {
        if (proposal.name) {
            state.name = await Promise.resolve(`${proposal.name}!`);
        }
        if (Array.isArray(proposal.posts)) {
            for (const post of proposal.posts) {
                const index = state.posts.findIndex(
                    x => x.title === post.title,
                );
                if (index !== -1) {
                    Object.assign(state.posts[index], post);
                } else {
                    state.posts.push(post);
                }
            }
        }
        if (proposal.counter !== undefined) {
            if (proposal.counter === null) {
                state.counter = 10;
            } else {
                if (state.counter + proposal.counter >= 0) {
                    state.counter += proposal.counter;
                }
            }
        }
        if (proposal.todoId !== undefined) {
            const { todoId, ...attrs } = proposal;
            if (todoId) {
                const index = state.todos.findIndex(x => x.id === todoId);
                if (index !== -1) {
                    Object.assign(state.todos[index], attrs);
                }
            } else {
                state.todos.push({
                    id: Math.random(),
                    ...attrs,
                    text: attrs.text.trim(),
                });
            }
        }
    } catch (error) {
        console.error("Acceptor error", error);
        throw error;
    }
};

export const Accept = ({ state }) => proposal => {
    return accept({ state, proposal });
};

export const nextAction = ({ state, actions }) => {
    if (state.counter > 0 && state.counter < 10) {
        return actions.countDown();
    }
};
