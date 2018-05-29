import { app } from "../app/app";
import { Actions } from "../app/actions";
import { Accept, nextAction } from "../app/model";
import { ClientApp } from "../sam-container/client";

ClientApp({
    app,
    rootEl: document.getElementById("app"),
    Accept,
    Actions,
    nextAction,
}).catch(error => {
    console.error("App error", error);
});
