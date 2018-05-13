import viper from "viperhtml";
// @ts-ignore
// import { app, Accept } from "../../../../../app";
// @ts-ignore
import { posts as postsData } from "../../entity";

const titleRegex = /<title>\n*(?<title>.*)\n*<\/title>/;

export const renderString = ({ postsData }) => async ({ body, query }) => {
  // set some static state
  const state = {
    _ssr: true,
    posts: postsData,
    title: titleRegex.exec(body).groups.title,
    query,
  };
  // test server side rendered click handler
  const appString = viper.wire()`
    <script>
      window.dispatcher = window.dispatcher || {
        state: "${JSON.stringify(state)}",
        toReplay: [],
      };
    </script>
    <section id="app">
    </section>
  `;
  return body.replace(/##SSR##/, appString);
};

export const appString = renderString({
  postsData,
});
