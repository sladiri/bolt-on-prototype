import viper from "viperhtml";
// @ts-ignore
import { app, Accept } from "../../../../../../app";
// @ts-ignore
import { posts } from "../../../entity";

const titleRegex = /<title>\n*(?<title>.*)\n*<\/title>/;

export const renderString = ({ posts }) => async ({ body, query }) => {
  const state = {
    _ssr: true,
    posts: [],
    // @ts-ignore
    title: titleRegex.exec(body).groups.title,
    name: "EMPTY",
    query,
  };
  const accept = Accept({ state });
  await accept({ posts }); // Test server side state update
  const appString = viper.wire()`
    <script>
      window.dispatcher = {
        toReplay: [],
      }
    </script>
    <section id="app" data-app=${JSON.stringify(state)}>
      ${await app({
        render: () => viper.wire(),
        wire: () => () => viper.wire(),
        state,
        actions: {
          refresh(event) {
            console.log("ssr refresh", event, this);
          },
          fetchPosts(event) {
            console.log("ssr fetchPosts", event, this);
          },
        },
        dispatch: (_name, _handler, ..._args) => `{
          const name = '${_name}';
          const handler = (${_handler});
          const args = ${JSON.stringify(_args)};
          window.dispatcher.toReplay.push({
            name,
            handler,
            args,
            target: this,
            event,
          });
        }`,
      })}
    </section>
  `;
  return body.replace(/##SSR##/, appString);
};

export const appString = renderString({ posts });
