// @ts-check
export const defaultState = {
  count: 0,
  toggle: true,
  text: "Change Me",
  userName: ""
};

const isDefined = x => x !== undefined;

export const getModel = ({ shim }) => {
  const state = JSON.parse(JSON.stringify(defaultState));

  return async function model({ toggle, text, userName }) {
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

    return JSON.parse(JSON.stringify(state));
  };
};
