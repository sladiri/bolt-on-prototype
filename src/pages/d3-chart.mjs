export const title = "D3 Chart";
export const description = "D3 Chart Test Page";

export const D3Chart = {
    skips: [["Main", "Main Content"]],
    title,
    description,
    page: props => {
        const state = {
            counter: props.state.counter,
        };
        return props.cn(d3Chart, state);
    },
};

export const d3Chart = props => {
    return props.render`
        <h1 id="Main" tabindex="-1">D3 Chart Test</h1>
        <section>
            ${svg(props)}
        </section>
        `;
};

export const svg = ({ _wire: wire }) => {
    return wire(null, "svg")`
        <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="red" fill="grey" />
            <circle cx="150" cy="50" r="4" stroke="red" fill="grey" />

            <svg viewBox="0 0 10 10" x="200" width="100">
                <circle cx="5" cy="5" r="4" stroke="red" fill="grey" />
            </svg>
        </svg>
        `;
};
