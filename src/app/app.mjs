// @ts-ignore
import { refreshButton } from "./refresh-button";
// @ts-ignore
import { posts } from "./posts";

export const App = ({ refreshButton, posts }) => async props => props.render(
  props.state,
)`
  <h1>${props.state.title}</h1>
  <section>
    <h1>Buttons, ${props.state.name}</h1>
    ${await refreshButton({ ...props, render: props.wire(":refreshButton") })}
    ${await refreshButton({ ...props, render: props.wire(":refreshButton1") })}
  </section>
  <section>
    <h1>Posts, ${props.state.name}</h1>
    ${await posts({ ...props, render: props.wire(":posts") })}
    ${await posts({ ...props, render: props.wire(":posts1") })}
  </section>
`;

export const app = App({ refreshButton, posts });

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
