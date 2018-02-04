import test from "tape";
import { happenedBefore, isCovered } from "./is-covered";

// test("happenedBefore - single process", t => {
//   let x = {
//     p1: 2,
//   };

//   let y = {
//     p1: 1,
//   };

//   t.equal(
//     happenedBefore({ clockRef: x, clockPrev: y }) &&
//       !happenedBefore({ clockRef: y, clockPrev: x }),
//     true,
//   );

//   x = {
//     p1: 1,
//   };

//   y = {
//     p1: 1,
//   };

//   t.equal(
//     !happenedBefore({ clockRef: x, clockPrev: y }) &&
//       !happenedBefore({ clockRef: y, clockPrev: x }),
//     true,
//   );

//   t.end();
// });

// https://www.youtube.com/watch?v=jD4ECsieFbE
// test("happenedBefore - causally related", t => {
//   let x = {
//     a: 2,
//     b: 1,
//     c: 1,
//   };

//   let y = {
//     a: 2,
//   };

//   t.equal(
//     happenedBefore({ clockRef: x, clockPrev: y }) &&
//       !happenedBefore({ clockRef: y, clockPrev: x }),
//     true,
//   );

//   x = {
//     a: 2,
//     b: 1,
//     c: 1,
//   };

//   y = {
//     a: 1,
//   };

//   t.equal(
//     happenedBefore({ clockRef: x, clockPrev: y }) &&
//       !happenedBefore({ clockRef: y, clockPrev: x }),
//     true,
//   );

//   x = {
//     a: 2,
//     b: 3,
//     c: 1,
//   };

//   y = {
//     c: 1,
//   };

//   t.equal(
//     happenedBefore({ clockRef: x, clockPrev: y }) &&
//       !happenedBefore({ clockRef: y, clockPrev: x }),
//     true,
//   );

//   x = {
//     a: 5,
//     b: 3,
//     c: 3,
//   };

//   y = {
//     a: 2,
//     b: 2,
//     c: 1,
//   };

//   t.equal(
//     happenedBefore({ clockRef: x, clockPrev: y }) &&
//       !happenedBefore({ clockRef: y, clockPrev: x }),
//     true,
//   );

//   x = {
//     a: 5,
//     b: 3,
//     c: 3,
//   };
//   y = {
//     c: 1,
//   };

//   t.equal(
//     happenedBefore({ clockRef: x, clockPrev: y }) &&
//       !happenedBefore({ clockRef: y, clockPrev: x }),
//     true,
//   );

//   x = {
//     a: 5,
//     b: 3,
//     c: 3,
//   };

//   y = {
//     a: 3,
//   };

//   t.equal(
//     happenedBefore({ clockRef: x, clockPrev: y }) &&
//       !happenedBefore({ clockRef: y, clockPrev: x }),
//     true,
//   );

//   t.end();
// });

// https://www.youtube.com/watch?v=jD4ECsieFbE
// test("happenedBefore - concurrent", t => {
//   let x = {
//     a: 3,
//   };

//   let y = {
//     a: 2,
//     b: 2,
//     c: 1,
//   };

//   t.equal(
//     !happenedBefore({ clockRef: x, clockPrev: y }) &&
//       !happenedBefore({ clockRef: y, clockPrev: x }),
//     true,
//   );

//   x = {
//     a: 0,
//     b: 0,
//     c: 1,
//   };

//   y = {
//     a: 3,
//     b: 0,
//     c: 0,
//   };

//   t.equal(
//     !happenedBefore({ clockRef: x, clockPrev: y }) &&
//       !happenedBefore({ clockRef: y, clockPrev: x }),
//     true,
//   );

//   x = {
//     c: 1,
//   };

//   y = {
//     a: 3,
//   };

//   t.equal(
//     !happenedBefore({ clockRef: x, clockPrev: y }) &&
//       !happenedBefore({ clockRef: y, clockPrev: x }),
//     true,
//   );

//   t.end();
// });

// test("isCovered - empty dependencies", t => {
//   t.plan(1);

//   const options = {
//     remoteMeta: {
//       happenedAfter: {},
//     },
//   };

//   isCovered(options).then(result => t.equal(result, true));
// });

const getStores = ({ localData, ecdsData }) => ({
  ecds: {
    get: ({ key }) => {
      if (!ecdsData[key]) {
        const error = new Error("no found");
        error.name = "not_found";
        throw error;
      }
      return { val: JSON.stringify(ecdsData[key]) };
    },
  },
  localStore: {
    get: ({ key }) => JSON.stringify(localData[key]),
    put: ({ key, val }) => (localData[key] = val),
  },
});

test("isCovered", t => {
  t.plan(1);

  const ecdsData = {
    w1: {
      val: "foo",
      _meta: {
        vectorClock: { p1: 2 },
        happenedAfter: {
          w2: { p2: 1 },
        },
      },
    },
    w2: {
      val: "bar",
      _meta: {
        vectorClock: { p1: 1 },
        happenedAfter: {},
      },
    },
  };

  const localData = {
    w1: ecdsData.w1,
    // w2: ecdsData.w2,
  };

  const tentativeWrites = {
    w1: ecdsData.w1,
  };

  const options = {
    tentativeWrites,
    remoteMeta: ecdsData.w1._meta,
    ...getStores({ localData, ecdsData }),
  };

  isCovered(options).then(result => t.equal(result, true));
});
