import {
    assertWrapped,
    serialiseWrapped,
    deserialiseWrapped,
} from "./wrapped-value";
import { assertDependency, assertClock } from "./dependencies";

// Asynchronously applies updates to local reads for optimistic local reads
export const Resolver = ({ ecdsStore, localStore }) => {
    console.assert(ecdsStore, "Resolver ecdsStore");
    console.assert(localStore, "Resolver localStore");
    const optimisticKeysToCheck = new Set();
    const { startResolver, resolverOk } = ResolveLoop({
        ecdsStore,
        localStore,
        optimisticKeysToCheck,
    });
    // startResolver();
    return {
        watchKey({ key }) {
            console.assert(typeof key === "string", "resolver.watchKey key");
            console.assert(resolverOk(), "resolver.watchKey resolverOk");
            optimisticKeysToCheck.add(key);
        },
    };
};

export const ResolveLoop = ({
    ecdsStore,
    localStore,
    optimisticKeysToCheck,
    bufferedWrites = new Map(),
    interval = 5000,
}) => {
    console.assert(
        optimisticKeysToCheck instanceof Set,
        "Resolve optimisticKeysToCheck instanceof Set",
    );
    console.assert(
        bufferedWrites instanceof Map,
        "Resolve bufferedWrites instanceof Map",
    );
    console.assert(
        Number.isSafeInteger(interval),
        "Resolve Number.isSafeInteger(interval)",
    );
    let isOK = false;
    const resolve = async () => {
        try {
            // TODO Testing manual call on window.resolve
            // while (true) {
            isOK = true;
            console.log("resolve");
            for (const key of optimisticKeysToCheck.values()) {
                const stored = await ecdsStore.get({ key });
                if (!stored) {
                    continue;
                }
                const wrapped = deserialiseWrapped({ stored });
                assertWrapped({ wrapped });
                bufferedWrites.set(key, wrapped);
            }
            optimisticKeysToCheck.clear();
            await applyAllPossible({
                ecdsStore,
                localStore,
                bufferedWrites,
            });
            // await new Promise(r => setTimeout(r, interval));
            // }
        } catch (error) {
            isOK = false;
            console.error("resolve", error);
            debugger;
        }
    };
    window.resolve = resolve;
    return {
        startResolver: resolve,
        resolverOk: () => isOK,
    };
};

export const applyAllPossible = async ({
    ecdsStore,
    localStore,
    bufferedWrites,
}) => {
    console.assert(
        bufferedWrites instanceof Map,
        "applyAllPossible bufferedWrites instanceof Map",
    );
    while (true) {
        let changed = false;
        for (const buffered of bufferedWrites.values()) {
            assertWrapped({ wrapped: buffered });
            const writesToApply = new Set();
            const isCovered = await attemptToCover({
                ecdsStore,
                localStore,
                writeToCheck: buffered,
                bufferedWrites,
                writesToApply,
            });
            // Without optimisations, this should never be false?
            console.assert(isCovered, "applyAllPossible isCovered");
            if (!isCovered) {
                continue;
            }
            for (const wrapped of writesToApply.values()) {
                assertWrapped({ wrapped });
                const { key } = wrapped;
                const serialised = serialiseWrapped({ wrapped });
                await localStore.put({ key, value: serialised });
                bufferedWrites.delete(key);
                changed = true;
            }
            if (changed) {
                break;
            }
        }
        if (!changed) {
            break;
        }
    }
};

export const attemptToCover = async ({
    ecdsStore,
    localStore,
    writeToCheck,
    bufferedWrites,
    writesToApply,
    writesToConsider = new Map(),
}) => {
    console.assert(
        bufferedWrites instanceof Map,
        "attemptToCover bufferedWrites instanceof Map",
    );
    assertWrapped({ wrapped: writeToCheck });
    console.assert(
        writesToApply instanceof Set,
        "attemptToCover writesToApply instanceof Set",
    );
    console.assert(
        writesToConsider instanceof Map,
        "isCovered writesToConsider",
    );
    for (const clocks of writesToConsider.values()) {
        console.assert(
            clocks instanceof Set,
            "attemptToCover writesToConsider/clocks instanceof Set",
        );
        for (const clock of clocks.values()) {
            assertClock({ clock });
        }
    }
    const localStored = await localStore.get({ key: writeToCheck.key });
    if (localStored) {
        // see if we've already applied this one
        const local = deserialiseWrapped({ stored: localStored });
        assertWrapped({ wrapped: local });
        const causality = local.clock.compare({ clock: writeToCheck.clock });
        if (causality.happensAfter || causality.equal) {
            return true;
        }
    }
    for (const [depKey, dependency] of writeToCheck.deps.all().entries()) {
        assertDependency({ dependency });
        if (depKey === writeToCheck.key) {
            continue;
        }
        const depLocalStored = await localStore.get({ key: depKey });
        const depRemote = writeToCheck.deps.get({ key: depKey });
        assertWrapped({ wrapped: depRemote });
        if (depLocalStored) {
            // if we've already applied this write or a write that will overwrite this write, we're good
            const depLocal = deserialiseWrapped({ stored: depLocalStored });
            assertWrapped({ wrapped: depLocal });
            const causality = depLocal.clock.compare({
                clock: depRemote.clock,
            });
            if (!causality.happensBefore) {
                addToConsider({
                    key: depKey,
                    clock: depRemote.clock,
                    writesToConsider,
                });
                continue;
            }
        }
        if (writesToConsider.has(depKey)) {
            let found = false;
            for (const appliedClock of writesToConsider.get(depKey)) {
                const causality = appliedClock.compare({
                    clock: depRemote.clock,
                });
                if (!causality.happensBefore) {
                    found = true;
                    break;
                }
            }
            if (found) {
                continue;
            }
        }
        if (bufferedWrites.has(depKey)) {
            // now check any buffered writes
            const buffered = bufferedWrites.get(depKey);
            assertWrapped({ wrapped: buffered });
            const causality = buffered.clock.compare({
                clock: depRemote.clock,
            });
            if (
                causality.equal ||
                ((causality.happensAfter || causality.concurrent) &&
                    (await attemptToCover({
                        ecdsStore,
                        localStore,
                        writeToCheck: buffered,
                        bufferedWrites,
                        writesToApply,
                        writesToConsider,
                    })))
            ) {
                addToConsider({
                    key: depKey,
                    clock: depRemote.clock,
                    writesToConsider,
                });
                writesToApply.add(buffered);
            }
        }
        // now try to read from the underlying store ...
        const newlyReadWriteStored = await ecdsStore.get({ key: depKey });
        if (!newlyReadWriteStored) {
            return false;
        }
        const newlyReadWrite = deserialiseWrapped({
            stored: newlyReadWriteStored,
        });
        assertWrapped({ wrapped: newlyReadWrite });
        const causality = newlyReadWrite.clock.compare({
            clock: depRemote.clock,
        });
        if (
            causality.equal ||
            ((causality.happensAfter || causality.concurrent) &&
                (await attemptToCover()))
        ) {
            addToConsider({
                key: depKey,
                clock: depRemote.clock,
                writesToConsider,
            });
            writesToApply.add(newlyReadWrite);
            continue;
        }
        return false;
    }
    writesToApply.add(writeToCheck);
    return true;
};

const addToConsider = ({ key, clock, writesToConsider }) => {
    console.assert(typeof key === "string", "addToConsider key === 'string'");
    assertClock({ clock });
    console.assert(
        writesToConsider instanceof Map,
        "addToConsider writesToConsider instanceof Map",
    );
    for (const [
        keyToConsider,
        clocksToConsider,
    ] of writesToConsider.entries()) {
        console.assert(
            typeof keyToConsider === "string",
            "addToConsider keyToConsider === 'string'",
        );
        console.assert(
            clocksToConsider instanceof Set,
            "addToConsider clocksToConsider instanceof Set",
        );
        for (const clock of clocksToConsider.values()) {
            assertClock({ clock });
        }
    }
    let clocksToConsider = writesToConsider.get(key);
    if (!clocksToConsider) {
        clocksToConsider = new Set();
        writesToConsider.set(key, clocksToConsider);
    }
    clocksToConsider.add(clock);
};