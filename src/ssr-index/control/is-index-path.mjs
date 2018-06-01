const indexPathRegex = /^\/(index\.html)?(\?.*)?(index\.html\/.*)?$/;

export const isIndexPath = ({ path }) => {
    return !!indexPathRegex.exec(path);
};
