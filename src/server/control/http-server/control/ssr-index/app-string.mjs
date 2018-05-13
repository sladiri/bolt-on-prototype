import viper from "viperhtml";
// @ts-ignore
import { app, Accept } from "../../../../../app";
// @ts-ignore
import { posts } from "../../entity";

const titleRegex = /<title>\n*(?<title>.*)\n*<\/title>/;

export const renderString = ({ posts }) => async ({ body, query }) => {
  // set some static state
  const state = {
    _ssr: true,
    posts: [],
    // @ts-ignore
    title: titleRegex.exec(body).groups.title,
    name: "EMPTY",
    query,
  };
  const accept = Accept({ state });
  await accept({ posts });
  // test server side rendered click handler
  const appString = viper.wire()`
    <section id="app" data-app=${JSON.stringify(state)}>
      ${await app({
        render: () => viper.wire(),
        wire: () => () => viper.wire(),
        state,
        actions: {},
      })}
    </section>
  `;
  return body.replace(/##SSR##/, appString);
};

export const appString = renderString({ posts });
