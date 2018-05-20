// @ts-ignore
import { refreshButton, posts, todos, countDown } from "../components";

export const Main = ({
    refreshButton,
    posts,
    todos,
    countDown,
}) => async props => {
    const { render, wire, state } = props;
    return render(state)`
        <section>
            <h1>CountDown, ${state.name}</h1>
            ${await countDown({ ...props, render: wire(":countDown") })}
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
