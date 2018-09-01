import test from "tape";
// import jsc from "jsverify";
import R from "ramda";
import { FakeStore } from "../store/store-fake-in-memory";
import { Shim } from "./bolt-on-shim";
import { Dependency, Dependencies } from "./control/dependencies";
import {
    Wrapped,
    serialiseWrapped,
    deserialiseWrapped,
} from "./control/wrapped-value";

const shuffler = R.curry((random, list) => {
    if (list.length < 2) {
        return list;
    }
    const len = list.length;
    let idx = -1;
    let position;
    const result = [];
    while (++idx < len) {
        position = Math.floor((idx + 1) * random());
        result[idx] = result[position];
        result[position] = list[idx];
    }
    return result;
});

const pickRandom = list => shuffler(Math.random, list)[0];

const getShim = ({
    localDb = undefined,
    ecdsDb = undefined,
    shimId = "a",
    tick = 1,
}) => {
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

// #region

// const serialisable_ = jsc.oneof([
//     jsc.integer,
//     jsc.asciinestring,
//     jsc.constant([]),
//     jsc.constant({}),
//     jsc.constant(null),
// ]);
// const shimId_ = jsc.asciinestring;
// const tick_ = jsc.suchthat(jsc.nat, x => Number.isSafeInteger(x + 1));
// const key_ = jsc.asciinestring;
// const value_ = serialisable_;
// const keyValuePairs_ = jsc.suchthat(
//     jsc.suchthat(
//         jsc.nearray(jsc.tuple([key_, value_])),
//         keyValuePairs =>
//             R.uniq(keyValuePairs.map(([k]) => k)).length ===
//             keyValuePairs.length,
//     ),
//     keyValuePairs => keyValuePairs.length > 0,
// );
// const keyValuePairsWithParents_ = jsc.suchthat(
//     jsc.tuple([shimId_, tick_, keyValuePairs_]),
//     ([, tick, keyValuePairs]) =>
//         Number.isSafeInteger(tick + keyValuePairs.length),
// );

// const keyValuePairsWithParentsWithValues_ = jsc.suchthat(
//     jsc.tuple([keyValuePairsWithParents_, jsc.array(value_)]),
//     ([[, tick, keyValuePairs], valuesNew]) =>
//         Number.isSafeInteger(tick + keyValuePairs.length + valuesNew.length),
// );

// const jscOptions = { tests: 100, quiet: false };

// test("shim - returns from local-store or ECDS / property", async t => {
//     const compareStored = async ({ db, shim, shimId, tick, keyValuePairs }) => {
//         const { key, wrapped } = await wrapAndStoreParents({
//             shim,
//             shimId,
//             tick,
//             keyValuePairs,
//         });
//         const serialised = serialiseWrapped({ wrapped });
//         db.set(key, serialised);

//         const stored = await shim.get({ key });

//         return serialised === serialiseWrapped({ wrapped: stored });
//     };

//     try {
//         const property = jsc.forall(
//             keyValuePairsWithParents_,
//             async ([shimId, tick, keyValuePairs]) => {
//                 const localDb = new Map();
//                 const shimLocal = getShim({ localDb, shimId, tick });

//                 const ecdsDb = new Map();
//                 const shimEcds = getShim({ ecdsDb, shimId, tick });

//                 return (
//                     (await compareStored({
//                         db: localDb,
//                         shim: shimLocal,
//                         shimId,
//                         tick,
//                         keyValuePairs,
//                     })) &&
//                     (await compareStored({
//                         db: ecdsDb,
//                         shim: shimEcds,
//                         shimId,
//                         tick,
//                         keyValuePairs,
//                     }))
//                 );
//             },
//         );
//         t.equal(await jsc.check(property, jscOptions), true);

//         t.end();
//     } catch (error) {
//         t.end(error);
//     }
// });

// test("shim - ECDS new keys applied to local-store / property", async t => {
//     try {
//         const property = jsc.forall(
//             keyValuePairsWithParents_,
//             async ([shimId, tick, keyValuePairs]) => {
//                 const localDb = new Map();
//                 const ecdsDb = new Map();
//                 const shim = getShim({ localDb, ecdsDb, shimId, tick });

//                 let ok = true;
//                 for (const [key, value] of keyValuePairs) {
//                     const missing = await shim.get({ key });
//                     const missingLocally = localDb.get(key);

//                     ok = ok && missing === null && missingLocally === undefined;

//                     const { wrapped: toStore } = wrap({
//                         shimId,
//                         tick,
//                         key,
//                         value,
//                     });
//                     tick += 1;

//                     const serialised = serialiseWrapped({ wrapped: toStore });
//                     ecdsDb.set(key, serialised);

//                     const stored = await shim.get({ key });
//                     const storedLocal = localDb.get(key);

//                     ok =
//                         ok &&
//                         serialised === storedLocal &&
//                         serialised === serialiseWrapped({ wrapped: stored });
//                 }

//                 return ok;
//             },
//         );
//         t.equal(await jsc.check(property, jscOptions), true);

//         t.end();
//     } catch (error) {
//         t.end(error);
//     }
// });

// test("shim - UPSERT advances clock and value is updated / property", async t => {
//     try {
//         const property = jsc.forall(
//             keyValuePairsWithParentsWithValues_,
//             async ([[shimId, tick, keyValuePairs], valuesNew]) => {
//                 const shim = getShim({ shimId, tick });

//                 const { key } = await wrapAndStoreParents({
//                     shim,
//                     shimId,
//                     tick,
//                     keyValuePairs,
//                 });

//                 let ok = true;
//                 for (const value of valuesNew) {
//                     const stored = await shim.get({ key });
//                     await shim.upsert({ key, value });
//                     const upserted = await shim.get({ key });

//                     ok =
//                         ok &&
//                         (upserted.clock.compare({
//                             clock: stored.clock,
//                         }).happensAfter &&
//                             JSON.stringify(upserted.value) ===
//                                 JSON.stringify(value));
//                 }

//                 return ok;
//             },
//         );
//         t.equal(await jsc.check(property, jscOptions), true);

//         t.end();
//     } catch (error) {
//         t.end(error);
//     }
// });

// test("shim - ECDS updated values applied to local-store / property", async t => {
//     try {
//         const property = jsc.forall(
//             keyValuePairsWithParentsWithValues_,
//             async ([[shimId, tick, keyValuePairs], valuesNew]) => {
//                 const localDb = new Map();
//                 const ecdsDb = new Map();
//                 const shim = getShim({ localDb, ecdsDb, shimId, tick });

//                 const { key } = await wrapAndStoreParents({
//                     shim,
//                     shimId,
//                     tick,
//                     keyValuePairs,
//                 });

//                 const ecdsObj = JSON.parse(await ecdsDb.get(key));

//                 let ok = true;
//                 for (const value of valuesNew) {
//                     ecdsObj.value = value;
//                     const storedClockTick = Number.parseInt(
//                         ecdsObj.depsObj[key].clockObj[shimId],
//                     );
//                     ecdsObj.depsObj[key].clockObj[shimId] = `${storedClockTick +
//                         1}`;
//                     const serialisedObj = JSON.stringify(ecdsObj);
//                     ecdsDb.set(key, serialisedObj);

//                     const wrapped = await shim.get({ key });
//                     const stored = serialiseWrapped({ wrapped });
//                     const storedLocal = localDb.get(key);
//                     const storedEcds = JSON.stringify(ecdsObj);

//                     ok =
//                         ok &&
//                         storedEcds === storedLocal &&
//                         storedEcds === stored;
//                 }

//                 return ok;
//             },
//         );
//         t.equal(await jsc.check(property, jscOptions), true);

//         t.end();
//     } catch (error) {
//         t.end(error);
//     }
// });

// test("shim - GET hides writes which are not covered / property", async t => {
//     const setDepWriteNotCovered = async ({
//         ecdsDb,
//         shim,
//         shimId,
//         key,
//         ecdsObj,
//         childValueNew,
//         parentKey,
//     }) => {
//         const storedDepClockTick = Number.parseInt(
//             ecdsObj.depsObj[parentKey].clockObj[shimId],
//         );
//         ecdsObj.depsObj[parentKey].clockObj[shimId] = `${storedDepClockTick +
//             2}`;

//         ecdsObj.value = childValueNew;
//         const storedChildClockTick = Number.parseInt(
//             ecdsObj.depsObj[key].clockObj[shimId],
//         );
//         ecdsObj.depsObj[key].clockObj[shimId] = `${storedChildClockTick + 3}`;

//         const serialisedObj = JSON.stringify(ecdsObj);
//         ecdsDb.set(key, serialisedObj);

//         const wrappedHidden = await shim.get({ key });

//         return wrappedHidden;
//     };

//     const coverDepWrite = async ({ ecdsDb, shim, shimId, key, parentKey }) => {
//         const parentStored = await shim.get({ key: parentKey });
//         const parentObj = JSON.parse(
//             serialiseWrapped({ wrapped: parentStored }),
//         );
//         const storedParentClockTick = Number.parseInt(
//             parentObj.depsObj[parentKey].clockObj[shimId],
//         );
//         parentObj.depsObj[parentKey].clockObj[
//             shimId
//         ] = `${storedParentClockTick + 2}`;
//         ecdsDb.set(parentKey, JSON.stringify(parentObj));

//         const wrapped = await shim.get({ key });

//         return wrapped;
//     };

//     try {
//         const property = jsc.forall(
//             jsc.suchthat(
//                 keyValuePairsWithParentsWithValues_,
//                 ([[, , keyValuePairs]]) => keyValuePairs.length > 1,
//             ),
//             async ([[shimId, tick, keyValuePairs], valuesNew]) => {
//                 const localDb = new Map();
//                 const ecdsDb = new Map();
//                 const shim = getShim({ localDb, ecdsDb, shimId, tick });

//                 const { key } = await wrapAndStoreParents({
//                     shim,
//                     shimId,
//                     tick,
//                     keyValuePairs,
//                 });

//                 const ecdsObj = JSON.parse(await ecdsDb.get(key));

//                 let ok = true;
//                 for (const childValueNew of valuesNew) {
//                     const parentKeys = Object.keys(ecdsObj.depsObj).filter(
//                         k => k !== key,
//                     );
//                     const parentKeysShuffled = shuffler(
//                         Math.random.bind(Math),
//                         parentKeys,
//                     );
//                     const parentKey = parentKeysShuffled[0];
//                     const child = await shim.get({ key });
//                     const childValueCurrent = child.value;

//                     const wrappedWithHiddenValue = await setDepWriteNotCovered({
//                         ecdsDb,
//                         shim,
//                         shimId,
//                         key,
//                         ecdsObj,
//                         childValueNew,
//                         parentKey,
//                     });

//                     ok =
//                         ok &&
//                         JSON.stringify(wrappedWithHiddenValue.value) ===
//                             JSON.stringify(childValueCurrent);

//                     const wrapped = await coverDepWrite({
//                         ecdsDb,
//                         shim,
//                         shimId,
//                         key,
//                         parentKey,
//                     });

//                     ok =
//                         ok &&
//                         JSON.stringify(wrapped.value) ===
//                             JSON.stringify(childValueNew);
//                 }

//                 return ok;
//             },
//         );
//         t.equal(await jsc.check(property, jscOptions), true);

//         t.end();
//     } catch (error) {
//         t.end(error);
//     }
// });

// import jscCommands from "../jsc-commands/jscCommands.js"; // removed babel-polyfill from src and allow ES6 classes for commands
// const Command = class {
//     constructor(...args) {
//         this.args = JSON.parse(JSON.stringify(args));
//     }
// };
// test.only("Shim / stateful property-based", async t => {
//     const Save = class extends Command {
//         constructor([key, value]) {
//             super(...arguments);
//             this.key = key;
//             this.value = value;
//         }
//         check(desc, [key]) {
//             // return Math.random() > 0.5;
//             return desc.saved.get(key) === undefined;
//         }
//         async run(impl, desc) {
//             desc.saved.set(this.key, JSON.parse(JSON.stringify(this.value)));
//             desc.tick += 1;

//             const { shim, localDb, ecdsDb } = impl;
//             await shim.upsert({ key: this.key, value: this.value });
//             const ok =
//                 JSON.stringify(JSON.parse(localDb.get(this.key)).value) ===
//                     JSON.stringify(desc.saved.get(this.key)) &&
//                 JSON.stringify(JSON.parse(ecdsDb.get(this.key)).value) ===
//                     JSON.stringify(desc.saved.get(this.key));
//             return ok;
//         }
//         toString() {
//             return `Save([${this.key}, ${this.value}])`;
//         }
//     };

//     const SaveWithParents = class extends Command {
//         constructor([keyValuePairs]) {
//             super(...arguments);
//             this.keyValuePairs = keyValuePairs;
//         }
//         check(desc, [keyValuePairs]) {
//             // return Math.random() > 0.5;
//             // return desc.saved.get(key) === undefined;
//             return true;
//         }
//         async run(impl, desc) {
//             const [
//                 childKeyValuePair,
//                 ...parentKeyValuePairs
//             ] = this.keyValuePairs;
//             const after = new Set();
//             for (const [key, value] of parentKeyValuePairs) {
//                 const toStore = { key, value };
//                 await impl.shim.upsert(toStore);
//                 const stored = await impl.shim.get({ key });
//                 after.add(stored);
//             }
//             const [key, value] = childKeyValuePair;
//             const deps = Dependencies({ after });
//             const clock = new Map([[desc.shimId, desc.tick]]);
//             const dependency = Dependency({ clock });
//             dependency.setClockTick({ shimId: desc.shimId, tick: desc.tick });
//             deps.put({ key, dependency });
//             const wrapped = Wrapped({ key, value, deps });
//         }
//         toString() {
//             return `Save(${this.keyValuePairs})`;
//         }
//     };

//     const Upsert = class extends Command {
//         constructor(value) {
//             super(...arguments);
//             this.value = value;
//         }
//         check(desc) {
//             return desc.saved.size > 0;
//             // return Math.random() > 0.5;
//         }
//         async run(impl, desc) {
//             const { shim } = impl;

//             const key = shuffler(Math.random.bind(Math), [
//                 ...desc.saved.keys(),
//             ])[0];

//             const stored = await shim.get({ key });
//             if (stored === null) {
//                 return false;
//             }

//             desc.tick += 1;

//             const storedTick = stored.clock.get(desc.shimId);
//             const history = desc.upserted.get(key) || new Map();
//             history.set(`${key}-${storedTick}`, stored.value);
//             desc.upserted.set(key, history);

//             await shim.upsert({ key, value: this.value });
//             const upserted = await shim.get({ key });

//             const ok =
//                 upserted.clock.compare({
//                     clock: stored.clock,
//                 }).happensAfter &&
//                 JSON.stringify(upserted.value) === JSON.stringify(this.value);

//             return ok;
//         }
//         toString() {
//             return `UpdateEcds(${this.value})`;
//         }
//     };

//     const Model = ({ shimId, tick }) => {
//         return { shimId, tick, saved: new Map(), upserted: new Map() };
//     };

//     try {
//         const commands = jscCommands.commands(
//             // jscCommands.command(Save, jsc.tuple([key_, value_])),
//             jscCommands.command(SaveWithParents, keyValuePairsWithParents_),
//             jscCommands.command(Upsert, value_),
//         );
//         const warmup = () => {
//             const localDb = new Map();
//             const ecdsDb = new Map();
//             const shimId = "TEST_SHIM_ID";
//             const tick = Number.MIN_SAFE_INTEGER;

//             return new Object({
//                 state: {
//                     shim: getShim({ localDb, ecdsDb, shimId, tick }),
//                     localDb,
//                     ecdsDb,
//                     shimId,
//                     tick,
//                 },
//                 model: Model({ shimId, tick }),
//             });
//         };

//         const teardown = () => {};
//         const settings = { metrics: true, verbose: true };
//         const args = [commands, warmup, teardown, settings];
//         const result = await jsc.assert(jscCommands.forall(...args));
//         t.equal(result, undefined);
//         t.end();
//     } catch (error) {
//         t.end(error);
//     }
// });

// #endregion

import fc from "fast-check";
import assert from "assert";

test("shim - fast-check simple", async t => {
    try {
        const result = await fc.assert(
            fc.asyncProperty(fc.nat(), async x => Number.isInteger(x)),
        );
        t.equal(result, undefined);
        t.end();
    } catch (error) {
        console.log(error);
        t.end(true);
    }
});

test("shim - fast-check model", async t => {
    try {
        const List = class {
            constructor() {
                this.data = [];
            }
            push(x) {
                this.data.push(x);
            }
            pop() {
                this.data.pop();
            }
            size() {
                return this.data.length;
            }
        };

        const Model = () => ({ num: 0 });

        const Push = class {
            constructor(value) {
                this.value = value;
            }
            check(model) {
                return true;
            }
            async run(model, list) {
                list.push(this.value);
                model.num += 1;
            }
            toString() {
                return `push(${this.value})`;
            }
        };

        const Pop = class {
            constructor() {}
            check(model) {
                return model.num > 0;
            }
            async run(model, list) {
                list.pop();
                model.num -= 1;
            }
            toString() {
                return `pop`;
            }
        };

        const Size = class {
            constructor() {}
            check(model) {
                return true;
            }
            async run(model, list) {
                assert(model.num === list.size());
            }
            toString() {
                return `size`;
            }
        };

        const allCommands = [
            fc.integer().map(v => new Push(v)),
            fc.constant(new Pop()),
            fc.constant(new Size()),
        ];

        const result = await fc.assert(
            fc.asyncProperty(fc.commands(allCommands, 10), cmds => {
                const s = () => ({ model: Model(), real: new List() });
                return fc.asyncModelRun(s, cmds);
            }),
            { numRuns: 100 },
        );
        t.equal(result, undefined);
        t.end();
    } catch (error) {
        console.log(error);
        t.end(true);
    }
});

// #region Model-based

const AsyncTestHelper = async (t, promise) => {
    let result;
    try {
        result = (await promise) === undefined;
    } catch (error) {
        console.error(error);
    }
    t.ok(result);
    t.end();
};

const logSample = ({ property, numRuns, short = false }) => {
    const shortRegex = /^.*\(/m;
    for (const [commands] of fc.sample(property, { numRuns })) {
        console.log("Sample =============");
        for (const command of commands) {
            let string = command["cmd"].toString();
            if (short) {
                const match = string.match(shortRegex);
                if (match && typeof match[0] === "string") {
                    string = match[0].trim();
                    string = string.substr(0, string.length - 1);
                }
            }
            console.log(string);
        }
        console.log("");
    }
};

const compareValues = ({ value: a }, { value: b }) => {
    return JSON.stringify(a) === JSON.stringify(b);
};

const filterParentKeys = ({ key, savedKeys, parentIndices }) => {
    if (parentIndices[0] === -1) {
        return savedKeys.filter(k => k !== key);
    }
    if (parentIndices[0] === -2) {
        return [];
    }
    return parentIndices
        .map(i => savedKeys[i])
        .filter(k => k !== key && k !== undefined);
};

const Create = class {
    constructor({ key, value, parentIndices }) {
        this.key = key;
        this.value = value;
        this.parentIndices = parentIndices;
    }
    check(model) {
        return (
            Number.isSafeInteger(model.tick + 1) && !model.keys.has(this.key)
        );
    }
    async run(model, shim) {
        // console.log("Create", model.shimId);
        const { key, value, parentIndices } = this;
        const { childParents, parentChildren } = model;
        const savedKeys = [...model.keys.values()];
        const parentKeys = filterParentKeys({
            key,
            savedKeys,
            parentIndices,
        }).filter(k => !model.hiddenEcdsUpdates.has(k));

        childParents.set(key, new Set());
        const after = new Map();
        for (const parentKey of parentKeys) {
            const parent = await shim.get({ key: parentKey });
            after.set(parentKey, parent);
            childParents.get(key).add(parentKey);
            if (!parentChildren.get(parentKey)) {
                parentChildren.set(parentKey, new Set());
            }
            parentChildren.get(parentKey).add(key);
        }

        model.keys.add(key);
        model.tick += 1;

        await shim.upsert({ key, value, after });

        const upserted = await shim.get({ key });
        assert(compareValues(upserted, this));

        const child = await shim.get({ key });
        for (const parentKey of parentKeys) {
            const parent = await shim.get({ key: parentKey });
            const causality = child.clock.compare({ clock: parent.clock });
            assert(!causality.happensBefore);
        }
    }
    toString() {
        return `
            create(
                key=${JSON.stringify(this.key)}
                value=${JSON.stringify(this.value)}
                parentIndices=[${[...this.parentIndices]}]
            )`;
    }
};

const Update = class {
    constructor({ value, index, parentIndices }) {
        this.value = value;
        this.index = index;
        this.parentIndices = parentIndices;
    }
    check(model) {
        return (
            model.keys.size > this.index + 1 &&
            Number.isSafeInteger(model.tick + 1)
        );
    }
    async run(model, shim) {
        // console.log("Update", model.shimId);
        const { value, parentIndices } = this;
        const { parentChildren } = model;
        const savedKeys = [...model.keys.values()];
        const key = savedKeys[this.index];

        if (model.hiddenEcdsUpdates.has(key)) {
            return;
        }

        const parentKeys = filterParentKeys({
            key,
            savedKeys,
            parentIndices,
        }).filter(k => !model.hiddenEcdsUpdates.has(k));

        const after = new Map();
        for (const parentKey of parentKeys) {
            const parent = await shim.get({ key: parentKey });
            after.set(parentKey, parent);
            model.childParents.get(key).add(parentKey);
            if (!parentChildren.get(parentKey)) {
                parentChildren.set(parentKey, new Set());
            }
            model.parentChildren.get(parentKey).add(key);
        }

        model.tick += 1;

        await shim.upsert({ key, value, after });

        const upserted = await shim.get({ key });
        assert(compareValues(upserted, this));

        const child = await shim.get({ key });
        for (const parentKey of model.childParents.get(key).values()) {
            const parent = await shim.get({ key: parentKey });
            const causality = child.clock.compare({ clock: parent.clock });
            assert(!causality.happensBefore);
        }
    }
    toString() {
        return `
            update(
                value=${JSON.stringify(this.value)}
                index=${this.index}
                parentIndices=[${[...this.parentIndices]}]
            )`;
    }
};

const UpdateEcds = class {
    constructor({ value, index, parentIndices }) {
        this.value = value;
        this.index = index;
        this.parentIndices = parentIndices;
    }
    check(model) {
        return (
            model.keys.size > this.index + 1 &&
            Number.isSafeInteger(model.tick + 1)
        );
    }
    async run(model, shim) {
        const { value } = this;
        const { shimId, localDb, ecdsDb } = model;

        const key = [...model.keys.values()][this.index];

        if (model.hiddenEcdsUpdates.has(key)) {
            return;
        }
        // console.log("UpdateEcds", model.shimId);

        const ecdsObj = JSON.parse(ecdsDb.get(key));

        ecdsObj.value = value;
        const storedClockTick = Number.parseInt(
            ecdsObj.depsObj[key].clockObj[shimId],
        );
        ecdsObj.depsObj[key].clockObj[shimId] = `${storedClockTick + 1}`;

        ecdsDb.set(key, JSON.stringify(ecdsObj));

        const updated = await shim.get({ key });
        assert(compareValues(updated, this));

        const storedLocal = JSON.parse(localDb.get(key));
        assert(compareValues(storedLocal, this));
    }
    toString() {
        return `
            updateEcds(
                value=${JSON.stringify(this.value)}
                index=${this.index}
                parentIndices=[${[...this.parentIndices]}]
            )`;
    }
};

const UpdateEcdsUncovered = class {
    constructor({ value, index, parentIndices }) {
        this.value = value;
        this.index = index;
        this.parentIndices = parentIndices;
    }
    check(model) {
        return (
            model.childParents.size > this.index + 1 &&
            Number.isSafeInteger(model.tick + 1)
        );
    }
    async run(model, shim) {
        const { value } = this;
        const { shimId, localDb, ecdsDb, parentChildren } = model;

        const key = [...model.childParents.keys()][this.index];
        if (model.hiddenEcdsUpdates.has(key)) {
            return;
        }

        const ecdsChild = JSON.parse(ecdsDb.get(key));

        const parentKeys = Object.keys(ecdsChild.depsObj).filter(
            k => k !== key && !model.hiddenEcdsUpdates.has(k),
        );
        if (parentKeys.length === 0) {
            return;
        }
        model.hiddenEcdsUpdates.add(key);

        for (const parentKey of parentKeys) {
            model.hiddenEcdsUpdates.add(parentKey);
            const ecdsTickParent = Number.parseInt(
                ecdsChild.depsObj[parentKey].clockObj[shimId],
            );
            const nextTickParent = ecdsTickParent + 100; // Why is +1 not enough?
            ecdsChild.depsObj[parentKey].clockObj[shimId] = `${nextTickParent}`;
        }

        const ecdsTickChild = Number.parseInt(
            ecdsChild.depsObj[key].clockObj[shimId],
        );
        ecdsChild.depsObj[key].clockObj[shimId] = `${ecdsTickChild + 100}`;
        const sameNewValue = compareValues(ecdsChild, this);
        ecdsChild.value = value;

        ecdsDb.set(key, JSON.stringify(ecdsChild));

        const stored = await shim.get({ key });

        if (!(!compareValues(stored, this) || sameNewValue)) {
            debugger;
        }

        assert(!compareValues(stored, this) || sameNewValue);
    }
    toString() {
        return `
            updateEcdsUncovered(
                value=${JSON.stringify(this.value)}
                index=${this.index}
                parentIndices=[${[...this.parentIndices]}]
            )`;
    }
};

// const ShimId = fc.asciiString(1, 1);
const ShimId = fc.constant("SHIM_A");
const Tick = fc.integer().filter(x => Number.isSafeInteger(x + 1));
const Key = fc.asciiString(1, 2);
const Value = fc.unicodeJsonObject();
const ParentIndicesFac = ({ maxNumCommands, maxNumParents }) =>
    fc.oneof(
        fc.set(fc.nat(maxNumCommands), maxNumParents),
        fc.set(fc.constant(-1)), // all
        fc.set(fc.constant(-2)), // none
    );

const ShimModel = class {
    constructor({ shimId, tick, localDb, ecdsDb }) {
        this.shimId = shimId;
        this.tick = tick;
        this.localDb = localDb;
        this.ecdsDb = ecdsDb;
        this.keys = new Set();
        this.childParents = new Map();
        this.parentChildren = new Map();
        this.hiddenEcdsUpdates = new Set();
    }
};

test.only("shim / stateful property", async t => {
    const maxNumCommands = 50;
    const maxNumParents = 3;

    const ParentIndices = ParentIndicesFac({ maxNumCommands, maxNumParents });

    const allCommands = [
        fc
            .tuple(Key, Value, ParentIndices)
            .map(([key, value, parentIndices]) => {
                return new Create({ key, value, parentIndices });
            }),
        fc
            .tuple(Value, fc.nat(maxNumCommands), ParentIndices)
            .map(([value, index, parentIndices]) => {
                return new Update({ value, index, parentIndices });
            }),
        fc
            .tuple(Value, fc.nat(maxNumCommands), ParentIndices)
            .map(([value, index, parentIndices]) => {
                return new UpdateEcds({ value, index, parentIndices });
            }),
        fc
            .tuple(Value, fc.nat(maxNumCommands), ParentIndices)
            .map(([value, index, parentIndices]) => {
                return new UpdateEcdsUncovered({ value, index, parentIndices });
            }),
        // fc.constant(new Size()),
    ];

    const property = fc.asyncProperty(
        fc.commands(allCommands, maxNumCommands),
        ShimId,
        Tick,
        async (cmds, shimId, tick) => {
            const localDb = new Map();
            const ecdsDb = new Map();
            const model = new ShimModel({ shimId, tick, localDb, ecdsDb });
            const real = getShim({ shimId, tick, localDb, ecdsDb });
            return fc.asyncModelRun(() => ({ model, real }), cmds);
        },
    );

    // logSample({ property, numRuns: 500, short: true });

    await AsyncTestHelper(
        t,
        fc.assert(
            property,
            { numRuns: 1000, verbose: false },
            // {
            //     seed: 1535909509562,
            //     path:
            //         "201:4:3:4:4:4:4:8:9:10:9:9:9:9:9:9:9:9:13:14:15:14:14:14:14:15:20:20:21:21:23:24:23:23:24:27:28:27:27:27:27:28:28:33:32:32:34:34:22",
            // },
        ),
    );
});

// #endregion
