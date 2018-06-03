export const getCounterColour = ({ counter }) => {
    if (counter === 20) {
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

export const CountDown = countDown =>
    function() {
        this.setAttribute("disabled", "true");
        countDown({});
    };

export const Reset = countDown =>
    function() {
        this.setAttribute("disabled", "true");
        countDown({ value: null });
    };

export const countDown = props => {
    if (typeof window === "object") {
        import("./count-down.pcss");
    }
    const { render, counter, countDown } = props;
    const text = counter === 20 ? "" : `[${counter}]`;
    return render`
        <p class=${`counter--${getCounterColour({
            counter,
        })}`}>Counter ${text}</p>
        <button
            disabled=${counter !== 20}
            onclick=${CountDown(countDown)}
        >
            Start
        </button>
        <button
            disabled=${counter === 20}
            onclick=${Reset(countDown)}
        >
            Reset
        </button>
        `;
};
