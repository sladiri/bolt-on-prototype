// import test from "tape";
// import { happenedBefore } from "./happened-before";

// test("happenedBefore - single process", t => {
//   let x = {
//     p1: 2,
//   };

//   let y = {
//     p1: 1,
//   };

//   t.equal(
//     happenedBefore({ clockRef: x, clock: y }) &&
//       !happenedBefore({ clockRef: y, clock: x }),
//     true,
//   );

//   x = {
//     p1: 1,
//   };

//   y = {
//     p1: 1,
//   };

//   t.equal(
//     !happenedBefore({ clockRef: x, clock: y }) &&
//       !happenedBefore({ clockRef: y, clock: x }),
//     true,
//   );

//   t.end();
// });

// // https://www.youtube.com/watch?v=jD4ECsieFbE
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
//     happenedBefore({ clockRef: x, clock: y }) &&
//       !happenedBefore({ clockRef: y, clock: x }),
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
//     happenedBefore({ clockRef: x, clock: y }) &&
//       !happenedBefore({ clockRef: y, clock: x }),
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
//     happenedBefore({ clockRef: x, clock: y }) &&
//       !happenedBefore({ clockRef: y, clock: x }),
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
//     happenedBefore({ clockRef: x, clock: y }) &&
//       !happenedBefore({ clockRef: y, clock: x }),
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
//     happenedBefore({ clockRef: x, clock: y }) &&
//       !happenedBefore({ clockRef: y, clock: x }),
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
//     happenedBefore({ clockRef: x, clock: y }) &&
//       !happenedBefore({ clockRef: y, clock: x }),
//     true,
//   );

//   t.end();
// });

// // https://www.youtube.com/watch?v=jD4ECsieFbE
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
//     !happenedBefore({ clockRef: x, clock: y }) &&
//       !happenedBefore({ clockRef: y, clock: x }),
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
//     !happenedBefore({ clockRef: x, clock: y }) &&
//       !happenedBefore({ clockRef: y, clock: x }),
//     true,
//   );

//   x = {
//     c: 1,
//   };

//   y = {
//     a: 3,
//   };

//   t.equal(
//     !happenedBefore({ clockRef: x, clock: y }) &&
//       !happenedBefore({ clockRef: y, clock: x }),
//     true,
//   );

//   t.end();
// });
