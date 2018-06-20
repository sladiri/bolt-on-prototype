import { ClientApp } from "hypersam/src/client";
import { appShell } from "../app-shell/app-shell";
import { Actions } from "../app-shell/actions";
import { Accept, nextAction } from "../app-shell/model";
import { Service } from "../app-shell/service";

const dbName = "bolton";
const dbPath = `${window.location.origin}/api/couch/${dbName}`;

const service = async () => {
    const { default: PouchDB } = await import("pouchdb");
    return Service({ PouchDB, dbPath });
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
