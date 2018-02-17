import test from "tape";
import jsc from "jsverify";
import { happenedBefore } from "./happened-before";

const Zplus = jsc.bless({
  generator: jsc.nat.generator.map(function(x) {
    return x + 1;
  }),
});

const nat2array = jsc.bless({
  generator: jsc.nat.generator.flatmap(function(x) {
    return jsc.generator.nearray(jsc.nat.generator);
  }),
});

const nat2tuple = jsc.bless({
  generator: jsc.generator.tuple([
    jsc.generator.nearray(jsc.asciinestring.generator),
    jsc.generator.nearray(jsc.nat.generator),
  ]),
});

const nat2tupleflatMap = jsc.bless({
  generator: jsc.nat.generator.flatmap(function(x) {
    return jsc.generator.tuple([
      jsc.generator.nearray(jsc.asciinestring.generator),
      jsc.generator.nearray(jsc.nat.generator),
    ]);
  }),
});

const emailGenerator = jsc.asciinestring.generator.map(
  str => `${str}@example.com`,
);
const arbUser = jsc.record({
  first: jsc.asciinestring,
  last: jsc.asciinestring,
  email: jsc.bless({ generator: emailGenerator }),
});

const randomVectorClock = (size = 100) =>
  jsc.bless({
    generator: () => {
      const arr = jsc.generator.nearray(jsc.nat.generator, size);
      const result = {};
      let index = 0;
      while (Object.keys(result).length !== arr.length) {
        const key = jsc.asciinestring.generator(arr.length * 2);
        if (!result[key]) {
          result[key] = arr[index];
          index += 1;
        }
      }
      return result;
    },
  });

test("happenedBefore - Xa = Y  ==>  X !-> Y  &  Y !-> X", t => {
  t.plan(1);

  t.equal(
    jsc.checkForall(randomVectorClock(), clock => {
      return !happenedBefore({ clockRef: clock, clock });
    }),
    true,
  );
});

const randomVectorClocks = (minA, maxA, minB, maxB, size = 4) =>
  jsc.bless({
    generator: () => {
      const result = {
        A: {},
        B: {},
      };
      let index = 0;
      while (index < size) {
        const key = jsc.asciinestring.generator(100);
        const valA = jsc.random(minA, maxA);
        const valB = jsc.random(minB, maxB);
        if (!result[key]) {
          result.A[key] = valA;
          result.B[key] = valB;
          index += 1;
        }
      }
      return result;
    },
  });

test("happenedBefore - Xa.. < Ya..  ==>  X --> Y  &  Y !-> X", t => {
  t.plan(1);

  t.equal(
    jsc.checkForall(
      randomVectorClocks(1, 10, 11, 20, 4),
      ({ A: smallClock, B: largeClock }) => {
        return (
          happenedBefore({ clockRef: largeClock, clock: smallClock }) &&
          !happenedBefore({ clockRef: smallClock, clock: largeClock })
        );
      },
    ),
    true,
  );
});

// https://www.youtube.com/watch?v=jD4ECsieFbE
test("happenedBefore - causally related", t => {
  let x = {
    a: 2,
    b: 1,
    c: 1,
  };

  let y = {
    a: 2,
  };

  t.equal(
    happenedBefore({ clockRef: x, clock: y }) &&
      !happenedBefore({ clockRef: y, clock: x }),
    true,
  );

  x = {
    a: 2,
    b: 1,
    c: 1,
  };

  y = {
    a: 1,
  };

  t.equal(
    happenedBefore({ clockRef: x, clock: y }) &&
      !happenedBefore({ clockRef: y, clock: x }),
    true,
  );

  x = {
    a: 2,
    b: 3,
    c: 1,
  };

  y = {
    c: 1,
  };

  t.equal(
    happenedBefore({ clockRef: x, clock: y }) &&
      !happenedBefore({ clockRef: y, clock: x }),
    true,
  );

  x = {
    a: 5,
    b: 3,
    c: 3,
  };

  y = {
    a: 2,
    b: 2,
    c: 1,
  };

  t.equal(
    happenedBefore({ clockRef: x, clock: y }) &&
      !happenedBefore({ clockRef: y, clock: x }),
    true,
  );

  x = {
    a: 5,
    b: 3,
    c: 3,
  };
  y = {
    c: 1,
  };

  t.equal(
    happenedBefore({ clockRef: x, clock: y }) &&
      !happenedBefore({ clockRef: y, clock: x }),
    true,
  );

  x = {
    a: 5,
    b: 3,
    c: 3,
  };

  y = {
    a: 3,
  };

  t.equal(
    happenedBefore({ clockRef: x, clock: y }) &&
      !happenedBefore({ clockRef: y, clock: x }),
    true,
  );

  t.end();
});

// https://www.youtube.com/watch?v=jD4ECsieFbE
test("happenedBefore - concurrent", t => {
  let x = {
    a: 3,
  };

  let y = {
    a: 2,
    b: 2,
    c: 1,
  };

  t.equal(
    !happenedBefore({ clockRef: x, clock: y }) &&
      !happenedBefore({ clockRef: y, clock: x }),
    true,
  );

  x = {
    a: 0,
    b: 0,
    c: 1,
  };

  y = {
    a: 3,
    b: 0,
    c: 0,
  };

  t.equal(
    !happenedBefore({ clockRef: x, clock: y }) &&
      !happenedBefore({ clockRef: y, clock: x }),
    true,
  );

  x = {
    c: 1,
  };

  y = {
    a: 3,
  };

  t.equal(
    !happenedBefore({ clockRef: x, clock: y }) &&
      !happenedBefore({ clockRef: y, clock: x }),
    true,
  );

  t.end();
});
