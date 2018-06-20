export const title = "Bolt-on Prototype";
export const description = "Bolt-on Protocol Example App";

export const Home = {
    skips: [["Main", "Main Content"]],
    title,
    description,
    page: props => {
        const {
            cn,
            actions: { dbInfo },
        } = props;
        return cn(home, { dbInfo });
    },
};

export const home = props => {
    const { render, dbInfo } = props;
    return render`
        <h1 id="Main" tabindex="-1">Bolt-on Protocol Prototype App</h1>
        <button onclick=${dbInfo}>PouchDB Info</button>
        `;
};
