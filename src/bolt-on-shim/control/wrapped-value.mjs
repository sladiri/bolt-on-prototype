import {
    assertDeps,
    assertDependency,
    serialiseDeps,
    deserialiseDeps,
    assertClock,
} from "./dependencies";

export const Wrapped = ({ key, value, deps }) => {
    console.assert(typeof key === "string", "Wrapped key");
    console.assert(value !== undefined, "Wrapped value");
    assertDeps({ deps, referenceKey: key });
    const valueJson = JSON.stringify(value); // Ensures serialisation in stores!
    const _deps = deserialiseDeps({
        stored: serialiseDeps({ deps }),
    });
    const wrapped = Object.seal(
        Object.create(Object.create(null), {
            key: {
                get: () => key,
                set: () => {
                    console.assert(false, "wrapped set key");
                },
                enumerable: true,
            },
            value: {
                get: () => JSON.parse(valueJson),
                set: () => {
                    console.assert(false, "wrapped set value");
                },
                enumerable: true,
            },
            clock: {
                get: () => {
                    const dependency = _deps.get({ key });
                    assertDependency({ dependency });
                    const { clock } = dependency;
                    assertClock({ clock });
                    return clock;
                },
                set: () => {
                    console.assert(false, "wrapped set clock");
                },
                enumerable: true,
            },
            deps: {
                get: () => {
                    const deps = deserialiseDeps({
                        stored: serialiseDeps({ deps: _deps }),
                    });
                    return deps;
                },
                set: () => {
                    console.assert(false, "wrapped set deps");
                },
                enumerable: true,
            },
        }),
    );
    return wrapped;
};

export const assertWrapped = ({ wrapped }) => {
    console.assert(wrapped, "assertWrapped wrapped");
    const { key, deps } = wrapped;
    console.assert(typeof key === "string", "assertWrapped wrapped.key");
    assertDeps({ deps, wrapped });
};

export const serialiseWrapped = ({ wrapped }) => {
    assertWrapped({ wrapped });
    const toStore = Object.seal(
        Object.assign(Object.create(null), {
            key: wrapped.key,
            value: wrapped.value,
            depsObj: serialiseDeps({ deps: wrapped.deps }),
        }),
    );
    return JSON.stringify(toStore);
};

export const deserialiseWrapped = ({ stored }) => {
    console.assert(typeof stored === "string", "typeof stored === 'string'");
    const storedObj = JSON.parse(stored);
    console.assert(
        typeof storedObj === "object" && storedObj !== null,
        "deserialiseWrapped typeof storedObj === 'object' && storedObj !== null",
    );
    const { key, value, depsObj } = storedObj;
    console.assert(typeof key === "string", "deserialise storedObj.key");
    console.assert(
        typeof depsObj === "object" && depsObj !== null,
        "deserialiseWrapped typeof depsObj === 'object' && depsObj !== null",
    );
    const wrapped = Wrapped({
        key,
        value,
        deps: deserialiseDeps({ stored: depsObj }),
    });
    return wrapped;
};
