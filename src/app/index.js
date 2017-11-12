// @ts-check
import * as ReactDOM from "react-dom";
import getDb from "./pouch";
import { getLocalStore, getShim } from "./bolton";
import getApp from "./root";

const setupShim = async ({ dbOpts }) => {
  const db = await getDb(dbOpts);

  const setToCheck = new Set();

  const localStore = getLocalStore({ setToCheck });

  return getShim({ localStore, setToCheck, ecds: db });
};

const renderApp = ({ shim }) => {
  const rootEl = document.createElement("div");

  document.body.appendChild(rootEl);

  const app = getApp({ shim });

  ReactDOM.render(app, rootEl);
};

(async () => {
  try {
    const dbOpts = {
      localOpts: { name: "bolt-on-test-db" },
      remoteOpts: { host: "", name: "" }
    };

    const shim = await setupShim({ dbOpts });

    renderApp({ shim });
  } catch (error) {
    console.error("app -", error);
  }
})();
