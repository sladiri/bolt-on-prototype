export const title = "Bar";
export const description = "Bar description";

export const bar = props => {
    const { render } = props;
    return render`
        <h1 id="Main" tabindex="-1">${title} Heading</h1>
        `;
};

export const Bar = {
    skips: [["Main", "Main Content"]],
    title,
    description,
    page: props => {
        const { title } = props.state;
        return props.cn(bar, { title });
    },
};
