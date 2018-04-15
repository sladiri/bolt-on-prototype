import assert from "assert";
import "./index.pcss";

// export const app = async () => { // Babel transpiled dynamic imports do not correctly work with export from module (mjs)
const app = async () => {
  console.log("app start");

  const container = document.querySelector("#container");
  assert.ok(container);

  const params = new URL(location.href).searchParams;
  const RENDERING_IN_HEADLESS = params.has("headless");
  if (RENDERING_IN_HEADLESS) {
    // Being rendered by headless Chrome on the server.
    // e.g. shut off features, don't lazy load non-essential resources, etc.
    await renderPosts(container);
  } else {
    assert.ok(container.querySelector("#posts"));
    await dynamicImport();
    return;
  }
};

const renderPosts = async container => {
  const postsData = await fetch("/posts").then(resp => resp.json());

  const { hyper } = await import("hyperhtml/esm");
  // @ts-ignore
  const { Posts } = await import("../posts/index.mjs");

  const posts = Posts({ postsData });
  hyper(container)`<ul id="posts">${posts}</ul>`;

  console.log("posts rendered");
};

const dynamicImport = async () => {
  const { default: Gun } = await import("gun/gun");

  // var todos = Gun().get("todos");
  const todos = Gun("https://localhost:3002").get("todos");

  console.log("load todo");

  const $ = window.jQuery;

  $("form").on("submit", function(event) {
    var input = $("form").find("input");
    todos.set({ title: input.val() });
    input.val("");
    event.preventDefault();
  });

  todos.map().on(function(todo, id) {
    var li = $("#" + id);
    if (!li.get(0)) {
      li = $("<li>")
        .attr("id", id)
        .appendTo("#gunlist");
    }
    if (todo) {
      console.log("got todo");
      var html = '<span onclick="clickTitle(this)">' + todo.title + "</span>";
      html =
        '<input type="checkbox" onclick="clickCheck(this)" ' +
        (todo.done ? "checked" : "") +
        ">" +
        html;
      li.html(html);
    }
  });

  window.clickTitle = element => {
    element = $(element);
    if (!element.find("input").get(0)) {
      element.html(
        '<input value="' +
          element.html() +
          '" onkeyup="keypressTitle(this, event)">',
      );
    }
  };

  window.keypressTitle = (element, event) => {
    if (event.keyCode === 13) {
      todos
        .get(
          $(element)
            .parent()
            .parent()
            .attr("id"),
        )
        .put({ title: $(element).val() });
    }
  };

  window.clickCheck = element => {
    todos
      .get(
        $(element)
          .parent()
          .attr("id"),
      )
      .put({ done: $(element).prop("checked") });
  };
};

app(); // Babel transpiled dynamic imports do not correctly work with mjs
