// import assert from "assert";
// import { Component, bind, hyper, wire } from "hyperhtml/esm";
// import hyperhtml from "hyperhtml";
// import "./index.pcss";
// @ts-ignore
import { dynamicImportButton } from "./dynamic-import-test";

export const app = async ({ render, model }) => {
  // TODO: Conditional CSS loading? Maybe have CSS in context and use HTTP2 push?
  return render()`
    <h1>${model.title}</h1>
    ${await dynamicImportButton({ render })}
    <section id="posts"></section>
  `;
  // await renderPosts(container);
  // assert.ok(container.querySelector("#posts"));
  // await dynamicImport();
};

// const renderGunPosts = () => {
//   //   <section>
//   //   <h2 onclick=${e => {
//   //     console.log("fooo", e);
//   //   }}>Todos</h2>
//   //   <ul id="gunlist"></ul>
//   //   <form>
//   //     <input>
//   //     <button>Add</button>
//   //   </form>
//   // </section>
// };

// const renderPosts = async container => {
//   // const postsData = await fetch("/posts").then(resp => resp.json());

//   if (typeof document === "object") {
//     const { hyper } = await import("hyperhtml/esm");
//     debugger;
//   } else {
//     // const hyper = await import("viperhtml");
//     debugger;
//   }
//   // const { bind, wire } = await import("hypermorphic");
//   // console.log(bind, wire);
//   // @ts-ignore
//   // const { Posts } = await import("../posts/index.mjs");

//   // const posts = Posts({ postsData });
//   // hyper(container)`<ul id="posts">${posts}</ul>`;

//   // console.log("posts rendered");
// };

// const dynamicImport = async () => {
//   const { default: Gun } = await import("gun/gun");

//   // var todos = Gun().get("todos");
//   const todos = Gun("https://localhost:3002").get("todos");

//   console.log("load todo");

//   const $ = window.jQuery;

//   $("form").on("submit", function(event) {
//     var input = $("form").find("input");
//     todos.set({ title: input.val() });
//     input.val("");
//     event.preventDefault();
//   });

//   todos.map().on(function(todo, id) {
//     var li = $("#" + id);
//     if (!li.get(0)) {
//       li = $("<li>")
//         .attr("id", id)
//         .appendTo("#gunlist");
//     }
//     if (todo) {
//       console.log("got todo");
//       var html = '<span onclick="clickTitle(this)">' + todo.title + "</span>";
//       html =
//         '<input type="checkbox" onclick="clickCheck(this)" ' +
//         (todo.done ? "checked" : "") +
//         ">" +
//         html;
//       li.html(html);
//     }
//   });

//   window.clickTitle = element => {
//     element = $(element);
//     if (!element.find("input").get(0)) {
//       element.html(
//         '<input value="' +
//           element.html() +
//           '" onkeyup="keypressTitle(this, event)">',
//       );
//     }
//   };

//   window.keypressTitle = (element, event) => {
//     if (event.keyCode === 13) {
//       todos
//         .get(
//           $(element)
//             .parent()
//             .parent()
//             .attr("id"),
//         )
//         .put({ title: $(element).val() });
//     }
//   };

//   window.clickCheck = element => {
//     todos
//       .get(
//         $(element)
//           .parent()
//           .attr("id"),
//       )
//       .put({ done: $(element).prop("checked") });
//   };
// };
