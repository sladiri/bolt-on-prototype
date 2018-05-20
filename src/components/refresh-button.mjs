export const refreshButton = ({ render, state, actions }) => {
    return render(state)`
        <section>
            <h1>Refresh Button, ${state.name}</h1>
            <button onclick=${actions.refresh}>Refresh State</button>
        </section>
    `;
};
