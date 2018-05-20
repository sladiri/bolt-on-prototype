// @ts-ignore
import { refreshButton, posts, todos, countDown } from "../components";

export const Main = ({ refreshButton, posts, todos, countDown }) => props => {
    const { render, wire, state, actions } = props;
    const countDownA = countDown({
        ...props,
        render: wire(":countDownA"),
        counter: state.counters[0],
        countDown: (args = {}) => {
            actions.countDown({ ...args, counterId: 0 });
        },
    });
    const countDownB = countDown({
        ...props,
        render: wire(":countDownB"),
        counter: state.counters[1],
        countDown: (args = {}) => {
            actions.countDown({ ...args, counterId: 1 });
        },
    });
    return render(state)`
        <section>
            <h1>CountDown A, ${state.name}</h1>
            ${countDownA}
        </section>
        <section>
            <h1>CountDown B, ${state.name}</h1>
            ${countDownB}
        </section>
        <section>
            <h1>Todos, ${state.name}</h1>
            ${todos({ ...props, render: wire(":todos") })}
        </section>
        <section>
            <h1>Buttons, ${state.name}</h1>
            ${refreshButton({
                ...props,
                render: wire(":refreshButton"),
            })}
            ${refreshButton({
                ...props,
                render: wire(":refreshButton1"),
            })}
        </section>
        <section>
            <h1>Posts, ${state.name}</h1>
            ${posts({ ...props, render: wire(":posts") })}
            ${posts({ ...props, render: wire(":posts1") })}
        </section>
    `;
};

export const App = ({ main }) => {
    return props => {
        const { render, wire, state } = props;
        return render(state)`
            <h1>${state.title}, ${state.name}</h1>
            <main>
                ${main({ ...props, render: wire(":main") })}
            </main>
        `;
    };
};

export const app = App({
    main: Main({ refreshButton, posts, todos, countDown }),
});
