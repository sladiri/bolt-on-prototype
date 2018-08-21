import test from "tape";
import jsc from "jsverify";
import R from "ramda";
import { compareClocks } from "./dependencies";
import { clockGen } from "./clock-gen";

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

const jscOptions = { tests: 1000, quiet: true };

test("compareClocks - equal / generative tests", t => {
    try {
        const property = jsc.forall(clockGen, x => {
            const clock = new Map(x);
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

test("compareClocks - happensBefore / generative tests", t => {
    try {
        const clocks = jsc.suchthat(
            jsc.tuple([clockGen, clockGen]),
            ([c, ref]) => {
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
            },
        );
        const property = jsc.forall(clocks, ([x, y]) => {
            const clock = new Map(x);
            const reference = new Map(y);
            const causality = compareClocks({ clock, reference });
            return causality.happensBefore;
        });
        t.equal(jsc.check(property, jscOptions), true);
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

test("compareClocks - happensAfter / generative tests", t => {
    try {
        const clocks = jsc.suchthat(
            jsc.tuple([clockGen, clockGen]),
            ([c, ref]) => {
                return ref.reduce((acc, [id, tick]) => {
                    if (!acc) {
                        return acc;
                    }
                    const write = c.find(x => x[0] === id);
                    if (!write) {
                        return false;
                    }
                    const smaller = tick < write[1];
                    return acc && smaller;
                }, true);
            },
        );
        const property = jsc.forall(clocks, ([x, y]) => {
            const clock = new Map(x);
            const reference = new Map(y);
            const causality = compareClocks({ clock, reference });
            return causality.happensAfter;
        });
        t.equal(jsc.check(property, jscOptions), true);
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

test("compareClocks - concurrent / generative tests", t => {
    try {
        const clocks = jsc.suchthat(
            jsc.tuple([clockGen, clockGen]),
            ([x, y]) => {
                const xIds = x.map(t => t[0]);
                const yIds = y.map(t => t[0]);
                return R.intersection(xIds, yIds).length === 0;
            },
        );
        const property = jsc.forall(clocks, ([x, y]) => {
            const clock = new Map(x);
            const reference = new Map(y);
            const causality = compareClocks({ clock, reference });
            return causality.concurrent;
        });
        t.equal(jsc.check(property, jscOptions), true);
        t.end();
    } catch (error) {
        t.end(error);
    }
});
