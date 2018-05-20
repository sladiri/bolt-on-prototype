export const _refreshButton = props => {
    const { render, name, refresh } = props;
    return render()`
        <section>
            <h1>Refresh Button, ${name}</h1>
            <button onclick=${refresh}>Refresh State</button>
        </section>
    `;
};

export const refreshButton = (props, namespace) => {
    const { name } = props._state;
    const { refresh } = props._actions;
    const state = { name, refresh };
    return props.connect(_refreshButton, state, namespace);
};
