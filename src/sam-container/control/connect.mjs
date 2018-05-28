export const isObject = x => {
    return Object.prototype.toString.call(x) === "[object Object]";
};

export const Connect = ({
    wire,
    defaultProps,
    namespaceSet = new Set(),
    globalState = null,
}) => {
    const idComponentMap = new WeakMap();
    return (parentNamespace = [], id = Number.MIN_SAFE_INTEGER) => (
        component,
        ...args
    ) => {
        console.assert(id < Number.MAX_SAFE_INTEGER, "Connect ID exhuasted");
        let componentId;
        if (idComponentMap.has(component)) {
            componentId = idComponentMap.get(component);
        } else {
            idComponentMap.set(component, id++);
            componentId = id;
        }
        const childNamespace = [...parentNamespace, componentId];
        let childProps = Object.create(null);
        let wireReference;
        if (args.length === 1) {
            const arg = args[0];
            if (isObject(arg)) {
                childProps = Object.assign(childProps, arg);
            }
            if (typeof arg === "number" || typeof arg === "string") {
                childNamespace.push(`${arg}`); // mark namespaced
            }
        }
        if (args.length > 1) {
            const [props, reference, namespace] = args;
            if (isObject(props)) {
                childProps = Object.assign(childProps, props);
            }
            if (isObject(reference)) {
                wireReference = reference;
            }
            if (
                typeof namespace === "number" ||
                typeof namespace === "string"
            ) {
                childNamespace.push(`${namespace}`); // mark namespaced
            }
        }
        if (wireReference) {
            let refId;
            if (idComponentMap.has(wireReference)) {
                refId = idComponentMap.get(wireReference);
            } else {
                idComponentMap.set(wireReference, id++);
                refId = id;
            }
            childNamespace.push(refId);
        }

        const wireNamespace = `:${childNamespace.join(";")}`;
        if (namespaceSet.has(wireNamespace)) {
            console.warn("Connect: Duplicate namespace", wireNamespace);
        } else {
            namespaceSet.add(wireNamespace);
        }
        wireReference = wireReference || globalState;

        const { _connect } = defaultProps;
        const props = Object.assign(Object.create(defaultProps), childProps, {
            render: wire(wireReference, wireNamespace),
            connect: _connect(childNamespace, id),
        });
        return component(props);
    };
};
