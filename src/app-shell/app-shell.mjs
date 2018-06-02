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
        { name },
    );
    return render`
        <ul class="skipLinks">${skipLinks}</ul>
        <header role="banner"></header>
        <nav role="navigation"></nav>
        <h1>${title}, ${name}</h1>
        <main role="main">${content}</main>
        <footer role="contentinfo"></footer>
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
