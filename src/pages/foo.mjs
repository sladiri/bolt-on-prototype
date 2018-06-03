export const name = "Foo";

export const foo = props => {
    const { render, title } = props;
    return render`
        <h1 id="Main" tabindex="-1">${name} of ${title}</h1>
        `;
};

export const Foo = {
    skips: [["Main", "Main Content"]],
    name,
    page: props => {
        const { title } = props._state;
        return props.cn(foo, { title });
    },
};
