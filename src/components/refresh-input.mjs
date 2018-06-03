export const SetName = ({ setName }) => {
    return async function(event) {
        const rand = event.target.value;
        await setName({ value: rand });
    };
};

export const _refreshInput = props => {
    const { render, setName } = props;
    return render`
        <label>Enter Name<input onkeyup=${SetName({ setName })} /></label>
        `;
};

export const refreshInput = props => {
    const state = {
        setName: props._actions.setName,
    };
    return props.cn(_refreshInput, state);
};
