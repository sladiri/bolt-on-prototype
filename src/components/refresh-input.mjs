export const SetName = ({ setName }) => {
    return async function(event) {
        const name = event.target.value;
        await setName({ value: name });
    };
};

export const _refreshInput = props => {
    const { render, name, setName } = props;
    return render`
        <section>
            <h1>Set Name, ${name}</h1>
            <label>Enter Name<input onkeyup=${SetName({ setName })} /></label>
        </section>
    `;
};

export const refreshInput = props => {
    const state = {
        name: props._state.name,
        setName: props._actions.setName,
    };
    return props.connect(_refreshInput, state);
};
