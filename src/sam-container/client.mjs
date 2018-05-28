import {
    Connect,
    restoreSsrState,
    Dispatch,
    Propose,
    initialRender,
    replayIntermediateEvents,
} from "./control";

export const ClientApp = async ({
    app,
    state = restoreSsrState(),
    rootEl,
    Accept,
    Actions,
    nextAction,
}) => {
    console.assert(window["dispatcher"], "dispatcher");
    const { wire, bind } = await import("hyperhtml/esm");
    let defaultProps;
    let props;
    const render = ({ state, actions }) => {
        if (!defaultProps) {
            actions.dispatch = Dispatch({ actions });
            defaultProps = Object.assign(Object.create(null), {
                _actions: actions,
                _state: state,
            });
            defaultProps._connect = Connect({ wire, defaultProps });
            props = Object.assign(Object.create(null), defaultProps);
        }
        props._namespace = [];
        const { title, name } = state;
        const appString = defaultProps._connect()(app, { title, name });
        return bind(rootEl)`${appString}`;
    };
    const propose = Propose({
        accept: Accept({ state }),
        render: () => render({ state, actions }),
        nextAction: () => nextAction({ state, actions }),
    });
    const actions = Actions({ propose });
    // return;
    // await wait(2000);
    initialRender({ actions });
    // TODO: Do not allow actions until replay done?
    await replayIntermediateEvents({ actions });
    window["dispatcher"] = null;
    return actions;
};
