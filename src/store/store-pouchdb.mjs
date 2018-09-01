import assert from "assert";

export const StorePouchDb = ({ db }) => {
    assert(db, "StorePouchDb db");
    const store = Object.seal(
        Object.assign(Object.create(null), {
            get: Get({ db }),
            put: Put({ db }),
        }),
    );
    return store;
};

export const Get = ({ db }) => async ({ key }) => {
    assert(key, "storePouchDb.get key");
};

export const Put = ({ db }) => async ({ key, value }) => {
    assert(key, "storePouchDb.put key");
    assert(value, "storePouchDb.put value");
};
