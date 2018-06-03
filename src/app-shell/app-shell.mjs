import { routeStatus } from "../components/route-status";
import { skipLink } from "../components/skip-link";
import { Home } from "../pages/home";
import { Foo } from "../pages/foo";
import { Bar } from "../pages/bar";

const pages = {
    "/": Home,
    "/foo": Foo,
    "/bar": Bar,
};

export const pageFromRoute = ({ route }) => {
    const page = pages[route] || pages["/"];
    return page;
};

let currentPage;

export const focusAfterPageChangeScript = ({ render, page }) => {
    let script;
    if (currentPage && currentPage !== page) {
        script = render`
            <script>
                document.getElementById("Main").focus();
            </script>
        `;
    }
    currentPage = page;
    return script;
};

export const appShell = props => {
    const {
        _wire,
        render,
        cn,
        _state: { route },
    } = props;
    const { skips = [], name, page } = pageFromRoute({ route });
    return render`
        ${cn(routeStatus, { name })}
        <ul class="skipLinks">${renderSkipLinks({ cn, skips })}</ul>
        <header></header>
        <!--
        a div with role would prevent a missing section heading,
        but nobody cares
        -->
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/app/foo?baz=1&baz=2">Foo</a></li>
                <li><a href="/app/bar">Bar</a></li>
            </ul>
        </nav>
        <main>${page(props)}</main>
        ${focusAfterPageChangeScript({ render: _wire(), page })}
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
