import { Store } from "./control/store-pouchdb";
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
} from "./control/wrapped-value";

export const Shim = ({ remoteDb, localDb, shimId, tick }) => {
    console.assert(remoteDb, "Shim remoteDb");
    console.assert(localDb, "Shim localDb");
    console.assert(shimId, "Shim shimId");
    console.assert(Number.isSafeInteger(tick), "Shim tick");
    const localStore = Store({ db: localDb });
    const ecdsStore = Store({ db: remoteDb });
    const tickObj = { value: tick };
    // TODO: Tune Get with max-ECDS-reads
    const shim = Object.seal(
        Object.assign(Object.create(null), {
            // get: GetOptimistic({ ecdsStore, localStore }),
            get: GetPessimistic({ ecdsStore, localStore }),
            put: Put({ ecdsStore, localStore, shimId, tick: tickObj }),
        }),
    );
    return shim;
};

export const GetOptimistic = ({ ecdsStore, localStore }) => {
    const resolver = Resolver({ ecdsStore, localStore });
    return async ({ key }) => {
        console.assert(key, "shim.getOptimistic key");
        try {
            resolver.watchKey({ key });
            const wrapped = await localStore.get({ key });
            if (!wrapped) {
                return;
            }
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
        const toBuffer = await ecdsStore.get({ key });
        if (!toBuffer) {
            const local = await localStore.get({ key });
            if (local) {
                assertWrapped({ wrapped: local });
                return local;
            }
            return;
        }
        assertWrapped({ wrapped: toBuffer });
        const bufferedWrites = new Map([[key, toBuffer]]);
        await applyAllPossible({
            ecdsStore,
            localStore,
            bufferedWrites,
        });
        // Localstore should have value now?
        const covered = await localStore.get({ key });
        assertWrapped({ wrapped: covered });
        return covered;
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
        const serialised = serialiseWrapped({ wrapped: toStore }); // Optimisation
        await ecdsStore.put({ key, serialised });
        await localStore.put({ key, serialised });
        return toStore;
    } catch (error) {
        console.error(error);
        debugger;
        tick.value -= 1;
    }
};
