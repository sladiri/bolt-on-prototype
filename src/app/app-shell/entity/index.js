// @ts-check
export const defaultState = {
  count: 0,
  toggle: true,
  text: "Change Me",
  userName: ""
};

const isDefined = x => x !== undefined;

export const getModel = ({ shim }) => ({ state }) => {
  return async function model(data) {
    const { toggle, text, userName } = data;

    if (isDefined(toggle)) {
      // discards input
      state.toggle = !state.toggle;
    }

    if (isDefined(text)) {
      state.text = text;
    }

    if (isDefined(userName)) {
      state.userName = userName;
    }
  };
};
