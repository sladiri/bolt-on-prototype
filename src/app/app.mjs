import {
    refreshButton,
    refreshInput,
    posts,
    todos,
    countDown,
} from "../components";

export const mapCountDowns = props => i => {
    const state = {
        counter: props._state.counters[i],
        countDown: arg => {
            props._actions.countDown({ ...arg, counterId: i });
        },
    };
    return props.connect(countDown, state, null, i);
};

export const main = props => {
    const { render, connect, name } = props;
    return render`
        <section>
            <h1>CountDowns Test, ${name}</h1>
            ${[0, 1].map(mapCountDowns(props))}
        </section>
        <section>
            <h1>Todos Test, ${name}</h1>
            ${connect(todos, 0)}
            ${connect(todos, 1)}
        </section>
        <section>
            <h1>Refresh Button Test, ${name}</h1>
            ${connect(refreshButton, 0)}
            ${connect(refreshButton, 1)}
        </section>
        <section>
            <h1>Refresh Input Test, ${name}</h1>
            ${connect(refreshInput, 0)}
            ${connect(refreshInput, 1)}
        </section>
        <section>
            <h1>Posts Test, ${name}</h1>
            ${connect(posts, 0)}
            ${connect(posts, 1)}
        </section>
    `;
};

export const app = props => {
    if (typeof document === "object") {
        import("./app.pcss");
    }
    const { render, connect, title, name } = props;
    return render`
        <main>
            <h1>${title}, ${name}</h1>
            ${refreshButton(props)}
            ${connect(main, { name })}
        </main>
    `;
};
