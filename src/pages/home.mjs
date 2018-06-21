export const title = "Bolt-on Prototype";
export const description = "Bolt-on Protocol Example App";

export const Home = {
    skips: [["Main", "Main Content"]],
    title,
    description,
    page: props => {
        const {
            cn,
            state: { busy, foo },
            actions: { dbInfo, fooIncrement },
        } = props;
        return cn(home, { busy, foo, dbInfo, fooIncrement });
    },
};

export const home = props => {
    const { render, busy, foo, dbInfo, fooIncrement } = props;
    return render`
        <h1 id="Main" tabindex="-1">Bolt-on Protocol Prototype App</h1>
        <button onclick=${dbInfo}>PouchDB Info</button>
        <h1 id="Foo" tabindex="-1">Foo</h1>
        <span>${foo}</span>
        <button onclick=${fooIncrement}>Foo +1</button>
        `;
};
