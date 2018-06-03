export const _refreshButton = props => {
    const { render, refresh } = props;
    return render`
        <button onclick=${refresh}>Refresh State</button>
        `;
};

export const refreshButton = props => {
    const state = {
        refresh: props._actions.refresh,
    };
    return props.cn(_refreshButton, state);
};
