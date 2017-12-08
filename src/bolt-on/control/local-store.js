// @ts-check
export const get = ({ setToCheck }) => ({ key }) => {
  if (!key) {
    throw new Error("[localStore.get] - Missing key");
  }

  throw new Error("[localStore.get] - Not implemented.");
};

export const put = ({ setToCheck }) => ({ key, val }) => {
  if (!key) {
    throw new Error("[localStore.put] - Missing key");
  }

  if (!val) {
    throw new Error("[localStore.put] - Missing val");
  }

  throw new Error("Not implemented.");
};

export default options => {
  if (!options) {
    throw new Error("[getLocalStore] - No options given.");
  }

  const { setToCheck } = options;

  if (!setToCheck) {
    throw new Error("[getLocalStore] - Invalid options given.");
  }

  return {
    get: get({ setToCheck }),
    put: put({ setToCheck }),
  };
};
