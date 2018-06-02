export const _refreshButton = props => {
    const { render, refresh } = props;
    return render`
        <section>
            <button onclick=${refresh}>Refresh State</button>
        </section>
        `;
};

export const refreshButton = props => {
    const state = {
        refresh: props._actions.refresh,
    };
    return props.connect(
        _refreshButton,
        state,
    );
};
