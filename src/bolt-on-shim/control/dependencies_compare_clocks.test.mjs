import test from "tape";
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
