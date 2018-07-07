export const Accept = ({ service }) => {
    console.assert(typeof service === "function", "Accept service");
    const ensureService = (() => {
        let ensured;
        return async () => {
            if (ensured) {
                return;
            }
            const { ensureDb, ensureShim } = await service();
            console.assert(ensureDb, "Accept ensureDb");
            db = await ensureDb();
            shim = await ensureShim();
            ensured = true;
        };
    })();
    let db;
    let shim;
    return async ({ state, proposal }) => {
        assertState({ state });
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
            if (Number.isSafeInteger(proposal.foo)) {
                state.foo = proposal.foo;
            }
        } catch (error) {
            console.error("accept error", error);
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
    console.assert(
        state.busy === true || state.busy === false,
        "Model state.busy",
    );
};
