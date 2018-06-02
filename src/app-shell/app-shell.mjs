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
