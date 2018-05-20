// @ts-ignore
import {
    refreshButton,
    posts,
    todos,
    countDownA,
    countDownB,
    // @ts-ignore
} from "../components";

export const _main = props => {
    const { render, name } = props;
    return render()`
        <section>
            <h1>Todos Test, ${name}</h1>
            ${todos(props)}
        </section>
        <section>
            <h1>CountDowns Test, ${name}</h1>
            ${countDownA(props)}
            ${countDownB(props)}
        </section>
        <section>
            <h1>Posts Test, ${name}</h1>
            ${posts(props, 0)}
            ${posts(props, 1)}
        </section>
        <section>
            <h1>Refresh Buttons Test, ${name}</h1>
            ${refreshButton(props, 0)}
            ${refreshButton(props, 1)}
        </section>
    `;
};

export const main = (props, namespace) => {
    const state = { name: props._state.name };
    return props.connect(_main, state, namespace);
};

export const _app = props => {
    const { render, title, name } = props;
    return render()`
        <h1>${title}, ${name}</h1>
        <main>
            ${main(props)}
        </main>
    `;
};

export const app = props => {
    const { title, name } = props._state;
    return props.connect(_app, { title, name }, false);
};
