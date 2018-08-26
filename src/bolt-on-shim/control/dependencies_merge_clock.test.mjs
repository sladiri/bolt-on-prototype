import test from "tape";
import jsc from "jsverify";
import { compareClocks, Dependency } from "./dependencies";
import { clocksConcurrent } from "./clock-gen";

test("mergeClock - clock is private copy", t => {
    try {
        let clock;
        let dep;
        let causality;

        clock = new Map([["a", 1], ["b", 2]]);
        dep = Dependency({ clock });
        clock.set("a", 42);
        clock.set("b", 666);

        causality = compareClocks({
            clock: dep.clock,
            reference: new Map([["a", 1], ["b", 2]]),
        });
        t.ok(causality.equal);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("mergeClock - applies max ticks", t => {
    try {
        let clock1;
        let clock2;
        let dep1;
        let dep2;
        let causality;

        clock1 = new Map([["a", 1], ["b", 2]]);
        clock2 = new Map([["a", 2], ["b", 3]]);
        dep1 = Dependency({ clock: clock1 });
        dep2 = Dependency({ clock: clock2 });
        dep1.mergeClock({ clock: dep2.clock });

        causality = compareClocks({
            clock: dep1.clock,
            reference: new Map([["a", 2], ["b", 3]]),
        });
        t.ok(causality.equal);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("mergeClock - adds missing keys", t => {
    try {
        let clock1;
        let clock2;
        let dep1;
        let dep2;
        let causality;

        clock1 = new Map([["a", 1], ["b", 2], ["c", 4]]);
        clock2 = new Map([["a", 2], ["b", 3], ["d", 4]]);
        dep1 = Dependency({ clock: clock1 });
        dep2 = Dependency({ clock: clock2 });
        dep1.mergeClock({ clock: dep2.clock });

        causality = compareClocks({
            clock: dep1.clock,
            reference: new Map([["a", 2], ["b", 3], ["c", 4], ["d", 4]]),
        });
        t.ok(causality.equal);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("mergeClock - mutates only target", t => {
    try {
        let clock1;
        let clock2;
        let dep1;
        let dep2;
        let causality;

        clock1 = new Map([["a", 1], ["b", 2]]);
        clock2 = new Map([["a", 2], ["b", 3], ["c", 4]]);
        dep1 = Dependency({ clock: clock1 });
        dep2 = Dependency({ clock: clock2 });
        dep1.mergeClock({ clock: dep2.clock });

        causality = compareClocks({
            clock: dep2.clock,
            reference: new Map([["a", 2], ["b", 3], ["c", 4]]),
        });
        t.ok(causality.equal);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

const jscOptions = { tests: 100, quiet: true };

test("mergeClock - generative", t => {
    try {
        const property = jsc.forall(clocksConcurrent, ([x, y]) => {
            const dep1 = Dependency({ clock: new Map(x) });
            const dep2 = Dependency({ clock: new Map(y) });
            dep1.mergeClock({ clock: dep2.clock });

            const equal = [...dep1.clock.entries()].reduce(
                (acc, [id, tick]) => {
                    const [, otherTick] = [...dep1.clock.entries()].find(
                        write => {
                            return write[0] === id;
                        },
                    );
                    return acc && tick >= otherTick;
                },
                true,
            );
            return equal;
        });
        t.equal(jsc.check(property, jscOptions), true);
        t.end();
    } catch (error) {
        t.end(error);
    }
});
