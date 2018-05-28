export const Connect = ({ wire, defaultProps }) => {
    const idComponentMap = new WeakMap();
    return (namespace = [], id = Number.MIN_SAFE_INTEGER) => (
        component,
        ...args
    ) => {
        console.assert(id < Number.MAX_SAFE_INTEGER, "Connect ID exhuasted");
        let componentId;
        if (!component.name) {
            componentId = id++;
        } else if (idComponentMap.has(component)) {
            componentId = idComponentMap.get(component);
        } else {
            idComponentMap.set(component, id++);
            componentId = id;
        }
        const childNamespace = [...namespace, componentId];
        let childProps = Object.create(null);
        let wireNamespace;
        let wireReference;
        if (args.length === 1) {
            if (Object.prototype.toString.call(args[0]) === "[object Object]") {
                childProps = Object.assign(childProps, args[0]);
            }
            if (typeof args[0] === "number" || typeof args[0] === "string") {
                wireNamespace = `:${args[0]}`;
                childNamespace.push(`${args[0]}`); // mark namespaced
            }
        }
        if (args.length > 1) {
            childProps = Object.assign(childProps, args[0]);
            wireReference = args[1];
        }
        if (wireReference) {
            const parentNs = childNamespace
                .filter(x => typeof x === "string")
                .join("--");
            wireNamespace = wireNamespace || ":";
            wireNamespace = `${wireNamespace}|${parentNs}`;
        }
        const { _connect } = defaultProps;
        const props = Object.assign(Object.create(defaultProps), childProps, {
            render: wire(wireReference, wireNamespace),
            connect: _connect(childNamespace, id),
        });
        return component(props);
    };
};
