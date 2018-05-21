// setImmediate is broken because of webpack-env + mjs https://github.com/webpack/webpack/issues/7032
const setImmediate = func => {
    return setTimeout(func, 0);
};

export const propose = ({ accept, render, nextAction, inProgress }) => async (
    { proposal },
    cancelId,
) => {
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
    return propose({
        accept,
        render,
        nextAction,
        inProgress,
    });
};
