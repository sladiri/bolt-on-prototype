export const SetName = ({ setName }) => {
    return async function(event) {
        const name = event.target.value;
        await setName({ value: name });
    };
};

export const _refreshInput = props => {
    const { render, setName } = props;
    return render`
        <section>
            <label>Enter Name<input onkeyup=${SetName({ setName })} /></label>
        </section>
        `;
};

export const refreshInput = props => {
    const state = {
        setName: props._actions.setName,
    };
    return props.connect(
        _refreshInput,
        state,
    );
};
