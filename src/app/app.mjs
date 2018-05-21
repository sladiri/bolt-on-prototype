// @ts-ignore
import {
    refreshButton,
    posts,
    todos,
    countDown,
    // @ts-ignore
} from "../components";

export const mapCountDowns = props => i => {
    const state = {
        counter: props._state.counters[i],
        countDown: arg => {
            props._actions.countDown({ ...arg, counterId: i });
        },
    };
    return props.connect(countDown, props, state, i);
};

export const main = props => {
    const { render, connect, name } = props;
    return render`
        <section>
            <h1>Refresh Button Test, ${name}</h1>
            ${connect(refreshButton, props, 0)}
            ${connect(refreshButton, props, 1)}
        </section>
        <section>
            <h1>CountDowns Test, ${name}</h1>
            ${[0, 1].map(mapCountDowns(props))}
        </section>
        <section>
            <h1>Todos Test, ${name}</h1>
            ${connect(todos, props, 0)}
            ${connect(todos, props, 1)}
        </section>
        <section>
            <h1>Posts Test, ${name}</h1>
            ${connect(posts, props, 0)}
            ${connect(posts, props, 1)}
        </section>
    `;
};

export const app = props => {
    if (typeof document === "object") {
        // @ts-ignore
        import("./app.pcss");
    }
    const { render, connect, title, name } = props;
    return render`
        <h1>${title}, ${name}</h1>
        <main>
            ${connect(main, props, { name })}
        </main>
    `;
};
