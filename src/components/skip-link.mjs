export const skipLink = props => {
    const { render, id, label = props.id } = props;
    return id
        ? render`<a href=${`#${id}`} class="skipLink">Skip to ${label}</a>`
        : render`<p>NO ID FOR SKIP LINK</p>
        `;
};
