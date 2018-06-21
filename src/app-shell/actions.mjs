export const Actions = ({ propose, service }) => {
    console.assert(propose && typeof propose === "function", "Actions propose");
    const ensureService = (() => {
        let ensured;
        return async () => {
            if (ensured) {
                return;
            }
            console.assert(
                service && typeof service === "function",
                "Actions service",
            );
            const { ensureDb } = await service();
            console.assert(ensureDb, "Actions ensureDb");
            db = await ensureDb();
            ensured = true;
        };
    })();
    let db;
    return Object.assign(Object.create(null), {
        async dbInfo() {
            await ensureService();
            const info = await db.info();
            console.log(info);
        },
    });
};
