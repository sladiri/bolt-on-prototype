import viper from "viperhtml";
// @ts-ignore
import { App } from "../../../../../app";
// @ts-ignore
import { acceptor } from "../../../../../app/acceptor";
// @ts-ignore
import { posts as postsData } from "../../entity";

const titleRegex = /<title>\n*(?<title>.*)\n*<\/title>/;

export const renderString = ({ App, acceptor, postsData }) => async ({
  body,
  query,
}) => {
  // set some static state
  const state = {
    _ssr: true,
    posts: [],
    title: titleRegex.exec(body).groups.title,
    query,
  };
  // Update state through app logic
  await acceptor(state)({ posts: postsData });
  const props = {
    render: viper,
    wire: viper,
    dispatch: (hook, data) => `
      const ssrData = ${JSON.stringify(data)};
      if (typeof ssrData === 'object' && !Object.keys(ssrData).length) {
        console.warn('SSR DISPATCH: Empty object as dispatch data, have you passed a Promise?');
      }
      const action = (${hook})(ssrData).call(this, event);
      window.dispatcher.toReplay.push(action);
      console.log('SSR toReplay', window.dispatcher.toReplay.length);
    `,
    propose: (...args) => `
      const ssrArgs = ${JSON.stringify(args)};
      throw new Error('SSR PROPOSE: Must not be called on SSR render');
    `,
  };
  // test server side rendered click handler
  let appString = await App(props)({ model: state });
  appString = viper.wire()`
    <script>
      window.dispatcher = window.dispatcher || {
        state: "${JSON.stringify(state)}",
        toReplay: [],
      };
    </script>
    <section id="app">
      ${appString}
    </section>
  `;
  return body.replace(/##SSR##/, appString);
};

export const appString = renderString({
  App,
  acceptor,
  postsData,
});
