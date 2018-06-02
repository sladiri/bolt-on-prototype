export const section = ({ node, id, heading, topLevel = false }) => props => {
    const child = props.render`
        <h1 id=${id} tabindex="-1">${heading}</h1>
        ${node(props)}
        `;
    return topLevel
        ? [props.render`<section>${child}</section>`, id, heading]
        : [props.render`<div role="main">${child}</div>`, id, heading];
};
