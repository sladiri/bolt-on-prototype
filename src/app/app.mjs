// @ts-ignore
import { refreshButton, posts, todos, countDown } from "../components";

export const Main = ({
    refreshButton,
    posts,
    todos,
    countDown,
}) => async props => {
    const { render, wire, state, actions } = props;
    return render(state)`
        <section>
            <h1>CountDown 1, ${state.name}</h1>
            ${await countDown({
                ...props,
                render: wire(":countDown0"),
                counter: state.counters[0],
                countDown: (args = {}) => {
                    actions.countDown({ ...args, counterId: 0 });
                },
            })}
        </section>
        <section>
            <h1>CountDown 2, ${state.name}</h1>
            ${await countDown({
                ...props,
                render: wire(":countDown1"),
                counter: state.counters[1],
                countDown: (args = {}) => {
                    actions.countDown({ ...args, counterId: 1 });
                },
            })}
        </section>
        <section>
            <h1>Todos, ${state.name}</h1>
            ${await todos({ ...props, render: wire(":todos") })}
        </section>
        <section>
            <h1>Buttons, ${state.name}</h1>
            ${await refreshButton({
                ...props,
                render: wire(":refreshButton"),
            })}
            ${await refreshButton({
                ...props,
                render: wire(":refreshButton1"),
            })}
        </section>
        <section>
            <h1>Posts, ${state.name}</h1>
            ${await posts({ ...props, render: wire(":posts") })}
            ${await posts({ ...props, render: wire(":posts1") })}
        </section>
    `;
};

export const App = ({ main }) => {
    return async props => {
        const { render, wire, state } = props;
        return render(state)`
            <h1>${state.title}, ${state.name}</h1>
            <main>
                ${await main({ ...props, render: wire(":main") })}
            </main>
        `;
    };
};

export const app = App({
    main: Main({ refreshButton, posts, todos, countDown }),
});
