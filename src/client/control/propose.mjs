// setImmediate is broken because of webpack-env + mjs https://github.com/webpack/webpack/issues/7032
const setImmediate = func => {
    return setTimeout(func, 0);
};

export const propose = ({ accept, render, nextAction, inProgress }) => async (
    { proposal },
    cancellable,
) => {
    try {
        let actionId;
        if (cancellable) {
            inProgress.value = actionId = !inProgress.value;
        }
        const data = await proposal;
        if (!data) {
            return;
        }
        if (cancellable && actionId !== inProgress.value) {
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
    const inProgress = { value: true };
    return propose({
        accept,
        render,
        nextAction,
        inProgress,
    });
};
