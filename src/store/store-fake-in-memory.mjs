export const FakeStore = ({ db = new Map() }) => {
    console.assert(db instanceof Map, "FakeStore db instanceof Map");
    const store = Object.seal(
        Object.assign(Object.create(null), {
            get: Get({ db }),
            put: Put({ db }),
        }),
    );
    return store;
};

export const Get = ({ db }) => async ({ key }) => {
    console.assert(key, "fakeStore.get key");
    const stored = db.get(key);
    return stored;
};

export const Put = ({ db }) => async ({ key, value }) => {
    console.assert(key, "fakeStore.put key");
    console.assert(value, "fakeStore.put value");
    db.set(key, value);
};
