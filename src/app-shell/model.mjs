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

                if (!(await shim.get({ key: "parent" }))) {
                    const parentToStore = { key: "parent", value: 42 };
                    await shim.upsert(parentToStore);
                    const parentStored = await shim.get({
                        key: parentToStore.key,
                    });
                    const parentToStore2 = { key: "parent2", value: 666 };
                    await shim.upsert(parentToStore2);
                    const parentStored2 = await shim.get({
                        key: parentToStore2.key,
                    });
                    const after = new Set([parentStored, parentStored2]);
                    const childToStore = { key: "child", value: 123, after };
                    // debugger;
                    await shim.upsert(childToStore);
                    const childStored = await shim.get({
                        key: childToStore.key,
                    });
                    const childToStore2 = {
                        key: "child",
                        value: 456,
                    };
                    await shim.upsert(childToStore2);
                    const childStored2 = await shim.get({
                        key: childToStore2.key,
                    });
                    console.log(
                        "parentStored.clock",
                        parentStored.clock,
                        "\nparentStored.deps",
                        [...parentStored.deps.all().entries()].map(
                            ([key, v]) => ({
                                key,
                                clock: [...v.clock.entries()],
                            }),
                        ),
                        "\nparentStored.deps/parent.clock",
                        parentStored.deps.all().get("parent").clock,
                    );
                    console.log(
                        "childStored.clock",
                        childStored.clock,
                        "\nchildStored.deps",
                        [...childStored.deps.all().entries()].map(
                            ([key, v]) => ({
                                key,
                                clock: [...v.clock.entries()],
                            }),
                        ),
                        "\nchildStored.deps/parent.clock",
                        childStored.deps.all().get("parent").clock,
                        "\nchildStored.deps/child.clock",
                        childStored.deps.all().get("child").clock,
                    );
                    console.log(
                        "childStored2.clock",
                        childStored2.clock,
                        "\nchildStored2.deps",
                        [...childStored2.deps.all().entries()].map(
                            ([key, v]) => ({
                                key,
                                clock: [...v.clock.entries()],
                            }),
                        ),
                        "\nchildStored2.deps/parent.clock",
                        childStored2.deps.all().get("parent").clock,
                        "\nchildStored2.deps/child.clock",
                        childStored2.deps.all().get("child").clock,
                    );
                }
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
