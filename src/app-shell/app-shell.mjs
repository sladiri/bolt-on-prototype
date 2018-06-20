import { UpdateHeadScript } from "hypersam/src/update-head-script";
import { routeStatus } from "../components/route-status";
import { skipLink } from "../components/skip-link";
import { Home } from "../pages/home";

export const pages = {
    home: Home,
};

const updateHeadScript = UpdateHeadScript();
export const appShell = props => {
    const {
        render,
        cn,
        state: { route },
        _wire,
    } = props;
    const { skips = [], title, description, page } = pages[route] || Home;
    return render`
        ${cn(routeStatus, { title })}
        <ul class="skipLinks">${renderSkipLinks({ cn, skips })}</ul>
        <header></header>
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
            </ul>
        </nav>
        <main>${cn(page)}</main>
        ${updateHeadScript({ render: _wire(), page, title, description })}
        <footer></footer>
        `;
};

export const renderSkipLinks = ({ cn, skips }) => {
    return skips.map(([id, label], i) =>
        cn(
            props => props.render`<li>${skipLink(props)}</li>`,
            { id, label },
            null,
            i,
        ),
    );
};
