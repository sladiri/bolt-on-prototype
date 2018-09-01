import assert from "assert";

export const Accept = ({ service }) => {
    assert(typeof service === "function", "Accept service");
    const ensureService = (() => {
        let ensured;
        return async () => {
            if (ensured) {
                return;
            }
            const { ensureDb, ensureShim } = await service();
            assert(ensureDb, "Accept ensureDb");
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
            shim.upsert({ key: "state", value: state });
        } catch (error) {
            console.error("accept error", error);
            throw error;
        }
    };
};

export const nextAction = ({ state, actions }) => {};

export const assertState = ({ state }) => {
    assert(state, "Model state");
    assert(typeof state.route === "string", "Model state.route");
    assert(
        typeof state.query === "object" && state.query !== null,
        "Model state.query",
    );
    assert(typeof state.title === "string", "Model state.title");
    assert(typeof state.description === "string", "Model state.description");
    assert(state.busy === true || state.busy === false, "Model state.busy");
};
