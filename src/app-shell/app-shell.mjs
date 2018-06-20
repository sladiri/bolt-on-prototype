import { UpdateHeadScript } from "../components/update-head-script";
import { routeStatus } from "../components/route-status";
import { skipLinks } from "../components/skip-links";
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
    } = props;
    const { skips = [], title, description, page } = pages[route] || Home;
    return render`
        ${cn(routeStatus, { title })}
        ${cn(skipLinks, { skips })}
        <header></header>
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
            </ul>
        </nav>
        <main>${page(props)}</main>
        ${cn(updateHeadScript, { page, title, description })}
        <footer></footer>
        `;
};
