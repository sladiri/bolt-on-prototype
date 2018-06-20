export const Accept = ({ state }) => {
    return async ({ proposal }) => {
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
        } catch (error) {
            console.error("Acceptor error", error);
            throw error;
        }
    };
};

export const nextAction = ({ state, actions }) => {};
