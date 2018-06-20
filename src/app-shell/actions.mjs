export const Actions = ({ propose, service }) => {
    console.assert(service, "Actions require service");
    let db;
    const ensureDB = async () => {
        db = db || (await service()).db;
        console.assert(db, "Actions require DB service");
    };
    return Object.assign(Object.create(null), {
        async foo() {
            await ensureDB();
            const info = await db.info();
            console.log(info);
        },
    });
};
