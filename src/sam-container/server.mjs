import viper from "viperhtml";
import { Connect, ssrDefaultProps, ssrDispatch } from "./control";

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
