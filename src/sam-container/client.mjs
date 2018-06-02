import {
    setupSamHyperHtmlContainer,
    initialRender,
    replayIntermediateEvents,
} from "./control/client";

export const ClientApp = async options => {
    console.assert(window["dispatcher"], "dispatcher");
    const actions = await setupSamHyperHtmlContainer(options);
    // return;
    // await wait(2000);
    initialRender({ actions });
    // TODO: Do not allow actions until replay done?
    await replayIntermediateEvents({ actions });
    window["dispatcher"] = null;
    return actions;
};
