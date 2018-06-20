import { ClientApp } from "hypersam/src/client";
import { appShell } from "../app-shell/app-shell";
import { Actions } from "../app-shell/actions";
import { Accept, nextAction } from "../app-shell/model";

const service = async () => {
    const { default: PouchDB } = await import("pouchdb");
    const db = new PouchDB(`${window.location.origin}/api/couch/kittens`);
    return { db };
};

ClientApp({
    app: appShell,
    rootElement: document.body,
    Accept,
    Actions,
    nextAction,
    service,
}).catch(error => {
    console.error("App error", error);
});
