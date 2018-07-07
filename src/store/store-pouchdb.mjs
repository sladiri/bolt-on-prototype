export const StorePouchDb = ({ db }) => {
    console.assert(db, "StorePouchDb db");
    const store = Object.seal(
        Object.assign(Object.create(null), {
            get: Get({ db }),
            put: Put({ db }),
        }),
    );
    return store;
};

export const Get = ({ db }) => async ({ key }) => {
    console.assert(key, "storePouchDb.get key");
};

export const Put = ({ db }) => async ({ key, value }) => {
    console.assert(key, "storePouchDb.put key");
    console.assert(value, "storePouchDb.put value");
};
