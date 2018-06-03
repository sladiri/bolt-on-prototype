export const name = "Bar";

export const bar = props => {
    const { render, title } = props;
    return render`
        <h1 id="Main" tabindex="-1">${name} of ${title}</h1>
        `;
};

export const Bar = {
    skips: [["Main", "Main Content"]],
    name,
    page: props => {
        const { title } = props._state;
        return props.cn(bar, { title });
    },
};
