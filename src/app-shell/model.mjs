export const Accept = ({ state, service }) => {
    assertState({ state });
    console.assert(service, "Model requires service");
    let db;
    const ensureDB = async () => {
        db = db || (await service()).db;
        console.assert(db, "Model requires DB service");
    };
    return async ({ proposal }) => {
        await ensureDB();
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

export const assertState = ({ state }) => {
    console.assert(state, "Model requires state");
    console.assert(
        typeof state.route === "string",
        "Model requires state.route",
    );
    console.assert(
        typeof state.query === "object" && state.query !== null,
        "Model requires state.query",
    );
    console.assert(
        typeof state.title === "string",
        "Model requires state.title",
    );
    console.assert(
        typeof state.description === "string",
        "Model requires state.description",
    );
};
