import { refreshButton } from "../components/refresh-button";
import { refreshInput } from "../components/refresh-input";
import { posts } from "../components/posts";
import { todos } from "../components/todos";
import { countDown } from "../components/count-down";

export const home = {
    landMarks: [
        ["CountDowns", "CountDowns Test"],
        ["Todos", "Todos Test"],
        ["RefreshButton", "RefreshButton Test"],
        ["RefreshInput", "RefreshInput Test"],
        ["Posts", "Posts Test"],
    ],
    page: props => {
        const { render, connect, title, name } = props;
        return render`
            <h1 id="main">${title}, ${name}</h1>
            ${refreshButton(props)}
            ${connect(
                sections,
                { name },
            )}
            `;
    },
};

export const sections = props => {
    const { render, connect, name } = props;
    return render`
        <section>
            <h1 id="CountDowns">CountDowns Test, ${name}</h1>
            ${[0, 1].map(mapCountDowns(props))}
        </section>
        <section>
            <h1 id="Todos">Todos Test, ${name}</h1>
            ${connect(
                todos,
                0,
            )}
            ${connect(
                todos,
                1,
            )}
        </section>
        <section>
            <h1 id="RefreshButton">Refresh Button Test, ${name}</h1>
            ${connect(
                refreshButton,
                0,
            )}
            ${connect(
                refreshButton,
                1,
            )}
        </section>
        <section>
            <h1 id="RefreshInput">Refresh Input Test, ${name}</h1>
            ${connect(
                refreshInput,
                0,
            )}
            ${connect(
                refreshInput,
                1,
            )}
        </section>
        <section>
            <h1 id="Posts">Posts Test, ${name}</h1>
            ${connect(
                posts,
                0,
            )}
            ${connect(
                posts,
                1,
            )}
        </section>
        `;
};

export const mapCountDowns = props => i => {
    const state = {
        counter: props._state.counters[i],
        countDown: arg => {
            props._actions.countDown({ ...arg, counterId: i });
        },
    };
    return props.connect(
        countDown,
        state,
        null,
        i,
    );
};
