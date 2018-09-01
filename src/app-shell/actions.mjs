import assert from "assert";

export const Actions = ({ service }) => {
    assert(typeof service === "function", "Actions service");
    const ensureService = (() => {
        let ensured;
        return async () => {
            if (ensured) {
                return;
            }
            assert(service && typeof service === "function", "Actions service");
            const { ensureDb, ensureShim } = await service();
            assert(ensureDb, "Actions ensureDb");
            db = await ensureDb();
            shim = await ensureShim();
            ensured = true;
        };
    })();
    let db;
    let shim;
    let foo = 1;
    return Object.seal(
        Object.assign(Object.create(null), {
            dbInfo: () => async () => {
                await ensureService();
            },
            fooIncrement: propose => async () => {
                await propose({ foo });
                foo += 1;
            },
        }),
    );
};
