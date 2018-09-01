import assert from "assert";
import { Resolver, applyAllPossible } from "./control/resolver";
import {
    Dependency,
    Dependencies,
    assertDependency,
    assertClock,
} from "./control/dependencies";
import {
    assertWrapped,
    Wrapped,
    serialiseWrapped,
    deserialiseWrapped,
} from "./control/wrapped-value";

export const Shim = ({ ecdsStore, localStore, shimId, tick }) => {
    assert(ecdsStore, "Shim ecdsStore");
    assert(localStore, "Shim localStore");
    assert(typeof shimId === "string", "Shim typeof shimId === 'string'");
    assert(Number.isSafeInteger(tick), "Shim Number.isSafeInteger(tick)");
    const tickObj = { value: tick };
    // TODO: Tune Get with max-ECDS-reads
    const get = GetPessimistic({ ecdsStore, localStore });
    // const get = GetOptimistic({ ecdsStore, localStore });
    const put = Put({ ecdsStore, localStore, shimId, tick: tickObj });
    const upsert = Upsert({ get, put });
    const shim = Object.seal(
        Object.assign(Object.create(null), { get, put, upsert }),
    );
    return shim;
};

export const GetOptimistic = ({ ecdsStore, localStore }) => {
    const resolver = Resolver({ ecdsStore, localStore });
    return async ({ key }) => {
        assert(
            typeof key === "string",
            "shim.getOptimistic typeof key === 'string'",
        );
        try {
            resolver.watchKey({ key });
            const stored = await localStore.get({ key });
            if (!stored) {
                return;
            }
            const wrapped = deserialiseWrapped({ stored });
            assertWrapped({ wrapped });
            return wrapped;
        } catch (error) {
            console.error(error);
            debugger;
        }
    };
};

export const GetPessimistic = ({ ecdsStore, localStore }) => async ({
    key,
}) => {
    assert(
        typeof key === "string",
        "shim.getPessimistic typeof key === 'string'",
    );
    try {
        const toBufferStored = await ecdsStore.get({ key });
        if (!toBufferStored) {
            const localStored = await localStore.get({ key });
            if (localStored) {
                const localWrapped = deserialiseWrapped({
                    stored: localStored,
                });
                assertWrapped({ wrapped: localWrapped });
                return localWrapped;
            }
            return null;
        }
        const toBufferWrapped = deserialiseWrapped({ stored: toBufferStored });
        assertWrapped({ wrapped: toBufferWrapped });
        const bufferedWrites = new Map([[key, toBufferWrapped]]);
        await applyAllPossible({
            ecdsStore,
            localStore,
            bufferedWrites,
        });
        const coveredStored = await localStore.get({ key });
        const coveredWrapped = deserialiseWrapped({ stored: coveredStored });
        assertWrapped({ wrapped: coveredWrapped });
        return coveredWrapped;
    } catch (error) {
        console.error(error);
        debugger;
    }
};

export const Put = ({ ecdsStore, localStore, shimId, tick }) => async ({
    key,
    value,
    after = new Map(),
}) => {
    assert(
        typeof tick === "object" &&
            tick !== null &&
            Number.isSafeInteger(tick.value),
        "shim.put Number.isSafeInteger(tick.value)",
    );
    assert(typeof key === "string", "shim.put typeof key === 'string'");
    assert(after instanceof Map, "shim.put after instanceof Map");
    const stored = await localStore.get({ key });
    if (stored) {
        const current = deserialiseWrapped({ stored });
        assertWrapped({ wrapped: current });
        const newDep = Dependency({ clock: new Map([[shimId, tick.value]]) });
        const causality = newDep.clock.compare({
            clock: current.deps.get({ key }).clock,
        });
        assert(
            !causality.happensBefore,
            "shim.put !newDep.clock.happensBefore(stored.clock)",
        );
    }
    const deps = Dependencies({ after });
    const dependency = Dependency({ clock: new Map() });
    for (const wrapped of after.values()) {
        if (wrapped === undefined) {
            continue; // Convenience
        }
        assertWrapped({ wrapped });
        if (wrapped.key === key) {
            const dep = wrapped.deps.get({ key });
            assertDependency({ dependency: dep });
            const { clock } = dep;
            assertClock({ clock });
            dependency.mergeClock({ clock });
        }
    }
    dependency.setClockTick({ shimId, tick: tick.value });
    try {
        tick.value += 1;
        deps.put({ key, dependency });
        const toStore = Wrapped({ key, value, deps });
        const serialised = serialiseWrapped({ wrapped: toStore });
        await ecdsStore.put({ key, value: serialised });
        await localStore.put({ key, value: serialised });
        return toStore;
    } catch (error) {
        console.error(error);
        debugger;
        tick.value -= 1;
    }
};

export const Upsert = ({ get, put }) => async ({
    key,
    value,
    after = new Map(),
}) => {
    assert(typeof key === "string", "shim.put typeof key === 'string'");
    try {
        const stored = await get({ key });
        if (!stored) {
            return put({ key, value, after });
        }
        assertWrapped({ wrapped: stored });
        const parents = new Map([...after.entries(), [key, stored]]);
        for (const [depKey] of stored.deps.all()) {
            const parent = await get({ key: depKey });
            parents.set(depKey, parent);
        }
        const toStore = { key, value, after: parents };
        return put(toStore);
    } catch (error) {
        console.error(error);
        debugger;
    }
};
