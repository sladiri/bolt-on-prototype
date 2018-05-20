// setImmediate is broken because of webpack-env + mjs https://github.com/webpack/webpack/issues/7032
const setImmediate = func => {
    return setTimeout(func, 0);
};

export const propose = ({
    accept,
    render,
    nextAction,
    actionsInProgress,
}) => async ({ proposal, nameSpace = "default" }) => {
    try {
        let actionId = Math.random();
        while (actionsInProgress.get(nameSpace) === actionId) {
            actionId = Math.random();
        }
        actionsInProgress.set(nameSpace, actionId);
        setImmediate(async () => {
            const localId = actionsInProgress.get(nameSpace);
            try {
                const data = await proposal;
                if (!data) {
                    return;
                }
                if (localId !== actionsInProgress.get(nameSpace)) {
                    return;
                }
                await accept(data);
                render();
                setImmediate(nextAction);
            } catch (error) {
                console.error(
                    `PROPOSE error awaiting proposal [${localId}]:`,
                    error,
                );
                throw error;
            }
        });
    } catch (error) {
        console.error("PROPOSE error", error);
        throw error;
    }
};

export const Propose = ({ accept, render, nextAction }) => {
    const actionsInProgress = new Map();
    return propose({
        accept,
        render,
        nextAction,
        actionsInProgress,
    });
};
