// @ts-ignore
import { dynamicImportButton } from "./dynamic-import-test";

export const app = async props => {
  // TODO: Conditional CSS loading? Maybe have CSS in context and use HTTP2 push?
  return props.render()`
    <h1>${props.model.title}</h1>
    ${await dynamicImportButton(props)}
    <section id="posts"></section>
  `;
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
