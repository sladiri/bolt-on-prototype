import test from "tape";
import jsc from "jsverify";
import { compareClocks } from "./dependencies";
import { clock, clocksHappensBefore, clocksConcurrent } from "./clock-gen";

const jscOptions = { tests: 10000, quiet: false };

test("compareClocks - equal / generative", t => {
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

test("compareClocks - happensBefore https://www.youtube.com/watch?v=jD4ECsieFbE", t => {
    try {
        let clock;
        let reference;
        let causality;

        clock = new Map([["a", 1]]);
        reference = new Map([["a", 2]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        clock = new Map([["a", 2]]);
        reference = new Map([["a", 2], ["b", 2], ["c", 1]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        clock = new Map([["a", 1]]);
        reference = new Map([["a", 2], ["b", 2], ["c", 1]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        clock = new Map([["c", 1]]);
        reference = new Map([["a", 2], ["b", 3], ["c", 1]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        clock = new Map([["a", 2], ["b", 2], ["c", 1]]);
        reference = new Map([["a", 5], ["b", 3], ["c", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        clock = new Map([["c", 1]]);
        reference = new Map([["a", 5], ["b", 3], ["c", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        clock = new Map([["a", 3]]);
        reference = new Map([["a", 5], ["b", 3], ["c", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("compareClocks - happensBefore / generative", t => {
    try {
        const property = jsc.forall(
            clocksHappensBefore,
            ([clock, reference]) => {
                const causality = compareClocks({
                    clock: new Map(clock),
                    reference: new Map(reference),
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

test("compareClocks - concurrent https://www.youtube.com/watch?v=jD4ECsieFbE", t => {
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

test("compareClocks - concurrent / generative", t => {
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
