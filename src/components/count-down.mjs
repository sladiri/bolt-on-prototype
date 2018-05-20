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

export const _countDown = props => {
    if (typeof document === "object") {
        // @ts-ignore
        import("./count-down.pcss");
    }
    const { render, counter, countDown } = props;
    const titleClass = ["counter", `counter--${getCounterColour({ counter })}`]
        .filter(x => !!x.length)
        .join(" ");
    const text = counter === 10 ? "" : `[${counter}]`;
    return render()`
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

export const countDownA = (props, namespace) => {
    const state = {
        counter: props._state.counters[0],
        countDown: arg => {
            props._actions.countDown({ ...arg, counterId: 0 });
        },
    };
    return props.connect(_countDown, state, `${namespace}-0`);
};

export const countDownB = (props, namespace) => {
    const state = {
        counter: props._state.counters[1],
        countDown: arg => {
            props._actions.countDown({ ...arg, counterId: 1 });
        },
    };
    return props.connect(_countDown, state, `${namespace}-1`);
};
