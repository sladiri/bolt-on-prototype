import {
    restoreSsrState,
    setupSamHyperHtmlContainer,
    replayIntermediateEvents,
} from "./control/client";

export const ClientApp = async options => {
    const { ssr = true, dispatcher = true, rootElement } = options;
    if (dispatcher) {
        console.assert(window["dispatcher"], "dispatcher");
    }
    const state = ssr ? restoreSsrState({ rootElement }) : options.state;
    const { actions, render } = await setupSamHyperHtmlContainer({
        ...options,
        state,
    });
    // return;
    // await wait(2000);
    await render();
    // TODO: Do not allow actions until replay done?
    if (dispatcher) {
        await replayIntermediateEvents({ actions });
        window["dispatcher"] = null;
    }
    return actions;
};
