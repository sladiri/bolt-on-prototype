export const title = "Foo";
export const description = "Foo description";

export const foo = props => {
    const { render } = props;
    return render`
        <h1 id="Main" tabindex="-1">${title} Heading</h1>
        `;
};

export const Foo = {
    skips: [["Main", "Main Content"]],
    title,
    description,
    page: props => {
        const { title } = props._state;
        return props.cn(foo, { title });
    },
};
