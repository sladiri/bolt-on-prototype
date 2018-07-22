import test from "tape";
import jsc from "jsverify";
import jscCommands from "jsverify-commands"; // removed babel-polyfill
import { FakeStore } from "../store/store-fake-in-memory";
import { Shim } from "./bolt-on-shim";
import { Dependency, Dependencies } from "./control/dependencies";
import {
    Wrapped,
    serialiseWrapped,
    deserialiseWrapped,
} from "./control/wrapped-value";

const getShim = ({
    localDb = new Map(),
    ecdsDb = new Map(),
    shimId = "a",
    tick = 10,
}) => {
    const localStore = FakeStore({ db: localDb });
    const ecdsStore = FakeStore({ db: ecdsDb });
    const shim = Shim({ localStore, ecdsStore, shimId, tick });
    return shim;
};

test("shim - wraps key/value", async t => {
    try {
        const shimId = "a";
        const tick = 10;

        const key = "test";
        const value = 123;
        const deps = Dependencies({ after: new Set() });
        const clock = new Map([[shimId, tick]]);
        const dependency = Dependency({ clock });
        dependency.setClockTick({ shimId, tick });
        deps.put({ key, dependency });

        const wrapped = Wrapped({ key, value, deps });
        t.ok(wrapped.key === key);
        t.ok(wrapped.value === value);
        t.ok(wrapped.clock.compare({ clock }).equal);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - serialises wrapped", async t => {
    try {
        const shimId = "a";
        const tick = 10;

        const key = "test";
        const value = 123;
        const deps = Dependencies({ after: new Set() });
        const clock = new Map([[shimId, tick]]);
        const dependency = Dependency({ clock });
        dependency.setClockTick({ shimId, tick });
        deps.put({ key, dependency });

        const wrapped = Wrapped({ key, value, deps });
        const serialised = serialiseWrapped({ wrapped });

        t.ok(typeof serialised === "string");

        const deserialised = deserialiseWrapped({ stored: serialised });

        t.equal(serialised, serialiseWrapped({ wrapped: deserialised }));

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - returns from local store", async t => {
    try {
        const localDb = new Map();
        const shimId = "a";
        const tick = 10;

        const shim = getShim({ localDb, shimId, tick });
        const key = "test";
        const value = 123;
        const deps = Dependencies({ after: new Set() });
        const clock = new Map([[shimId, tick]]);
        const dependency = Dependency({ clock });
        dependency.setClockTick({ shimId, tick });
        deps.put({ key, dependency });

        const wrapped = Wrapped({ key, value, deps });
        const serialised = serialiseWrapped({ wrapped });
        localDb.set(key, serialised);

        const stored = await shim.get({ key });
        t.ok(stored.key === key);
        t.ok(stored.value === value);
        t.ok(stored.clock.compare({ clock }).equal);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - returns from ECDS store", async t => {
    try {
        const ecdsDb = new Map();
        const shimId = "a";
        const tick = 10;
        const shim = getShim({ ecdsDb, shimId, tick });

        const key = "test";
        const value = 123;
        const deps = Dependencies({ after: new Set() });
        const clock = new Map([[shimId, tick]]);
        const dependency = Dependency({ clock });
        dependency.setClockTick({ shimId, tick });
        deps.put({ key, dependency });

        const toStore = Wrapped({ key, value, deps });
        const serialised = serialiseWrapped({ wrapped: toStore });
        ecdsDb.set(key, serialised);

        const stored = await shim.get({ key });
        t.ok(stored.key === key);
        t.ok(stored.value === value);
        t.ok(stored.clock.compare({ clock }).equal);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - applies from ECDS store to local store", async t => {
    try {
        const localDb = new Map();
        const ecdsDb = new Map();
        const shimId = "a";
        const tick = 10;
        const shim = getShim({ localDb, ecdsDb, shimId, tick });

        const key = "test";
        const value = 123;
        const deps = Dependencies({ after: new Set() });
        const clock = new Map([[shimId, tick]]);
        const dependency = Dependency({ clock });
        dependency.setClockTick({ shimId, tick });
        deps.put({ key, dependency });

        const toStore = Wrapped({ key, value, deps });
        const serialised = serialiseWrapped({ wrapped: toStore });
        ecdsDb.set(key, serialised);

        await shim.get({ key });
        const storedLocal = localDb.get(key);

        t.equal(serialised, storedLocal);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - stored.clock === stored.deps(stored.key).clock", async t => {
    try {
        const shim = getShim({});

        const parentToStore = { key: "parent", value: 42 };
        await shim.upsert(parentToStore);
        const parentStored = await shim.get({ key: parentToStore.key });

        t.ok(
            parentStored.clock.compare({
                clock: parentStored.deps.all().get("parent").clock,
            }).equal,
        );

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - stored.clock happens after upsert(stored).clock", async t => {
    try {
        const shim = getShim({});

        const toStore = { key: "test", value: 42 };
        await shim.upsert(toStore);
        const stored = await shim.get({ key: toStore.key });

        const toUpsert = { key: "test", value: 666 };
        await shim.upsert(toUpsert);
        const upserted = await shim.get({ key: toUpsert.key });

        t.ok(
            stored.clock.compare({
                clock: upserted.clock,
            }).happensBefore,
        );
        t.equal(upserted.value, 666);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - dep.clock === stored.deps(dep.key).clock", async t => {
    try {
        const shim = getShim({});

        const parentToStore = { key: "parent", value: 42 };
        await shim.upsert(parentToStore);
        const parentStored = await shim.get({
            key: parentToStore.key,
        });

        const parent2ToStore = { key: "parent2", value: 666 };
        await shim.upsert(parent2ToStore);
        const parent2Stored = await shim.get({
            key: parent2ToStore.key,
        });

        const after = new Set([parentStored, parent2Stored]);
        const childToStore = { key: "child", value: 123, after };
        await shim.upsert(childToStore);
        const childStored = await shim.get({ key: childToStore.key });

        t.ok(
            parentStored.clock.compare({
                clock: childStored.deps.all().get("parent").clock,
            }).equal,
        );

        t.ok(
            parent2Stored.clock.compare({
                clock: childStored.deps.all().get("parent2").clock,
            }).equal,
        );

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - PUT increments clock tick", async t => {
    try {
        const shimId = "a";
        const tick = 10;
        const shim = getShim({ shimId, tick });

        const parentToStore = { key: "parent", value: 42 };
        await shim.upsert(parentToStore);
        const parentStored = await shim.get({ key: parentToStore.key });

        const childToStore = {
            key: "child",
            value: 666,
            after: new Set([parentStored]),
        };
        await shim.upsert(childToStore);
        const childStored = await shim.get({
            key: childToStore.key,
        });

        t.equal(parentStored.clock.get(shimId), 10);
        t.equal(childStored.clock.get(shimId), 11);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - GET applies newer writes from ECDS", async t => {
    try {
        const ecdsDb = new Map();
        const shimId = "a";
        const tick = 10;
        const shim = getShim({ ecdsDb, shimId, tick });

        const parentToStore = { key: "parent", value: 42 };
        await shim.upsert(parentToStore);
        const parentStored = await shim.get({ key: parentToStore.key });

        const childToStore = {
            key: "child",
            value: 666,
            after: new Set([parentStored]),
        };
        await shim.upsert(childToStore);
        const childStored1 = await shim.get({
            key: childToStore.key,
        });

        const childObj = JSON.parse(
            serialiseWrapped({ wrapped: childStored1 }),
        );
        childObj.value = 123;
        childObj.depsObj.child.clockObj.a = "12";
        ecdsDb.set(childToStore.key, JSON.stringify(childObj));

        const childStored2 = await shim.get({
            key: childToStore.key,
        });

        t.equal(childStored2.value, 123);
        t.equal(childStored2.clock.get(shimId), 12);

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

test("jsverify commands test - Die Hard problem", async t => {
    try {
        const property = jsc.forall(jsc.integer, async x => {
            const ok = (await Promise.resolve(Number.isInteger(x))) === true;
            return ok;
        });
        t.equal(await jsc.check(property), true);

        const FillBig = class {
            check(model) {
                return model.big < 5;
            }
            run(impl, model) {
                impl.big = model.big = 5;
                return impl.big !== 4 && impl.big === model.big;
            }
            get name() {
                return "FillBig";
            }
        };
        const FillSmall = class {
            check(model) {
                return model.small < 3;
            }
            run(impl, model) {
                impl.small = model.small = 3;
                return impl.big !== 4 && impl.big === model.big;
            }
            get name() {
                return "FillSmall";
            }
        };
        const EmptyBig = class {
            check(model) {
                return model.big > 0;
            }
            run(impl, model) {
                impl.big = model.big = 0;
                return impl.big !== 4 && impl.big === model.big;
            }
            get name() {
                return "EmptyBig";
            }
        };
        const EmptySmall = class {
            check(model) {
                return model.small > 0;
            }
            run(impl, model) {
                impl.small = model.small = 0;
                return impl.big !== 4 && impl.big === model.big;
            }
            get name() {
                return "EmptySmall";
            }
        };
        const SmallToBig = class {
            check(model) {
                return model.small > 0 && model.big < 5;
            }
            run(impl, model) {
                const temp = model.big;
                impl.big = model.big = Math.min(model.big + model.small, 5);
                impl.small = model.small = model.small - (model.big - temp);
                return impl.big !== 4 && impl.big === model.big;
            }
            get name() {
                return "SmallToBig";
            }
        };
        const BigToSmall = class {
            check(model) {
                return model.big > 0 && model.small < 3;
            }
            run(impl, model) {
                const temp = model.small;
                impl.small = model.small = Math.min(model.big + model.small, 3);
                impl.big = model.big = model.big - (model.small - temp);
                return impl.big !== 4 && impl.big === model.big;
            }
            get name() {
                return "BigToSmall";
            }
        };
        const DieHard = class {
            constructor(big = 0, small = 0) {
                this.big = big;
                this.small = small;
            }
        };
        const commands = jscCommands.commands(
            jscCommands.command(FillBig),
            jscCommands.command(FillSmall),
            jscCommands.command(EmptyBig),
            jscCommands.command(EmptySmall),
            jscCommands.command(SmallToBig),
            jscCommands.command(BigToSmall),
        );
        const warmup = () =>
            Object.assign(Object.create(null), {
                state: new DieHard(),
                model: {
                    big: 0,
                    small: 0,
                },
            });
        // const teardown = () => {};
        let retries = 0;
        while (retries < 10) {
            try {
                await jscCommands.assertForall(
                    // jsc.integer(0, 5),
                    commands,
                    warmup,
                    // teardown,
                );
                retries += 1;
            } catch (error) {
                // failed post condition means that solution was found
                t.ok(true);
            }
        }
        t.end();
    } catch (error) {
        t.end(error);
    }
});

// import R from "ramda";
// import { clockGen } from "./control/clock-gen";

// test("shim - generative tests", async t => {
//     try {
//         const ecdsDb = new Map();
//         const shimId = "a";
//         const tick = 10;
//         const shim = getShim({ ecdsDb, shimId, tick });

//         const parentToStore = { key: "parent", value: 42 };
//         await shim.upsert(parentToStore);
//         const parentStored = await shim.get({ key: parentToStore.key });

//         const childToStore = {
//             key: "child",
//             value: 666,
//             after: new Set([parentStored]),
//         };
//         await shim.upsert(childToStore);
//         const childStored1 = await shim.get({
//             key: childToStore.key,
//         });

//         const childObj = JSON.parse(
//             serialiseWrapped({ wrapped: childStored1 }),
//         );
//         childObj.value = 123;
//         childObj.depsObj.child.clockObj.a = "12";
//         ecdsDb.set(childToStore.key, JSON.stringify(childObj));

//         const childStored2 = await shim.get({
//             key: childToStore.key,
//         });

//         t.equal(childStored2.value, 123);
//         t.equal(childStored2.clock.get(shimId), 12);

//         //

//         const randomVectorClocks = () =>
//             // @ts-ignore
//             jsc.bless({
//                 generator: () => {
//                     const result = {
//                         A: {},
//                         B: {},
//                     };
//                     let index = 0;
//                     const size = jsc.random(
//                         minSize,
//                         Math.pow(sizeBase, maxKeyLength),
//                     );
//                     while (index < size) {
//                         const key = jsc.asciinestring.generator(maxKeyLength);
//                         const valA = jsc.random(minA, maxA);
//                         const valB = jsc.random(minB, maxB);
//                         if (!result[key]) {
//                             const writeA = sparseA
//                                 ? jsc.random(0, 1) === 0
//                                 : true;
//                             if (writeA) {
//                                 result.A[key] = valA;
//                             }
//                             const writeB = sparseB
//                                 ? jsc.random(0, 1) === 0
//                                 : true;
//                             if (writeB) {
//                                 result.B[key] = valB;
//                             }
//                             index += 1;
//                         }
//                     }
//                     return result;
//                 },
//             });

//         t.equal(
//             jsc.checkForall(randomVectorClocks(), ({ A }) => {
//                 return !happenedBefore({ clockRef: A, clock: A });
//             }),
//             true,
//         );

//         //

//         const clocks = jsc.suchthat(
//             jsc.tuple([clockGen, clockGen]),
//             ([x, y]) => {
//                 const xIds = x.map(t => t[0]);
//                 const yIds = y.map(t => t[0]);
//                 return R.intersection(xIds, yIds).length === 0;
//             },
//         );
//         const property = jsc.forall(clocks, async ([x, y]) => {
//             const clock = new Map(x);
//             const reference = new Map(y);
//             const causality = compareClocks({ clock, reference });

//             t.ok(causality.concurrent);

//             return causality.concurrent;
//         });
//         await jsc.check(property);

//         t.end();
//     } catch (error) {
//         t.end(error);
//     }
// });
