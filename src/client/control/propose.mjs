// setImmediate is broken because of webpack-env + mjs https://github.com/webpack/webpack/issues/7032
const setImmediate = func => {
    return setTimeout(func, 0);
};

export const propose = ({
    accept,
    render,
    nap,
    actionInProgress,
}) => async proposal => {
    try {
        let actionId = Math.random();
        while (actionInProgress.value === actionId) {
            actionId = Math.random();
        }
        actionInProgress.value = actionId;
        setImmediate(async () => {
            const localId = actionInProgress.value;
            try {
                const data = await proposal;
                if (!data) {
                    return;
                }
                if (localId !== actionInProgress.value) {
                    return;
                }
                await accept(data);
                render();
                setImmediate(nap);
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

export const Propose = ({ accept, render, nap }) => {
    return propose({ accept, render, nap, actionInProgress: { value: null } });
};
