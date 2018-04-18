const loaderUtils = require("loader-utils");

module.exports = function myloader(source) {
  this.cacheable();

  if (!/default_index.ejs$/.test(this.resourcePath)) {
    return source;
  }

  return `
    const viper = require(${loaderUtils.stringifyRequest(
      this,
      // viperhtml includes uglify-js which has problems here, workaround is to comment uglify-js out (fork viperhtml)
      // https://github.com/webpack-contrib/uglifyjs-webpack-plugin/issues/226
      `!!${require.resolve("viperhtml")}`,
    )});
    module.exports = (${renderIndex})(viper);
  `;
};

const renderIndex = viper => ({ title }) => {
  return viper.wire()`
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <script src="https://code.jquery.com/jquery-1.12.4.min.js"></script>

      <title>
        ${title}
      </title>
    </head>

    <body class="sans">
      <section id="container"></section>

      <section>
        <h1 onclick=${e => {
          console.log("fooo", e);
        }}>Todos</h1>

        <ul id="gunlist"></ul>

        <form>
          <input>
          <button>Add</button>
        </form>
      </section>
    </body>

    </html>
  `.toString();
};
