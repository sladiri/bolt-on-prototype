import test from "tape";
import jsc from "jsverify";
import R from "ramda";
import { compareClocks } from "./dependencies";

test("compareClocks - equal", t => {
    try {
        let clock;
        let causality;

        clock = new Map([["a", 2], ["b", 3]]);
        causality = compareClocks({ clock, reference: clock });
        t.equal(causality.equal, true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("compareClocks - happensBefore", t => {
    try {
        let clock;
        let reference;
        let causality;

        clock = new Map([["a", 1], ["b", 2]]);
        reference = new Map([["a", 2], ["b", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        clock = new Map([["a", 1]]);
        reference = new Map([["a", 2], ["b", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

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
        reference = new Map([["a", 2], ["b", 1], ["c", 1]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensBefore, true);

        clock = new Map([["a", 2]]);
        reference = new Map([["a", 2], ["b", 1], ["c", 1]]);
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

test("compareClocks - happensAfter", t => {
    try {
        let clock;
        let reference;
        let causality;

        clock = new Map([["a", 2], ["b", 3]]);
        reference = new Map([["a", 1], ["b", 2]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensAfter, true);

        clock = new Map([["a", 2], ["b", 3]]);
        reference = new Map([["a", 1]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.happensAfter, true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("compareClocks - concurrent", t => {
    try {
        let clock;
        let reference;
        let causality;

        clock = new Map([["a", 1]]);
        reference = new Map([["b", 2]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.concurrent, true);

        clock = new Map([["a", 1], ["b", 2]]);
        reference = new Map([["a", 2]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.concurrent, true);

        clock = new Map([["a", 1]]);
        reference = new Map([["b", 2], ["c", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.concurrent, true);

        clock = new Map([["a", 1], ["b", 2]]);
        reference = new Map([["b", 2], ["c", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.concurrent, true);

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

        clock = new Map([["a", 2], ["b", 2], ["c", 1]]);
        reference = new Map([["a", 3]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.concurrent, true);

        clock = new Map([["a", 3], ["b", 0], ["c", 0]]);
        reference = new Map([["a", 0], ["b", 0], ["c", 1]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.concurrent, true);

        clock = new Map([["a", 3]]);
        reference = new Map([["c", 1]]);
        causality = compareClocks({ clock, reference });
        t.equal(causality.concurrent, true);

        t.end();
    } catch (error) {
        t.end(error);
    }
});

test("compareClocks - happensBefore / generative tests", async t => {
    try {
        const clock = jsc.suchthat(
            jsc
                .array(jsc.tuple([jsc.asciichar, jsc.integer]))
                .smap(R.uniqWith((x, y) => x[0] === y[0]), R.identity),
            arr => arr.length > 0,
        );
        const clocks = jsc.suchthat(jsc.tuple([clock, clock]), ([c, ref]) => {
            return c.reduce((acc, [id, tick]) => {
                if (!acc) {
                    return acc;
                }
                const refWrite = ref.find(x => x[0] === id);
                if (!refWrite) {
                    return false;
                }
                const smaller = tick < refWrite[1];
                return acc && smaller;
            }, true);
        });
        const property = jsc.forall(clocks, ([x, y]) => {
            const clock = new Map(x);
            const reference = new Map(y);
            const causality = compareClocks({ clock, reference });

            t.ok(causality.happensBefore);

            return causality.happensBefore;
        });
        jsc.check(property);

        t.end();
    } catch (error) {
        t.end(error);
    }
});
