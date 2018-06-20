export const skipLinks = props => {
    const { render, cn, skips } = props;
    return render`
        <ul class="skipLinks">
            ${skips.map(([id, label], i) =>
                cn(skipLink, { id, label }, null, i),
            )}
        </ul>
        `;
};

export const skipLink = props => {
    const { render, id, label = props.id } = props;
    return id
        ? render`
            <li>
                <a
                    href=${`#${id}`}
                    onclick=${focusSkipLinkTarget({ id })}
                    class="skipLink"
                >
                    Skip to ${label}
                </a>
            </li>`
        : render`<li></li>`;
};

export const focusSkipLinkTarget = ({ id }) => () => {
    const target = document.getElementById(id);
    console.assert(!!target, "Skip Link target");
    target.focus();
};
