import { assertWrapped } from "./wrapped-value";

export const Dependencies = ({ after }) => {
    console.assert(after instanceof Set, "dependencies after");
    const depsMap = new Map();
    for (const wrapped of after.values()) {
        if (wrapped === undefined) {
            continue; // Convenience
        }
        assertWrapped({ wrapped });
        for (const [key, dependency] of wrapped.deps.all().entries()) {
            assertDependency({ dependency });
            const { clock } = dependency;
            if (depsMap.has(key)) {
                depsMap.get(key).mergeClock({ clock });
            } else {
                const dep = Dependency({ clock });
                depsMap.set(key, dep);
            }
        }
    }
    const deps = Deps({ depsMap });
    return deps;
};

const Deps = ({ depsMap }) => {
    const deps = Object.seal(
        Object.create(Object.create(null), {
            all: {
                value: () => {
                    const deps = [...depsMap.entries()].reduce(
                        (acc, [key, dependency]) => {
                            const dep = deserialiseDependency({
                                stored: serialiseDependency({
                                    dependency,
                                }),
                            });
                            return acc.set(key, dep);
                        },
                        new Map(),
                    );
                    return deps;
                },
                enumerable: true,
            },
            get: {
                value: ({ key }) => {
                    console.assert(
                        typeof key === "string",
                        "dependencies get key",
                    );
                    const dep = deserialiseDependency({
                        stored: serialiseDependency({
                            dependency: depsMap.get(key),
                        }),
                    });
                    return dep;
                },
                enumerable: true,
            },
            put: {
                value: ({ key, dependency }) => {
                    assertDependency({ dependency });
                    const dep = deserialiseDependency({
                        stored: serialiseDependency({
                            dependency,
                        }),
                    });
                    depsMap.set(key, dep);
                },
                enumerable: true,
            },
        }),
    );
    return deps;
};

export const Dependency = ({ clock }) => {
    console.assert(clock instanceof Map, "Dependency clock instanceof Map");
    const _clock = new Map(clock);
    const dependency = Object.seal(
        Object.create(Object.create(null), {
            clock: {
                get: () => {
                    const clockCopy = new Map(_clock);
                    const clockWithCompare = Object.seal(
                        Object.assign(clockCopy, {
                            compare: ({ clock }) => {
                                assertClock({ clock });
                                const causality = compareClocks({
                                    clock: clockCopy,
                                    reference: clock,
                                });
                                assertCausality({ causality });
                                return causality;
                            },
                        }),
                    );
                    return clockWithCompare;
                },
                set: () => {
                    console.assert(false, "dependency set clock");
                },
                enumerable: true,
            },
            mergeClock: {
                value: ({ clock }) => {
                    console.assert(
                        clock instanceof Map,
                        "dependency.mergeClock depClock",
                    );
                    for (const [key, tick] of clock.entries()) {
                        if (_clock.has(key)) {
                            const maxValue = Math.max(_clock.get(key), tick);
                            _clock.set(key, maxValue);
                        } else {
                            _clock.set(key, tick);
                        }
                    }
                },
                enumerable: true,
            },
            setClockTick: {
                value: ({ shimId, tick }) => {
                    console.assert(
                        typeof shimId === "string",
                        "dependency.setClockTick typeof shimId === 'string'",
                    );
                    console.assert(
                        Number.isSafeInteger(tick),
                        "dependency.setClockTick tick",
                    );
                    _clock.set(shimId, tick);
                },
                enumerable: true,
            },
        }),
    );
    return dependency;
};

export const compareClocks = ({ clock, reference }) => {
    assertClock({ clock });
    assertClock({ clock: reference });
    let earlier = false;
    let later = false;
    const toCheck = new Set([...reference.keys(), ...clock.keys()]);
    for (const shimId of toCheck.values()) {
        const ourTick = clock.get(shimId) || Number.MIN_SAFE_INTEGER;
        const theirTick = reference.get(shimId) || Number.MIN_SAFE_INTEGER;
        console.assert(Number.isSafeInteger(ourTick));
        console.assert(Number.isSafeInteger(theirTick));
        if (ourTick < theirTick) {
            earlier = true;
        }
        if (ourTick > theirTick) {
            later = true;
        }
    }
    const happensBefore = earlier && !later;
    const happensAfter = !earlier && later;
    const concurrent = earlier && later;
    const equal = !happensBefore && !happensAfter && !concurrent;
    const causality = Object.seal(
        Object.assign(Object.create(null), {
            equal,
            happensBefore,
            happensAfter,
            concurrent,
        }),
    );
    assertCausality({ causality });
    return causality;
};

export const assertClock = ({ clock }) => {
    console.assert(clock instanceof Map, "assertClock clock instanceof Map");
    console.assert(clock.size > 0, "assertClock clock.size > 0");
    for (const [shimId, tick] of clock.entries()) {
        console.assert(
            typeof shimId === "string",
            "assertClock typeof clock/shimId === 'string'",
        );
        console.assert(
            Number.isSafeInteger(tick),
            "assertClock Number.isSafeInteger(clock/tick)",
        );
    }
};

export const assertCausality = ({ causality }) => {
    console.assert(
        typeof causality === "object" && causality !== null,
        "assertCausality typeof causality === 'object' && causality !== null",
    );
    const flagsActive = Object.values(causality).reduce((acc, flag) => {
        return acc + flag;
    }, 0);
    console.assert(flagsActive === 1, "assertCausality flagsActive === 1");
    return flagsActive;
};

export const serialiseDeps = ({ deps }) => {
    assertDeps({ deps });
    const depsObj = [...deps.all().entries()].reduce(
        (acc, [key, dependency]) => {
            return Object.assign(acc, {
                [key]: serialiseDependency({ dependency }),
            });
        },
        Object.create(null),
    );
    return depsObj;
};

export const deserialiseDeps = ({ stored }) => {
    const depsMap = Object.entries(stored).reduce((acc, [key, depObj]) => {
        return acc.set(key, deserialiseDependency({ stored: depObj }));
    }, new Map());
    const deps = Deps({ depsMap });
    return deps;
};

export const serialiseDependency = ({ dependency }) => {
    assertDependency({ dependency });
    const clockObj = [...dependency.clock.entries()].reduce(
        (acc, [shimId, tick]) => {
            return Object.assign(acc, { [shimId]: `${tick}` });
        },
        Object.create(null),
    );
    const serialised = Object.assign(Object.create(null), { clockObj });
    return serialised;
};

export const deserialiseDependency = ({ stored }) => {
    console.assert(
        typeof stored === "object" && stored !== null,
        "deserialiseDependency typeof stored === 'object' && stored !== null",
    );
    const { clockObj } = stored;
    console.assert(
        typeof clockObj === "object" && clockObj !== null,
        "deserialiseDependency typeof clockObj === 'object' && clockObj !== null",
    );
    const clock = Object.entries(clockObj).reduce(
        (acc, [shimId, tickString]) => {
            const tick = Number.parseInt(tickString);
            return acc.set(shimId, tick);
        },
        new Map(),
    );
    const dependency = Dependency({ clock });
    return dependency;
};

export const assertDeps = ({ deps, referenceKey }) => {
    console.assert(
        typeof deps === "object" && deps !== null,
        "assertDeps typeof deps === 'object' && deps !== null",
    );
    console.assert(
        typeof deps.all === "function",
        "assertDeps typeof deps.all === 'function'",
    );
    console.assert(
        typeof deps.get === "function",
        "assertDeps typeof deps.get === 'function'",
    );
    console.assert(
        typeof deps.put === "function",
        "assertDeps typeof deps.put === 'function'",
    );
    console.assert(
        // Optimise check and re-use iteration through deps here.
        referenceKey ? typeof referenceKey === "string" : !referenceKey,
        "assertDeps typeof referenceKey === 'string' : !referenceKey",
    );
    for (const dependency of deps.all().values()) {
        assertDependency({ dependency });
        if (!referenceKey) {
            continue;
        }
        const causality = deps.get({ key: referenceKey }).clock.compare({
            clock: dependency.clock,
        });
        console.assert(
            !causality.happensBefore,
            "assertDeps !reference.clock.happensBefore(dep.clock)",
        );
    }
};

export const assertDependency = ({ dependency }) => {
    console.assert(
        typeof dependency === "object" && dependency !== null,
        "assertDependency typeof dependency === 'object' && dependency !== null",
    );
    console.assert(
        typeof dependency.clock === "object" && dependency.clock !== null,
        "assertDependency typeof dependency.clock === 'object' && dependency.clock !== null",
    );
    console.assert(
        typeof dependency.mergeClock === "function",
        "assertDependency typeof dependency.mergeClock === 'function'",
    );
    console.assert(
        typeof dependency.setClockTick === "function",
        "assertDependency typeof dependency.setClockTick === 'function'",
    );
};
