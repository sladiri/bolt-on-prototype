import test from "tape";
import jsc from "jsverify";
import { happenedBefore } from "./happened-before";

const randomVectorClocks = ({
  // TODO: Express A, B as property, such that A < B for example
  minA = 0,
  maxA = 0,
  minB = 0,
  maxB = 0,
  sparseA = false,
  sparseB = false,
  maxKeyLength = 1,
  minSize = 0,
  sizeBase = 128,
}) =>
  jsc.bless({
    generator: () => {
      const result = {
        A: {},
        B: {},
      };
      let index = 0;
      const size = jsc.random(minSize, Math.pow(sizeBase, maxKeyLength));
      while (index < size) {
        const key = jsc.asciinestring.generator(maxKeyLength);
        const valA = jsc.random(minA, maxA);
        const valB = jsc.random(minB, maxB);
        if (!result[key]) {
          const writeA = sparseA ? jsc.random(0, 1) === 0 : true;
          if (writeA) {
            result.A[key] = valA;
          }
          const writeB = sparseB ? jsc.random(0, 1) === 0 : true;
          if (writeB) {
            result.B[key] = valB;
          }
          index += 1;
        }
      }
      return result;
    },
  });

test("happenedBefore - same clock", t => {
  t.equal(
    jsc.checkForall(randomVectorClocks({}), ({ A }) => {
      return !happenedBefore({ clockRef: A, clock: A });
    }),
    true,
  );

  t.equal(
    jsc.checkForall(
      randomVectorClocks({
        minA: 0,
        maxA: 10,
      }),
      ({ A }) => {
        return !happenedBefore({ clockRef: A, clock: A });
      },
    ),
    true,
  );

  t.end();
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

  t.equal(
    jsc.checkForall(
      randomVectorClocks({
        minA: 11,
        maxA: 20,
        minB: 1,
        maxB: 10,
        sparseB: true,
        minSize: 1,
      }),
      ({ A, B }) => {
        return (
          happenedBefore({ clockRef: A, clock: B }) &&
          !happenedBefore({ clockRef: B, clock: A })
        );
      },
    ),
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
