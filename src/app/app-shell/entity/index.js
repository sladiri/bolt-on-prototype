// @ts-check
export const defaultState = {
  count: 0,
  toggle: true,
  text: "Change Me"
};

const isDefined = x => x !== undefined;

export const getModel = ({ shim }) => ({ state }) => {
  return async function model({ toggle, text }) {
    if (isDefined(toggle)) {
      // discards input
      state.toggle = !state.toggle;
    }

    if (isDefined(text)) {
      state.text = text;
    }
  };
};
