export const countDown = async ({ render, state, actions }) => {
    return render(state)`
        <section>
            <h1>Counter: [${state.counter}]</h1>
            <button onclick=${actions.countDown}>Decrement</button>
            <button onclick=${reset(actions)}>Reset</button>
        </section>
    `;
};

const reset = actions => () => {
    actions.countDown({ value: null });
};
