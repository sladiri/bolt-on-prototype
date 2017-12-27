// @ts-check
export const defaultState = {
  count: 0,
  toggle: true,
  text: "Change Me",
  userName: "",
  wiki: [],
};

const isDefined = x => x !== undefined;

export const getModel = ({ shim }) => {
  const state = JSON.parse(JSON.stringify(defaultState));

  return async function model(input) {
    try {
      let doc = { key: "sladi", val: Date.now(), after: [] };
      console.log("entity create doc", doc);
      await shim.put(doc);
      doc = await shim.get({ key: "sladi" });
      console.log("entity got doc", doc);
    } catch (error) {
      console.error("entity test doc", error);
    }

    const { toggle, text, userName, wiki } = input;

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

    if (isDefined(wiki)) {
      state.wiki = wiki;
    }

    return JSON.parse(JSON.stringify(state));
  };
};