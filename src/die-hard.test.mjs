// import test from "tape";
// import jscCommands from "./jsc-commands/jscCommands.js"; // removed babel-polyfill from src and allow ES6 classes for commands

// test("jsverify commands test - Die Hard problem", async t => {
//     try {
//         const FillBig = class {
//             check(model) {
//                 return model.big < 5;
//             }
//             run(impl, model) {
//                 impl.big = model.big = 5;
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "FillBig";
//             }
//         };
//         const FillSmall = class {
//             check(model) {
//                 return model.small < 3;
//             }
//             run(impl, model) {
//                 impl.small = model.small = 3;
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "FillSmall";
//             }
//         };
//         const EmptyBig = class {
//             check(model) {
//                 return model.big > 0;
//             }
//             run(impl, model) {
//                 impl.big = model.big = 0;
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "EmptyBig";
//             }
//         };
//         const EmptySmall = class {
//             check(model) {
//                 return model.small > 0;
//             }
//             run(impl, model) {
//                 impl.small = model.small = 0;
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "EmptySmall";
//             }
//         };
//         const SmallToBig = class {
//             check(model) {
//                 return model.small > 0 && model.big < 5;
//             }
//             run(impl, model) {
//                 const temp = model.big;
//                 impl.big = model.big = Math.min(model.big + model.small, 5);
//                 impl.small = model.small = model.small - (model.big - temp);
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "SmallToBig";
//             }
//         };
//         const BigToSmall = class {
//             check(model) {
//                 return model.big > 0 && model.small < 3;
//             }
//             run(impl, model) {
//                 const temp = model.small;
//                 impl.small = model.small = Math.min(model.big + model.small, 3);
//                 impl.big = model.big = model.big - (model.small - temp);
//                 return impl.big !== 4 && impl.big === model.big;
//             }
//             get name() {
//                 return "BigToSmall";
//             }
//         };
//         const DieHard = class {
//             constructor(big = 0, small = 0) {
//                 this.big = big;
//                 this.small = small;
//             }
//         };
//         const commands = jscCommands.commands(
//             jscCommands.command(FillBig),
//             jscCommands.command(FillSmall),
//             jscCommands.command(EmptyBig),
//             jscCommands.command(EmptySmall),
//             jscCommands.command(SmallToBig),
//             jscCommands.command(BigToSmall),
//         );
//         const warmup = () =>
//             Object.assign(Object.create(null), {
//                 state: new DieHard(),
//                 model: {
//                     big: 0,
//                     small: 0,
//                 },
//             });
//         // const teardown = () => {};

//         let retries = 0;
//         while (retries < 10) {
//             try {
//                 await jscCommands.assertForall(
//                     // jsc.integer(0, 5),
//                     commands,
//                     warmup,
//                     // teardown,
//                 );
//                 retries += 1;
//             } catch (error) {
//                 // failed post condition means that solution was found
//                 t.ok(true);
//             }
//         }
//         t.end();
//     } catch (error) {
//         t.end(error);
//     }
// });
