export const getCounterColour = ({ counter }) => {
    if (counter === 10) {
        return "reset";
    }
    if (counter > 6) {
        return "fine";
    }
    if (counter > 3) {
        return "warning";
    }
    if (counter > 0) {
        return "critical";
    }
    return "done";
};

export const countDown = async ({ render, state, actions }) => {
    if (typeof document === "object") {
        // @ts-ignore
        await import("./count-down.pcss");
    }
    const titleClass = [
        "counter",
        `counter--${getCounterColour({ counter: state.counter })}`,
    ]
        .filter(x => !!x.length)
        .join(" ");
    const text = state.counter === 10 ? "" : `[${state.counter}]`;
    return render(state)`
        <section>
            <h1 class=${titleClass}>Counter ${text}</h1>
            <button
                disabled=${state.counter !== 10}
                onclick=${actions.countDown}
            >
                Start
            </button>
            <button
                disabled=${state.counter === 10}
                onclick=${reset(actions)}
            >
                Reset
            </button>
        </section>
    `;
};

const reset = actions => () => {
    actions.countDown({ value: null });
};
