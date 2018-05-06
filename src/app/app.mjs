// @ts-ignore
import { dynamicImportButton } from "./dynamic-import-test";

export const renderApp = ({ dynamicImportButton }) => props => {
  return async ({ model }) => {
    // TODO: Conditional CSS loading? Maybe have CSS in context and use HTTP2 push?
    const childProps = { ...props, model };
    return props.wire(model)`
      <h1>${model.title}</h1>
      <button
        disabled=${model._ssr}
        onclick=${update(childProps)}
      >Update</button>
      <button
        disabled=${model._replay}
        onclick=${props.dispatch(updateSSR, model.title)}
      >Update 2</button>
      ${await dynamicImportButton(childProps)}
      <section id="posts"></section>
    `;
  };
};

const update = props =>
  function(event) {
    console.log("propose test", this, event, props);
    props.propose({ title: `${Math.random()}` });
  };

const updateSSR = data =>
  function(event) {
    console.log("dispatch test", this, event, data);
    return { title: `${Math.random()}` };
  };

export const App = renderApp({ dynamicImportButton });

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
