import { skipLink } from "../components/skip-link";
import { home } from "../pages/home";

const pages = {
    "/": home,
};

export const pageFromRoute = ({ route }) => {
    const page = pages[route] || pages["/"];
    return page;
};

export const appShell = props => {
    const {
        render,
        connect,
        _state: { route, title, name },
    } = props;
    const { skips = [], page } = pageFromRoute({ route });
    const skipLinks = renderSkipLinks({ connect, skips });
    const content = connect(
        page,
        { title, name },
    );
    return render`
        <ul class="skipLinks">${skipLinks}</ul>
        <header></header>
        <div role="navigation">
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/app/foo">Foo</a></li>
                <li><a href="/app/bar">Bar</a></li>
            </ul>
        </div>
        <div role="main">${content}</div>
        <footer></footer>
        `;
};

export const renderSkipLinks = ({ connect, skips }) => {
    return skips.map(([id, label], i) =>
        connect(
            props => props.render`<li>${skipLink(props)}</li>`,
            { id, label },
            null,
            i,
        ),
    );
};
