export const todos = async props => {
    return props.render(props.state)`
        <h1>TODO List, ${props.state.name}</h1>
        <button onclick=${props.actions.refresh}>Refresh State</button>
    `;
};
