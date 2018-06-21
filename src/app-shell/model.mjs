export const Accept = ({ state, service }) => {
    assertState({ state });
    const ensureService = (() => {
        let ensured;
        return async () => {
            if (ensured) {
                return;
            }
            console.assert(
                service && typeof service === "function",
                "Model service",
            );
            const { ensureDb } = await service();
            console.assert(ensureDb, "Model ensureDb");
            db = await ensureDb();
            ensured = true;
        };
    })();
    let db;
    return async ({ proposal }) => {
        await ensureService();
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
    console.assert(state, "Model state");
    console.assert(typeof state.route === "string", "Model state.route");
    console.assert(
        typeof state.query === "object" && state.query !== null,
        "Model state.query",
    );
    console.assert(typeof state.title === "string", "Model state.title");
    console.assert(
        typeof state.description === "string",
        "Model state.description",
    );
};
