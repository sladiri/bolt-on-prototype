import { refreshButton } from "../components/refresh-button";
import { refreshInput } from "../components/refresh-input";
import { posts } from "../components/posts";
import { todos } from "../components/todos";
import { countDown } from "../components/count-down";

export const title = "Bolt-on Prototype";
export const description = "Bolt-on Protocol Example App";

export const Home = {
    skips: [
        ["Main", "Main Content"],
        ["CountDowns", "CountDowns Test"],
        ["Todos", "Todos Test"],
        ["RefreshInput", "RefreshInput Test"],
        ["Posts", "Posts Test"],
    ],
    title,
    description,
    page: props => {
        const { title, rand } = props.state;
        return props.cn(home, { title, rand });
    },
};

export const home = props => {
    const { render, cn, rand } = props;
    return render`
        <h1 id="Main" tabindex="-1">${title} Heading</h1>
        ${refreshButton(props)}
        <br />
        ${cn(sections, { rand })}
        `;
};

export const sections = props => {
    const { render, cn, rand } = props;
    return render`
        <section>
            <h2 id="CountDowns" tabindex="-1">CountDowns Test, ${rand}</h1>
            ${[0, 1].map(mapCountDowns(props))}
        </section>
        <section>
            <h2 id="Todos" tabindex="-1">Todos Test, ${rand}</h2>
            ${cn(todos, 0)}
            ${cn(todos, 1)}
        </section>
        <section>
            <h2 id="RefreshInput" tabindex="-1">Refresh Input Test, ${rand}</h2>
            ${cn(refreshInput, 0)}
            <br />
            ${cn(refreshInput, 1)}
        </section>
        <section>
            <h2 id="Posts" tabindex="-1">Posts Test, ${rand}</h2>
            ${cn(posts, 0)}
            ${cn(posts, 1)}
        </section>
        `;
};

export const mapCountDowns = props => i => {
    const state = {
        counter: props.state.counters[i],
        countDown: arg => {
            props.actions.countDown({ ...arg, counterId: i });
        },
    };
    return props.cn(countDown, state, null, i);
};
