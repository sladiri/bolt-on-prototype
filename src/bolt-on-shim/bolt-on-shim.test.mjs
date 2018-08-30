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

const getShim = ({ localDb, ecdsDb, shimId = "a", tick = 10 }) => {
    [...arguments];
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

const jscOptions = { tests: 100, quiet: false };

// test("shim - returns from local-store or ECDS / generative", async t => {
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

// test("shim - ECDS new keys applied to local-store / generative", async t => {
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

// test("shim - UPSERT advances clock and value is updated / generative", async t => {
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

// test("shim - ECDS updated values applied to local-store / generative", async t => {
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

// test("shim - GET hides writes which are not covered / generative", async t => {
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

test.only("shim - fast-check model", async t => {
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
            fc.asyncProperty(fc.commands(allCommands, 5), cmds => {
                const s = () => ({ model: Model(), real: new List() });
                return fc.asyncModelRun(s, cmds);
            }),
            { numRuns: 1 },
        );
        t.equal(result, undefined);
        t.end();
    } catch (error) {
        console.log(error);
        t.end(true);
    }
});
