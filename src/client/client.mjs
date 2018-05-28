import { app, Accept, nextAction, Actions } from "../app";
import { ClientApp } from "../sam-container";

ClientApp({
    app,
    rootEl: document.getElementById("app"),
    Accept,
    Actions,
    nextAction,
}).catch(error => {
    console.error("App error", error);
});
