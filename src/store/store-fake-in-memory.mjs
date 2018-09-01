import assert from "assert";

export const FakeStore = ({ db = new Map() }) => {
    assert(db instanceof Map, "FakeStore db instanceof Map");
    const store = Object.seal(
        Object.assign(Object.create(null), {
            get: Get({ db }),
            put: Put({ db }),
        }),
    );
    return store;
};

export const Get = ({ db }) => async ({ key }) => {
    assert(key, "fakeStore.get key");
    const stored = db.get(key);
    return stored;
};

export const Put = ({ db }) => async ({ key, value }) => {
    assert(key, "fakeStore.put key");
    assert(value, "fakeStore.put value");
    db.set(key, value);
};
