export const _refreshButton = props => {
    const { render, name, refresh } = props;
    return render`
        <section>
            <h1>Refresh Button, ${name}</h1>
            <button onclick=${refresh}>Refresh State</button>
        </section>
    `;
};

export const refreshButton = props => {
    const state = {
        name: props._state.name,
        refresh: props._actions.refresh,
    };
    return props.connect(_refreshButton, props, state);
};
