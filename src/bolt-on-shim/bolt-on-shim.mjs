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
    console.assert(ecdsStore, "Shim ecdsStore");
    console.assert(localStore, "Shim localStore");
    console.assert(shimId, "Shim shimId");
    console.assert(Number.isSafeInteger(tick), "Shim tick");
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
        console.assert(key, "shim.getOptimistic key");
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
    console.assert(key, "shim.getPessimistic key");
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
            return;
        }
        const toBufferWrapped = deserialiseWrapped({ stored: toBufferStored });
        assertWrapped({ wrapped: toBufferWrapped });
        const bufferedWrites = new Map([[key, toBufferWrapped]]);
        await applyAllPossible({
            ecdsStore,
            localStore,
            bufferedWrites,
        });
        // Localstore should have value now?
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
    after = new Set(),
}) => {
    console.assert(
        typeof tick === "object" &&
            tick !== null &&
            Number.isSafeInteger(tick.value),
        "shim.put tick",
    );
    console.assert(typeof key === "string", "shim.put key");
    console.assert(after instanceof Set, "shim.put after");
    try {
        const deps = Dependencies({ after });
        const dependency = Dependency({ clock: new Map() });
        // TODO deps?
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
        tick.value += 1;
        console.log("a", key, value, [...dependency.clock.entries()]);
        deps.put({ key, dependency });
        const toStore = Wrapped({
            key,
            value,
            deps,
        });
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

export const Upsert = ({ get, put }) => async ({ key, value, after }) => {
    console.assert(typeof key === "string", "shim.put key");
    try {
        const stored = await get({ key });
        if (!stored) {
            return put({ key, value, after });
        }
        assertWrapped({ wrapped: stored });
        const toStore = {
            key,
            value,
            after: new Set([stored]),
        };
        return put(toStore);
    } catch (error) {
        console.error(error);
        debugger;
    }
};
