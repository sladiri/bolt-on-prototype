export const refreshButton = async props => props.render(props.state)`
  <section>
    <h1>Refresh Button, ${props.state.name}</h1>
    <button onclick=${props.actions.refresh}>Refresh State</button>
  </section>
`;
