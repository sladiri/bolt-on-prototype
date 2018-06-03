import { routeStatus } from "../components/route-status";
import { skipLink } from "../components/skip-link";
import { Home } from "../pages/home";
import { Foo } from "../pages/foo";
import { Bar } from "../pages/bar";

export const appShell = props => {
    const {
        render,
        cn,
        _state: { route },
        _wire,
    } = props;
    const { skips = [], title, description, page } = pageFromRoute({ route });
    return render`
        ${cn(routeStatus)}
        <ul class="skipLinks">${renderSkipLinks({ cn, skips })}</ul>
        <header></header>
        <!--
        Nav and Main sections have missing headngs.
        Using Divs with roles would "fix" it, but nobody cares anyway.
        -->
        <nav>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/app/foo?baz=1&baz=2">Foo</a></li>
                <li><a href="/app/bar">Bar</a></li>
            </ul>
        </nav>
        <main>${page(props)}</main>
        ${pageChangedScript({ render: _wire(), page, title, description })}
        <footer></footer>
        `;
};

export const pages = {
    "/": Home,
    foo: Foo,
    bar: Bar,
};

export const pageFromRoute = ({ route }) => {
    const page = pages[route] || Home;
    return page;
};

let currentPage;

export const pageChangedScript = ({ render, page, title, description }) => {
    if (!currentPage || currentPage === page) {
        currentPage = page;
        return;
    }
    currentPage = page;
    return render`
        <input id="page-title" value=${title} type="hidden" />
        <input id="page-description" value=${description} type="hidden" />
        <script>
            document.title = document.getElementById("page-title").value;
            document.querySelector('meta[name="description"]').content = document.getElementById("page-description").value;
            document.getElementById("Main").focus();
        </script>
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
