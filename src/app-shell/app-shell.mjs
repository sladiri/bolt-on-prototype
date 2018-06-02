import { skipLink } from "../components/skip-link";
import { home } from "../pages/home";

const pages = {
    default: home,
};

export const pageFromPath = path => pages.default;

export const appShell = props => {
    const {
        render,
        connect,
        _state: { title, name },
    } = props;
    const { skips = [], page } = pageFromPath();
    const skipLinks = renderSkipLinks({ connect, skips });
    const content = connect(
        page,
        { title, name },
    );
    return render`
        <ul class="skipLinks">${skipLinks}</ul>
        <header></header>
        <div role="navigation"></div>
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
