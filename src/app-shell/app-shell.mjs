import { skipLink } from "../components/skip-link";
import { home } from "../pages/home";

const pages = {
    default: home,
};

export const pageFromPath = path => pages.default;

export const appShell = props => {
    if (typeof window === "object") {
        import("./app-shell.pcss");
    }
    const {
        render,
        connect,
        _state: { title, name },
    } = props;
    const { landMarks = [], page } = pageFromPath();
    const skipLinks = renderSkipLinks({ connect, landMarks });
    const content = connect(
        page,
        { title, name },
    );
    return render`
        ${skipLinks}
        <header></header>
        <nav></nav>
        <main>${content}</main>
        <footer></footer>
        `;
};

export const renderSkipLinks = ({ connect, landMarks }) => {
    return [["main", "Main Content"], ...landMarks].map(([id, label], i) =>
        connect(
            skipLink,
            { id, label },
            null,
            i,
        ),
    );
};

if (typeof window === "object") {
    window["onpushstate"] = function(event) {
        console.log("history", event.state, window["location"].href);
        if (event.state) {
            console.log("history changed because of pushState/replaceState");
        } else {
            console.log("history changed because of a page load");
        }
    };
}
