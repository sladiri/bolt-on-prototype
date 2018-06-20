export const title = "Bolt-on Prototype";
export const description = "Bolt-on Protocol Example App";

export const Home = {
    skips: [["Main", "Main Content"]],
    title,
    description,
    page: props => {
        const { render } = props;
        return render`
            <h1 id="Main" tabindex="-1">Bolt-on Protocol Prototype App</h1>
            <button onclick=${props.actions.foo}>PouchDB Info</button>
            `;
    },
};
