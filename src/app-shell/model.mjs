export const Accept = ({ state }) => {
    return async proposal => {
        try {
            if (proposal.route !== undefined) {
                state.route = proposal.route;
            }
            if (proposal.query !== undefined) {
                Object.assign(state.query, proposal.query);
            }
            if (proposal.title !== undefined) {
                state.title = proposal.title;
            }
            if (proposal.description !== undefined) {
                state.description = proposal.description;
            }
            if (proposal.rand !== undefined) {
                state.rand = proposal.rand;
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
            const { counterId, counter } = proposal;
            if (counterId !== undefined && counter !== undefined) {
                const { counters } = state;
                if (counter === null) {
                    counters[counterId] = 20;
                } else {
                    if (counters[counterId] + counter >= 0) {
                        counters[counterId] += counter;
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
};

export const nextAction = ({ state, actions }) => {
    for (const [counterId, counter] of state.counters.entries()) {
        if (counter > 0 && counter < 20) {
            actions.countDown({ counterId });
        }
    }
};
