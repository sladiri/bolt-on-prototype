// @ts-check
import * as React from "react";
import { Atom } from "@grammarly/focal";
import * as ReactDOM from "react-dom";
import { getDb } from "pouch";
import { getShim } from "boltOn";
import { getSam } from "sam";
import { App, defaultViewState, getStateRepresentation } from "./app-shell";
import { getActions } from "./app-shell/control";
import { getModel } from "./app-shell/entity";

const setupShim = async ({ dbOpts }) => {
  const db = await getDb(dbOpts);

  return await getShim({ ecds: db });
};

const renderApp = async ({ shim }) => {
  const viewState = Atom.create(defaultViewState);

  viewState.subscribe(x => {
    console.log(`App - New state: ${JSON.stringify(x)}`);
  });

  const { stateRepresentation, views } = getStateRepresentation({
    viewState,
  });

  const { propose, actionPending } = await getSam({
    model: getModel({ shim }),
    viewState,
    stateRepresentation,
    actions: getActions({ shim }),
  });

  const rootEl = document.createElement("div");
  document.body.appendChild(rootEl);

  ReactDOM.render(
    <App views={{ ...views, actionPending }} propose={propose} />,
    rootEl,
  );
};

(async () => {
  try {
    const dbOpts = {
      localOpts: { name: "bolt-on-test-db" },
      remoteOpts: { host: "", name: "" },
    };

    const shim = await setupShim({ dbOpts });

    await renderApp({ shim });
  } catch (error) {
    console.error("app -", error);
  }
})();
