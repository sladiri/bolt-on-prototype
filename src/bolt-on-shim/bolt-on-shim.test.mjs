import test from "tape";
import jsc from "jsverify";
import jscCommands from "jsverify-commands"; // removed babel-polyfill from src
import R from "ramda";
import { FakeStore } from "../store/store-fake-in-memory";
import { Shim } from "./bolt-on-shim";
import { Dependency, Dependencies } from "./control/dependencies";
import {
    Wrapped,
    serialiseWrapped,
    deserialiseWrapped,
} from "./control/wrapped-value";

const serialisable_ = jsc.oneof([
    jsc.integer,
    jsc.asciinestring,
    jsc.constant([]),
    jsc.constant({}),
    jsc.constant(null),
]);
const shimId_ = jsc.asciinestring;
const tick_ = jsc.suchthat(jsc.nat, x => Number.isSafeInteger(x + 1));
const key_ = jsc.asciinestring;
const value_ = serialisable_;
const keyValuePairs_ = jsc.suchthat(
    jsc.suchthat(
        jsc.nearray(jsc.tuple([key_, value_])),
        keyValuePairs =>
            R.uniq(keyValuePairs.map(([k]) => k)).length ===
            keyValuePairs.length,
    ),
    keyValuePairs => keyValuePairs.length > 0,
);
const keyValuePairsWithParents_ = jsc.suchthat(
    jsc.tuple([shimId_, tick_, keyValuePairs_]),
    ([, tick, keyValuePairs]) =>
        Number.isSafeInteger(tick + keyValuePairs.length),
);

const keyValuePairsWithParentsWithValues_ = jsc.suchthat(
    jsc.tuple([keyValuePairsWithParents_, jsc.array(value_)]),
    ([[, tick, keyValuePairs], valuesNew]) =>
        Number.isSafeInteger(tick + keyValuePairs.length + valuesNew.length),
);

const getShim = ({ localDb, ecdsDb, shimId = "a", tick = 10 }) => {
    const localStore = FakeStore({ db: localDb });
    const ecdsStore = FakeStore({ db: ecdsDb });
    const shim = Shim({ localStore, ecdsStore, shimId, tick });
    return shim;
};

const wrap = ({ shimId, tick, key, value, after = new Set() }) => {
    const deps = Dependencies({ after });
    const clock = new Map([[shimId, tick]]);
    const dependency = Dependency({ clock });
    dependency.setClockTick({ shimId, tick });
    deps.put({ key, dependency });
    const wrapped = Wrapped({ key, value, deps });
    return { clock, wrapped };
};

const store = async ({ shim, keyValuePairs }) => {
    const result = new Set();
    for (const [key, value] of keyValuePairs) {
        const toStore = { key, value };
        await shim.upsert(toStore);
        const stored = await shim.get({ key });
        result.add(stored);
    }
    return result;
};

const wrapAndStoreParents = async ({ shim, shimId, tick, keyValuePairs }) => {
    const [childKeyValuePair, ...parentKeyValuePairs] = keyValuePairs;
    const parentSet = await store({
        shim,
        keyValuePairs: parentKeyValuePairs,
    });
    const [key, value] = childKeyValuePair;
    const { wrapped } = wrap({
        shimId,
        tick: tick + parentKeyValuePairs.length,
        key,
        value,
        after: parentSet,
    });
    await shim.upsert({ key, value, after: parentSet });
    return { key, wrapped };
};

const jscOptions = { tests: 1000, quiet: false };

test("shim - returns from local-store or ECDS / generative", async t => {
    const compareStored = async ({ db, shim, shimId, tick, keyValuePairs }) => {
        const { key, wrapped } = await wrapAndStoreParents({
            shim,
            shimId,
            tick,
            keyValuePairs,
        });
        const serialised = serialiseWrapped({ wrapped });
        db.set(key, serialised);

        const stored = await shim.get({ key });

        return serialised === serialiseWrapped({ wrapped: stored });
    };

    try {
        const property = jsc.forall(
            keyValuePairsWithParents_,
            async ([shimId, tick, keyValuePairs]) => {
                const localDb = new Map();
                const shimLocal = getShim({ localDb, shimId, tick });

                const ecdsDb = new Map();
                const shimEcds = getShim({ ecdsDb, shimId, tick });

                return (
                    (await compareStored({
                        db: localDb,
                        shim: shimLocal,
                        shimId,
                        tick,
                        keyValuePairs,
                    })) &&
                    (await compareStored({
                        db: ecdsDb,
                        shim: shimEcds,
                        shimId,
                        tick,
                        keyValuePairs,
                    }))
                );
            },
        );
        t.equal(await jsc.check(property, jscOptions), true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - UPSERT advances clock and value is updated / generative", async t => {
    try {
        const property = jsc.forall(
            keyValuePairsWithParentsWithValues_,
            async ([[shimId, tick, keyValuePairs], valuesNew]) => {
                const shim = getShim({ shimId, tick });

                const { key } = await wrapAndStoreParents({
                    shim,
                    shimId,
                    tick,
                    keyValuePairs,
                });

                let ok = true;
                for (const value of valuesNew) {
                    const stored = await shim.get({ key });
                    await shim.upsert({ key, value });
                    const upserted = await shim.get({ key });

                    ok =
                        ok &&
                        (upserted.clock.compare({
                            clock: stored.clock,
                        }).happensAfter &&
                            JSON.stringify(upserted.value) ===
                                JSON.stringify(value));
                }

                return ok;
            },
        );
        t.equal(await jsc.check(property, jscOptions), true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - ECDS updated values applied to local-store / generative", async t => {
    try {
        const property = jsc.forall(
            keyValuePairsWithParentsWithValues_,
            async ([[shimId, tick, keyValuePairs], valuesNew]) => {
                const localDb = new Map();
                const ecdsDb = new Map();
                const shim = getShim({ localDb, ecdsDb, shimId, tick });

                const { key } = await wrapAndStoreParents({
                    shim,
                    shimId,
                    tick,
                    keyValuePairs,
                });

                const ecdsObj = JSON.parse(await ecdsDb.get(key));

                let ok = true;
                for (const value of valuesNew) {
                    ecdsObj.value = value;
                    const storedClockTick = Number.parseInt(
                        ecdsObj.depsObj[key].clockObj[shimId],
                    );
                    ecdsObj.depsObj[key].clockObj[shimId] = `${storedClockTick +
                        1}`;
                    const serialisedObj = JSON.stringify(ecdsObj);
                    ecdsDb.set(key, serialisedObj);

                    const wrapped = await shim.get({ key });
                    const stored = serialiseWrapped({ wrapped });
                    const storedLocal = localDb.get(key);
                    const storedEcds = JSON.stringify(ecdsObj);

                    ok =
                        ok &&
                        storedEcds === storedLocal &&
                        storedEcds === stored;
                }

                return ok;
            },
        );
        t.equal(await jsc.check(property, jscOptions), true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - ECDS new keys applied to local-store / generative", async t => {
    try {
        const property = jsc.forall(
            keyValuePairsWithParents_,
            async ([shimId, tick, keyValuePairs]) => {
                const localDb = new Map();
                const ecdsDb = new Map();
                const shim = getShim({ localDb, ecdsDb, shimId, tick });

                let ok = true;
                for (const [key, value] of keyValuePairs) {
                    const missing = await shim.get({ key });
                    const missingLocally = localDb.get(key);

                    ok = ok && missing === null && missingLocally === undefined;

                    const { wrapped: toStore } = wrap({
                        shimId,
                        tick,
                        key,
                        value,
                    });
                    tick += 1;

                    const serialised = serialiseWrapped({ wrapped: toStore });
                    ecdsDb.set(key, serialised);

                    const stored = await shim.get({ key });
                    const storedLocal = localDb.get(key);

                    ok =
                        ok &&
                        serialised === storedLocal &&
                        serialised === serialiseWrapped({ wrapped: stored });
                }

                return ok;
            },
        );
        t.equal(await jsc.check(property, jscOptions), true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - GET hides writes which are not covered", async t => {
    try {
        const ecdsDb = new Map();
        const shimId = "a";
        const tick = 10;
        const shim = getShim({ ecdsDb, shimId, tick });

        const parentToStore = { key: "parent", value: "parent A" };
        await shim.upsert(parentToStore);
        const parentStored = await shim.get({ key: parentToStore.key });

        const childToStore = {
            key: "child",
            value: "child A",
            after: new Set([parentStored]),
        };
        await shim.upsert(childToStore);
        const childStored1 = await shim.get({
            key: childToStore.key,
        });

        const childObj = JSON.parse(
            serialiseWrapped({ wrapped: childStored1 }),
        );
        childObj.value = "child B";
        childObj.depsObj.parent.clockObj.a = "12";
        childObj.depsObj.child.clockObj.a = "13";
        ecdsDb.set(childToStore.key, JSON.stringify(childObj));

        const childStored2 = await shim.get({
            key: childToStore.key,
        });

        t.equal(childStored2.value, "child A");
        t.equal(childStored2.clock.get(shimId), 11);

        const parentObj = JSON.parse(
            serialiseWrapped({ wrapped: parentStored }),
        );
        parentObj.value = "parent B";
        parentObj.depsObj.parent.clockObj.a = "12";
        ecdsDb.set(parentToStore.key, JSON.stringify(parentObj));

        const parentStored2 = await shim.get({ key: parentToStore.key });
        t.equal(parentStored2.value, "parent B");
        t.equal(parentStored2.clock.get(shimId), 12);

        const childStored3 = await shim.get({
            key: childToStore.key,
        });

        t.equal(childStored3.value, "child B");
        t.equal(childStored3.clock.get(shimId), 13);

        t.end();
    } catch (error) {
        t.end(error);
    }
});
