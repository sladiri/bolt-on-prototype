export const Dispatch = ({ actions }) => (name, handler, ...args) => {
    return async function(event) {
        await handler(...args).apply(this, [event, actions[name]]);
    };
};

// setImmediate is broken because of webpack-env + mjs https://github.com/webpack/webpack/issues/7032
const setImmediate = func => {
    return setTimeout(func, 0);
};
export const clientPropose = ({
    accept,
    render,
    nextAction,
    inProgress,
}) => async ({ proposal }, cancelId) => {
    try {
        let actionFlag;
        if (cancelId) {
            const inProgressValue = !(inProgress.get(cancelId) || false);
            inProgress.set(cancelId, inProgressValue);
            actionFlag = inProgressValue;
        }
        const data = await proposal;
        if (!data) {
            return;
        }
        if (cancelId && actionFlag !== inProgress.get(cancelId)) {
            return;
        }
        await accept(data);
        render();
        setImmediate(nextAction);
    } catch (error) {
        console.error("Propose error", error);
        throw error;
    }
};

export const Propose = ({ accept, render, nextAction }) => {
    const inProgress = new Map();
    return clientPropose({
        accept,
        render,
        nextAction,
        inProgress,
    });
};

export const restoreSsrState = () => {
    const appContainer = window.document.querySelector("#app");
    console.assert(appContainer, "appContainer");
    console.assert(appContainer["dataset"].app, "appContainer.dataset.app");
    const state = Object.assign(
        Object.create(null),
        JSON.parse(window.document.querySelector("#app")["dataset"].app),
    );
    appContainer.removeAttribute("data-app");
    return state;
};

export const initialRender = async ({ actions }) => {
    console.assert(document, "document");
    const container = document.querySelector("#app");
    console.assert(container, "container");
    await actions.refresh();
};

const wait = delay => new Promise(res => setTimeout(res, delay));
export const replayIntermediateEvents = async ({ actions }) => {
    console.assert(window["dispatcher"].toReplay, "dispatcher.toReplay");
    console.log(`replaying [${window["dispatcher"].toReplay.length}] actions`);
    for (const entry of window["dispatcher"].toReplay) {
        console.log("replaying entry", entry);
        const { handler, args, name, target, event } = entry;
        const action = handler.apply(null, args);
        const hook = actions[name];
        await action.apply(target, [event, hook]);
        await wait(500);
    }
    console.log("replaying end");
};
