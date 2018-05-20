export const countDown = async ({ render, state, counter, countDown }) => {
    if (typeof document === "object") {
        // @ts-ignore
        await import("./count-down.pcss");
    }
    const titleClass = ["counter", `counter--${getCounterColour({ counter })}`]
        .filter(x => !!x.length)
        .join(" ");
    const text = counter === 10 ? "" : `[${counter}]`;
    return render(state)`
        <section>
            <h1 class=${titleClass}>Counter ${text}</h1>
            <button
                disabled=${counter !== 10}
                onclick=${countDown}
            >
                Start
            </button>
            <button
                disabled=${counter === 10}
                onclick=${reset(countDown)}
            >
                Reset
            </button>
        </section>
    `;
};

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

export const reset = countDown => () => {
    countDown({ value: null });
};
