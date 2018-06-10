export const title = "Bolt-on Prototype";
export const description = "Bolt-on Protocol Example App";

export const Home = {
    skips: [["Main", "Main Content"]],
    title,
    description,
    page: props => {
        return props.cn(home);
    },
};

export const home = props => {
    const { render } = props;
    return render`
        <h1 id="Main" tabindex="-1">Bolt-on Protocol Prototype App</h1>
        `;
};
