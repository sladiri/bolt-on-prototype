import { refreshButton } from "../components/refresh-button";
import { refreshInput } from "../components/refresh-input";
import { posts } from "../components/posts";
import { todos } from "../components/todos";
import { countDown } from "../components/count-down";

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

export const main = props => {
    const { render, connect, name } = props;
    return render`
        <section>
            <h1>CountDowns Test, ${name}</h1>
            ${[0, 1].map(mapCountDowns(props))}
        </section>
        <section>
            <h1>Todos Test, ${name}</h1>
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
            <h1>Refresh Button Test, ${name}</h1>
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
            <h1>Refresh Input Test, ${name}</h1>
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
            <h1>Posts Test, ${name}</h1>
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

export const appShell = props => {
    if (typeof document === "object") {
        import("./app-shell.pcss");
    }
    const { render, connect, title, name } = props;
    return render`
        <a href="/#main" class="skipLink">Skip To Main Content</a>
        <header></header>
        <main>
            <h1 id="main">${title}, ${name}</h1>
            ${refreshButton(props)}
            ${connect(
                main,
                { name },
            )}
        </main>
        <footer></footer>
    `;
};
