import { UpdateHeadScript } from "hypersam/src/update-head-script";
import { routeStatus } from "../components/route-status";
import { skipLink } from "../components/skip-link";
import { Home } from "../pages/home";
import { SamState } from "../pages/sam-state";
import { D3Chart } from "../pages/d3-chart";

export const pages = {
    home: Home,
    "sam-state": SamState,
    "d3-chart": D3Chart,
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
        <!--
        Nav and Main sections have missing headngs.
        Using Divs with roles would "fix" it, but nobody cares anyway.
        -->
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/sam-state">SAM State</a></li>
                <li><a href="/d3-chart">D3 Chart</a></li>
            </ul>
        </nav>
        <main>${page(props)}</main>
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
