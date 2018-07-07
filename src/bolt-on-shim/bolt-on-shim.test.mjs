import test from "tape";
import { FakeStore } from "../store/store-fake-in-memory";
import { Shim } from "./bolt-on-shim";

test("shim - stored.clock === stored.deps(stored.key).clock", async t => {
    const localDb = new Map();
    const ecdsDb = new Map();

    const localStore = FakeStore({ db: localDb });
    const ecdsStore = FakeStore({ db: ecdsDb });

    const shimId = "a";
    const tick = 10;

    const shim = Shim({ localStore, ecdsStore, shimId, tick });

    const parentToStore = { key: "parent", value: 42 };
    await shim.upsert(parentToStore);
    const parentStored = await shim.get({
        key: parentToStore.key,
    });

    t.equal(
        parentStored.clock.compare({
            clock: parentStored.deps.all().get("parent").clock,
        }).equal,
        true,
    );

    t.end();
});

test("shim - dep.clock === stored.deps(dep.key).clock", async t => {
    const localDb = new Map();
    const ecdsDb = new Map();

    const localStore = FakeStore({ db: localDb });
    const ecdsStore = FakeStore({ db: ecdsDb });

    const shimId = "a";
    const tick = 10;

    const shim = Shim({ localStore, ecdsStore, shimId, tick });

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
    const childStored = await shim.get({
        key: childToStore.key,
    });

    t.equal(
        parentStored.clock.compare({
            clock: childStored.deps.all().get("parent").clock,
        }).equal,
        true,
    );

    t.equal(
        parent2Stored.clock.compare({
            clock: childStored.deps.all().get("parent2").clock,
        }).equal,
        true,
    );

    t.end();
});
