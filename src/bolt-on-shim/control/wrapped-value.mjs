import assert from "assert";
import {
    assertDeps,
    assertDependency,
    serialiseDeps,
    deserialiseDeps,
    assertClock,
} from "./dependencies";

export const Wrapped = ({ key, value, deps }) => {
    assert(typeof key === "string", "Wrapped key");
    assert(value !== undefined, "Wrapped value");
    const valueJson = JSON.stringify(value); // Ensures serialisation in stores!
    const _deps = deserialiseDeps({
        stored: serialiseDeps({ deps }),
    });
    const wrapped = Object.seal(
        Object.create(Object.create(null), {
            key: {
                get: () => key,
                set: () => {
                    assert(false, "wrapped set key");
                },
                enumerable: true,
            },
            value: {
                get: () => JSON.parse(valueJson),
                set: () => {
                    assert(false, "wrapped set value");
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
                    assert(false, "wrapped set clock");
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
                    assert(false, "wrapped set deps");
                },
                enumerable: true,
            },
        }),
    );
    return wrapped;
};

export const assertWrapped = ({ wrapped }) => {
    assert(
        typeof wrapped === "object" && wrapped !== null,
        "assertWrapped typeof wrapped === 'object' && wrapped !== null",
    );
    const { key, deps } = wrapped;
    assert(typeof key === "string", "assertWrapped wrapped.key");
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
    assert(typeof stored === "string", "typeof stored === 'string'");
    const storedObj = JSON.parse(stored);
    assert(
        typeof storedObj === "object" && storedObj !== null,
        "deserialiseWrapped typeof storedObj === 'object' && storedObj !== null",
    );
    const { key, value, depsObj } = storedObj;
    assert(typeof key === "string", "deserialise storedObj.key");
    assert(
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
