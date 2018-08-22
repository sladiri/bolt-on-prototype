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

// #region Money Type
const CurrencyError = () => {
    const name = "currency is not a valid string";
    return { name, toString: () => name };
};
const assertCurrency = currency =>
    typeof currency === "string" && currency.length > 0;
const AmountError = () => {
    const name = "amount is not a safe integer";
    return { name, toString: () => name };
};
const assertAmount = amount => Number.isSafeInteger(amount);
const MoneyError = () => {
    const name = "money object has invalid methods";
    return { name, toString: () => name };
};
const assertMoney = money => {
    return (
        typeof money === "object" &&
        typeof money.currency === "function" &&
        typeof money.amount === "function"
    );
};
const AddCurrencyError = () => {
    const name = "cannot add money from different currencies";
    return { name, toString: () => name };
};
const assertAddCurrency = (currencyA, currencyB) => currencyA === currencyB;

const Money = ({ Currency, Amount }) => {
    if (!assertCurrency(Currency)) {
        throw CurrencyError();
    }
    if (!assertAmount(Amount)) {
        throw AmountError();
    }

    const currency = () => Currency;
    const amount = () => Amount;
    const print = () => {
        console.log(`${amount()} ${currency()}`);
    };
    const add = money => {
        if (!assertMoney(money)) {
            throw MoneyError();
        }
        if (!assertAddCurrency(money.currency(), currency())) {
            throw AddCurrencyError();
        }
        if (!assertAmount(Amount + money.amount())) {
            throw AmountError();
        }
        Amount += money.amount();
    };
    const toString = () => `${currency()} - ${amount()}`;
    return {
        amount,
        currency,
        print,
        add,
        toString,
    };
};
// #endregion

test("Money", t => {
    const options = { tests: 10000 };
    // #region correctnes
    const validCurrency = jsc.elements(["EUR", "USD", "GBP"]);

    const validAmount = jsc.oneof([
        jsc.integer,
        jsc.elements([Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]),
    ]);

    const validParams = jsc.record({
        Currency: validCurrency,
        Amount: validAmount,
    });

    const correctnessPositive = jsc.forall(validParams, params => {
        return assertMoney(Money(params));
    });
    t.equal(jsc.check(correctnessPositive, options), true);
    // #endregion

    // #region correctnes negative
    const invalidCurrency = jsc.oneof([
        jsc.constant(""),
        jsc.integer,
        jsc.constant({}),
        jsc.constant([]),
        jsc.constant(null),
        jsc.constant(undefined),
    ]);

    const invalidAmount = jsc.oneof([
        jsc.constant(Number.NEGATIVE_INFINITY),
        jsc.constant(Number.POSITIVE_INFINITY),
        jsc.constant(Number.MIN_VALUE),
        jsc.constant(Number.MAX_VALUE),
        jsc.constant(Number.NaN),
        jsc.asciistring,
        jsc.constant({}),
        jsc.constant([]),
        jsc.constant(null),
        jsc.constant(undefined),
    ]);

    const invalidParams = jsc.record({
        Currency: invalidCurrency,
        Amount: invalidAmount,
    });

    const correctnessNegative = jsc.forall(invalidParams, params => {
        try {
            Money(params);
        } catch (error) {
            const { Currency, Amount } = params;
            if (
                (!assertCurrency(Currency) &&
                    CurrencyError().name === error.name) ||
                (!assertAmount(Amount) && AmountError().name === error.name)
            ) {
                return true;
            } else {
                throw error;
            }
        }
    });
    t.equal(jsc.check(correctnessNegative, options), true);
    // #endregion

    // #region robustness
    const validMoney = jsc
        .record({ Currency: validCurrency, Amount: validAmount })
        .smap(
            params => Money(params),
            x => ({ Currency: x.currency(), Amount: x.amount() }),
        );

    const fakeMoney = jsc
        .pair(invalidCurrency, invalidAmount)
        .smap(
            ([x, y]) => ({ currency: () => x, amount: () => y }),
            x => [x.currency(), x.amount()],
        );

    const moneyPair = jsc.pair(validMoney, jsc.oneof([validMoney, fakeMoney]));

    const robustness = jsc.forall(moneyPair, ([x, y]) => {
        try {
            const xAmount = x.amount();
            const yAmount = y.amount();
            x.add(y);
            return x.amount() === xAmount + yAmount && yAmount === y.amount();
        } catch (error) {
            if (!assertMoney(y) && MoneyError().name === error.name) {
                return true;
            } else if (
                !assertAddCurrency(x.currency(), y.currency()) &&
                AddCurrencyError().name === error.name
            ) {
                return true;
            } else if (
                !assertAmount(x.amount() + y.amount()) &&
                AmountError().name === error.name
            ) {
                return true;
            } else {
                throw error;
            }
        }
    });
    t.equal(jsc.check(robustness, options), true);
    // #endregion
    t.end();
});

const serialisable = jsc.oneof([
    jsc.integer,
    jsc.asciinestring,
    jsc.constant([]),
    jsc.constant({}),
    jsc.constant(null),
]);
const shimId = jsc.asciinestring;
const tick = jsc.suchthat(jsc.nat, x => x > 0 && x < 100);
const key = jsc.asciinestring;
const value = serialisable;

const getShim = ({ localDb, ecdsDb, shimId = "a", tick = 10 }) => {
    const localStore = FakeStore({ db: localDb });
    const ecdsStore = FakeStore({ db: ecdsDb });
    const shim = Shim({ localStore, ecdsStore, shimId, tick });
    return shim;
};

const wrap = ([shimId, tick, key, value]) => {
    const deps = Dependencies({ after: new Set() });
    const clock = new Map([[shimId, tick]]);
    const dependency = Dependency({ clock });
    dependency.setClockTick({ shimId, tick });
    deps.put({ key, dependency });
    const wrapped = Wrapped({ key, value, deps });
    return { clock, wrapped };
};

const jscOptions = { tests: 10000, quiet: false };

test("shim - returns from local-store or ECDS / generative", async t => {
    const compareStored = async ({ db, shim, shimId, tick, key, value }) => {
        const { wrapped } = wrap([shimId, tick, key, value]);
        const serialised = serialiseWrapped({ wrapped });
        db.set(key, serialised);

        const stored = await shim.get({ key });

        return serialised === serialiseWrapped({ wrapped: stored });
    };

    try {
        const property = jsc.forall(
            jsc.tuple([shimId, tick, key, value]),
            async ([shimId, tick, key, value]) => {
                const dbLocal = new Map();
                const shimLocal = getShim({ localDb: dbLocal, shimId, tick });

                const dbEcds = new Map();
                const shimEcds = getShim({ ecdsDb: dbEcds, shimId, tick });

                return (
                    (await compareStored({
                        db: dbLocal,
                        shim: shimLocal,
                        shimId,
                        tick,
                        key,
                        value,
                    })) &&
                    (await compareStored({
                        db: dbEcds,
                        shim: shimEcds,
                        shimId,
                        tick,
                        key,
                        value,
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
            jsc.tuple([shimId, tick, key, value, value]),
            async ([shimId, tick, key, valueA, valueB]) => {
                const shim = getShim({ shimId, tick });

                const toStore = { key, value: valueA };
                await shim.upsert(toStore);
                const stored = await shim.get({ key });

                const toUpsert = { key, value: valueB };
                await shim.upsert(toUpsert);
                const upserted = await shim.get({ key });

                return (
                    upserted.clock.compare({
                        clock: stored.clock,
                    }).happensAfter &&
                    JSON.stringify(upserted.value) === JSON.stringify(valueB)
                );
            },
        );
        t.equal(await jsc.check(property, jscOptions), true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - dep.clock === stored.deps(dep.key).clock / generative", async t => {
    try {
        const property = jsc.forall(
            jsc.suchthat(
                jsc.tuple([shimId, tick, key, key, key, value, value, value]),
                ([, , keyParentA, keyParentB, keyChild, , , ,]) =>
                    R.uniq([keyParentA, keyParentB, keyChild]).length === 3,
            ),
            async ([
                shimId,
                tick,
                keyParentA,
                keyParentB,
                keyChild,
                valueParentA,
                valueParentB,
                valueChild,
            ]) => {
                const shim = getShim({ shimId, tick });

                const parentToStore = { key: keyParentA, value: valueParentA };
                await shim.upsert(parentToStore);
                const parentStored = await shim.get({
                    key: keyParentA,
                });

                const parent2ToStore = { key: keyParentB, value: valueParentB };
                await shim.upsert(parent2ToStore);
                const parent2Stored = await shim.get({
                    key: keyParentB,
                });

                const after = new Set([parentStored, parent2Stored]);
                const childToStore = {
                    key: keyChild,
                    value: valueChild,
                    after,
                };
                await shim.upsert(childToStore);
                const childStored = await shim.get({ key: keyChild });

                return (
                    parentStored.clock.compare({
                        clock: childStored.deps.all().get(keyParentA).clock,
                    }).equal &&
                    parent2Stored.clock.compare({
                        clock: childStored.deps.all().get(keyParentB).clock,
                    }).equal
                );
            },
        );
        t.equal(await jsc.check(property, jscOptions), true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - ECDS update applies new items to local-store / generative", async t => {
    const areMissing = async ({ localDb, shim, keyValuePairs }) => {
        let ok = true;
        for (const [key] of keyValuePairs) {
            const missing = await shim.get({ key });
            const missingLocally = localDb.get(key);

            if (!(missing === null && missingLocally === undefined)) {
                console.log("\n\nareMissing\n", key, missing, missingLocally);
            }
            ok = ok && missing === null && missingLocally === undefined;
        }
        return ok;
    };

    const areApplied = async ({
        shimId,
        tick,
        localDb,
        ecdsDb,
        shim,
        keyValuePairs,
    }) => {
        let ok = true;
        let foo = [];
        for (const [key, value] of keyValuePairs) {
            foo.push([key, value]);
            const preShim = await shim.get({ key });
            const preShimValue = preShim ? preShim.value : undefined;
            const preLocalValue = JSON.parse(
                localDb.get(key) || '{"value":"NOPE"}',
            ).value;
            const preEcdsValue = JSON.parse(
                ecdsDb.get(key) || '{"value":"NOPE"}',
            ).value;

            const { wrapped: toStore } = wrap([shimId, tick, key, value]);
            tick += 1;

            const serialised = serialiseWrapped({ wrapped: toStore });
            ecdsDb.set(key, serialised);

            const stored = await shim.get({ key });
            const storedLocal = localDb.get(key);

            if (
                !(
                    serialised === storedLocal &&
                    serialised === serialiseWrapped({ wrapped: stored })
                )
            ) {
                console.log(
                    "\nwhat",
                    preShimValue,
                    preLocalValue,
                    preEcdsValue,
                    value,
                    foo,
                );
            }

            ok =
                ok &&
                serialised === storedLocal &&
                serialised === serialiseWrapped({ wrapped: stored });
        }
        return ok;
    };

    try {
        const property = jsc.forall(
            jsc.tuple([shimId, tick, jsc.nearray(jsc.tuple([key, value]))]),
            async ([shimId, tick, keyValuePairs]) => {
                const localDb = new Map();
                const ecdsDb = new Map();
                const shim = getShim({ localDb, ecdsDb, shimId, tick });
                let ok =
                    (await areMissing({ localDb, shim, keyValuePairs })) &&
                    (await areApplied({
                        shimId,
                        tick,
                        localDb,
                        ecdsDb,
                        shim,
                        keyValuePairs,
                    }));
                return ok;
            },
        );
        t.equal(await jsc.check(property, jscOptions), true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("shim - ECDS update applies new writes to local-store / generative", async t => {
    try {
        const property = jsc.forall(
            jsc.tuple([shimId, tick, key, value, jsc.nearray(value)]),
            async ([shimId, tick, key, value, valuesNew]) => {
                const ecdsDb = new Map();
                const shim = getShim({ ecdsDb, shimId, tick });

                const childToStore = { key, value };
                await shim.upsert(childToStore);
                const childStored = await shim.get({ key });

                let ok = true;
                let tickDelta = 2;

                for (const valueNew of valuesNew) {
                    const childObj = JSON.parse(
                        serialiseWrapped({ wrapped: childStored }),
                    );
                    childObj.value = valueNew;
                    childObj.depsObj[key].clockObj[shimId] = `${tick +
                        tickDelta}`;
                    tickDelta += 1;

                    ecdsDb.set(key, JSON.stringify(childObj));

                    const childStoredWithUpdate = await shim.get({ key });

                    const valueIsUpdated =
                        JSON.stringify(childStoredWithUpdate.value) ===
                        JSON.stringify(valueNew);
                    const clockIsUpdated =
                        `${childStoredWithUpdate.clock.get(shimId)}` ===
                        childObj.depsObj[key].clockObj[shimId];
                    const storedHappensBefore = childStored.clock.compare({
                        clock: childStoredWithUpdate.clock,
                    }).happensBefore;

                    ok =
                        ok &&
                        valueIsUpdated &&
                        clockIsUpdated &&
                        storedHappensBefore;
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

//

// test("shim - GET hides writes which are not covered", async t => {
//     try {
//         const ecdsDb = new Map();
//         const shimId = "a";
//         const tick = 10;
//         const shim = getShim({ ecdsDb, shimId, tick });

//         const parentToStore = { key: "parent", value: "parent A" };
//         await shim.upsert(parentToStore);
//         const parentStored = await shim.get({ key: parentToStore.key });

//         const childToStore = {
//             key: "child",
//             value: "child A",
//             after: new Set([parentStored]),
//         };
//         await shim.upsert(childToStore);
//         const childStored1 = await shim.get({
//             key: childToStore.key,
//         });

//         const childObj = JSON.parse(
//             serialiseWrapped({ wrapped: childStored1 }),
//         );
//         childObj.value = "child B";
//         childObj.depsObj.parent.clockObj.a = "12";
//         childObj.depsObj.child.clockObj.a = "13";
//         ecdsDb.set(childToStore.key, JSON.stringify(childObj));

//         const childStored2 = await shim.get({
//             key: childToStore.key,
//         });

//         t.equal(childStored2.value, "child A");
//         t.equal(childStored2.clock.get(shimId), 11);

//         const parentObj = JSON.parse(
//             serialiseWrapped({ wrapped: parentStored }),
//         );
//         parentObj.value = "parent B";
//         parentObj.depsObj.parent.clockObj.a = "12";
//         ecdsDb.set(parentToStore.key, JSON.stringify(parentObj));

//         const parentStored2 = await shim.get({ key: parentToStore.key });
//         t.equal(parentStored2.value, "parent B");
//         t.equal(parentStored2.clock.get(shimId), 12);

//         const childStored3 = await shim.get({
//             key: childToStore.key,
//         });

//         t.equal(childStored3.value, "child B");
//         t.equal(childStored3.clock.get(shimId), 13);

//         t.end();
//     } catch (error) {
//         t.end(error);
//     }
// });

// jsverify commands
//

// test("jsverify commands test - Die Hard problem", async t => {
//     try {
//         const property = jsc.forall(jsc.integer, async x => {
//             const ok = (await Promise.resolve(Number.isInteger(x))) === true;
//             return ok;
//         });
//         t.equal(await jsc.check(property), true);

//         const FillBig = class {
//             check(model) {
//                 return model.big < 5;
//             }
//             run(impl, model) {
//                 impl.big = model.big = 5;
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "FillBig";
//             }
//         };
//         const FillSmall = class {
//             check(model) {
//                 return model.small < 3;
//             }
//             run(impl, model) {
//                 impl.small = model.small = 3;
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "FillSmall";
//             }
//         };
//         const EmptyBig = class {
//             check(model) {
//                 return model.big > 0;
//             }
//             run(impl, model) {
//                 impl.big = model.big = 0;
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "EmptyBig";
//             }
//         };
//         const EmptySmall = class {
//             check(model) {
//                 return model.small > 0;
//             }
//             run(impl, model) {
//                 impl.small = model.small = 0;
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "EmptySmall";
//             }
//         };
//         const SmallToBig = class {
//             check(model) {
//                 return model.small > 0 && model.big < 5;
//             }
//             run(impl, model) {
//                 const temp = model.big;
//                 impl.big = model.big = Math.min(model.big + model.small, 5);
//                 impl.small = model.small = model.small - (model.big - temp);
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "SmallToBig";
//             }
//         };
//         const BigToSmall = class {
//             check(model) {
//                 return model.big > 0 && model.small < 3;
//             }
//             run(impl, model) {
//                 const temp = model.small;
//                 impl.small = model.small = Math.min(model.big + model.small, 3);
//                 impl.big = model.big = model.big - (model.small - temp);
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "BigToSmall";
//             }
//         };
//         const DieHard = class {
//             constructor(big = 0, small = 0) {
//                 this.big = big;
//                 this.small = small;
//             }
//         };
//         const commands = jscCommands.commands(
//             jscCommands.command(FillBig),
//             jscCommands.command(FillSmall),
//             jscCommands.command(EmptyBig),
//             jscCommands.command(EmptySmall),
//             jscCommands.command(SmallToBig),
//             jscCommands.command(BigToSmall),
//         );
//         const warmup = () =>
//             Object.assign(Object.create(null), {
//                 state: new DieHard(),
//                 model: {
//                     big: 0,
//                     small: 0,
//                 },
//             });
//         // const teardown = () => {};
//         let retries = 0;
//         while (retries < 10) {
//             try {
//                 await jscCommands.assertForall(
//                     // jsc.integer(0, 5),
//                     commands,
//                     warmup,
//                     // teardown,
//                 );
//                 retries += 1;
//             } catch (error) {
//                 // failed post condition means that solution was found
//                 t.ok(true);
//             }
//         }
//         t.end();
//     } catch (error) {
//         t.end(error);
//     }
// });

//

// import R from "ramda";
// import { clockGen } from "./control/clock-gen";

// test("shim - generative", async t => {
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
