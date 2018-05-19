import "setimmediate";
export const propose = ({
    accept,
    render,
    nap,
    actionsInProgress,
}) => async proposal => {
    if (!proposal) {
        return;
    }
    let actionId = Math.random();
    try {
        if (actionsInProgress.size) {
            // console.warn(
            //     `PROPOSE: Abort, proposals in progress [${[
            //         ...actionsInProgress.values(),
            //     ]}] ...`,
            // );
            return;
        }
        while (actionsInProgress.has(actionId)) {
            actionId = Math.random();
        }
        actionsInProgress.add(actionId);
        // console.log(`PROPOSE: awaiting proposal [${actionId}] ...`, proposal);
        const data = await proposal;
        if (data) {
            // console.log(`PROPOSE: data [${actionId}]`, data);
            await accept(data);
            render();
            setTimeout(nap, 0); // setImmediate is broken because of webpack-env + mjs https://github.com/webpack/webpack/issues/7032
        }
        actionsInProgress.delete(actionId);
        // console.log(`PROPOSE: acceptor done [${actionId}]`);
    } catch (error) {
        console.error(`PROPOSE error for action [${actionId}]:`, error);
        throw error;
    }
};

export const Propose = ({ accept, render, nap }) => {
    return propose({ accept, render, nap, actionsInProgress: new Set() });
};
