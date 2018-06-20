export const Actions = ({ propose, service }) => {
    console.assert(service && service.db, "Actions require DB service");
    return Object.assign(Object.create(null), {
        async foo() {
            const info = await service.db.info();
            console.log(info);
        },
    });
};
