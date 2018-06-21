import {
    assertWrapped,
    serialiseWrapped,
    deserialiseWrapped,
} from "./wrapped-value";

export const Store = ({ db }) => {
    console.warn("Store not implemented");
    console.assert(db, "Store db");
    const store = Object.seal(
        Object.assign(Object.create(null), {
            get: Get({ db }),
            put: Put({ db }),
        }),
    );
    return store;
};

const fakeStore = new Map();

export const Get = ({ db }) => async ({ key }) => {
    console.assert(key, "store.get key");
    const stored = fakeStore.get(key);
    if (!stored) {
        return;
    }
    const wrapped = deserialiseWrapped({ stored });
    return wrapped;
};

export const Put = ({ db }) => async ({ key, wrapped, serialised }) => {
    console.assert(key, "store.put key");
    console.assert(
        wrapped ? !serialised : serialised,
        "store.put wrapped XOR serialised",
    );
    if (wrapped) {
        assertWrapped({ wrapped });
    }
    const toStore = serialised || serialiseWrapped({ wrapped });
    fakeStore.set(key, toStore);
};
