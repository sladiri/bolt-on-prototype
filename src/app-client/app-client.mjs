import { ClientApp } from "hypersam/src/client";
import { appShell } from "../app-shell/app-shell";
import { Actions } from "../app-shell/actions";
import { Accept, nextAction } from "../app-shell/model";
import { Service } from "../app-shell/service";

const dbPath = `${window.location.origin}/api/couch`;
const dbName = "bolton";

// TODO read/write existing cookie
const shimId = "a";
// const tick = Number.MIN_SAFE_INTEGER; // TODO use BigInt?
const tick = 10; // TODO use BigInt?

export const service = (() => {
    let ensured;
    let _service;
    return async () => {
        if (!ensured) {
            const { default: PouchDB } = await import("pouchdb");
            _service = Service({ PouchDB, dbPath, dbName, shimId, tick });
            ensured = true;
        }
        return _service;
    };
})();

(async () => {
    try {
        const clientAppOptions = {
            app: appShell,
            rootElement: document.body,
            accept: Accept({ service }),
            actions: Actions({ service }),
            nextAction,
        };
        await ClientApp(clientAppOptions);
    } catch (error) {
        console.error("App error", error);
        alert(error.message);
    }
})();
