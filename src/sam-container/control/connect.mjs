export const isObject = x => {
    return Object.prototype.toString.call(x) === "[object Object]";
};

export const Connect = ({
    wire,
    defaultProps,
    idComponentMap = new WeakMap(),
    wiresMap = new Map(),
    namespaceSet = new Set(),
    globalState = null,
}) => {
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
                childNamespace.push(`${arg}`);
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
                console.assert(
                    !`${namespace}`.startsWith("#"),
                    "connect wire id",
                ); // conflicts with namespaced-mark below
                childNamespace.push(`${namespace}`);
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
            childNamespace.push(`#${refId}`); // mark namespaced
            wiresMap.set(`#${refId}`, wireReference);
        } else {
            const refs = childNamespace.filter(
                x => typeof x === "string" && x.startsWith("#"),
            );
            if (refs.length) {
                wireReference = wiresMap.get(refs[refs.length - 1]); // Use leaf to free maximum memory
            }
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
