import PouchDB from "pouchdb";

export const _Actions = ({ propose, service }) => {
    return Object.assign(Object.create(null), {
        async foo() {
            const info = await service.db.info();
            console.log(info);
        },
    });
};

export const Actions = ({ propose }) => {
    const db = new PouchDB(`${window.location.origin}/api/couch/kittens`);
    const actions = _Actions({
        propose,
        service: { db },
    });
    return actions;
};
