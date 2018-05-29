import viper from "viperhtml";
import { Connect } from "./control/connect";
import { ssrDefaultProps, ssrDispatch } from "./control/server";

const wire = viper.wire;

export const SsrApp = ({ state, Accept }) => {
    const defaultProps = ssrDefaultProps({
        state,
        dispatch: ssrDispatch,
        wire,
    });
    const accept = Accept({ state });
    defaultProps._connect = Connect({ wire, defaultProps });
    const AppString = defaultProps._connect();
    return { accept, AppString };
};
