import test from "tape";
import jsc from "jsverify";
import { compareClocks } from "./dependencies";
import { clock, clocksHappensBefore, clocksConcurrent } from "./clock-gen";

const jscOptions = { tests: 100, quiet: false };

test("compareClocks - equal / property", t => {
    try {
        const property = jsc.forall(clock, keyValuePairs => {
            const clock = new Map(keyValuePairs);
            const causality = compareClocks({ clock, reference: clock });
            return causality.equal;
        });
        t.equal(jsc.check(property, jscOptions), true);
        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("compareClocks - happensBefore", t => {
    // https://www.youtube.com/watch?v=jD4ECsieFbE
    try {
        let clock;
        let reference;
        let causality;

        reference = new Map([["a", 1]]);
        clock = new Map([["a", 2]]);
        causality = compareClocks({ reference, clock });
        t.equal(causality.happensBefore, true);

        reference = new Map([["a", 2]]);
        clock = new Map([["a", 2], ["b", 2], ["c", 1]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        reference = new Map([["a", 1]]);
        clock = new Map([["a", 2], ["b", 2], ["c", 1]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        reference = new Map([["c", 1]]);
        clock = new Map([["a", 2], ["b", 3], ["c", 1]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        reference = new Map([["a", 2], ["b", 2], ["c", 1]]);
        clock = new Map([["a", 5], ["b", 3], ["c", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        reference = new Map([["c", 1]]);
        clock = new Map([["a", 5], ["b", 3], ["c", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        reference = new Map([["a", 3]]);
        clock = new Map([["a", 5], ["b", 3], ["c", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("compareClocks - happensBefore / property", t => {
    try {
        const property = jsc.forall(
            clocksHappensBefore,
            ([reference, clock]) => {
                const causality = compareClocks({
                    reference: new Map(reference),
                    clock: new Map(clock),
                });
                return causality.happensBefore;
            },
        );
        t.equal(jsc.check(property, jscOptions), true);
        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("compareClocks - concurrent", t => {
    // https://www.youtube.com/watch?v=jD4ECsieFbE
    try {
        let clock;
        let reference;
        let causality;

        clock = new Map([["a", 3]]);
        reference = new Map([["a", 2], ["b", 2], ["c", 1]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.concurrent, true);

        clock = new Map([["c", 1]]);
        reference = new Map([["a", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.concurrent, true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("compareClocks - concurrent / property", t => {
    try {
        const property = jsc.forall(clocksConcurrent, ([clock, reference]) => {
            const causality = compareClocks({
                clock: new Map(clock),
                reference: new Map(reference),
            });
            return causality.concurrent;
        });
        t.equal(jsc.check(property, jscOptions), true);
        t.end();
    } catch (error) {
        t.end(error);
    }
});
