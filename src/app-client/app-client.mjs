import { ClientApp } from "hypersam/src/client";
import { appShell } from "../app-shell/app-shell";
import { Actions } from "../app-shell/actions";
import { Accept, nextAction } from "../app-shell/model";
import { Service } from "../app-shell/service";

const dbPath = `${window.location.origin}/api/couch`;
const dbName = "bolton";

export const service = (() => {
    let ensured;
    let _service;
    return async () => {
        if (!ensured) {
            const { default: PouchDB } = await import("pouchdb");
            _service = Service({ PouchDB, dbPath, dbName });
            ensured = true;
        }
        return _service;
    };
})();

export const clientAppOptions = {
    app: appShell,
    rootElement: document.body,
    Accept,
    Actions,
    nextAction,
    service,
};

(async () => {
    try {
        await ClientApp(clientAppOptions);
    } catch (error) {
        console.error("App error", error);
        alert(error.message);
    }
})();
