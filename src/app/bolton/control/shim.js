// @ts-check
export const serialise = options => {
  if (!options) {
    throw new Error("[shim.serialise] - Missing options");
  }

  const { val, deps } = options;

  if (!val) {
    throw new Error("[shim.serialise] - Missing val");
  }

  if (!deps) {
    throw new Error("[shim.serialise] - Missing deps");
  }

  throw new Error("Not implemented.");
};

export const get = ({ localStore, setToCheck }) => async options => {
  if (!options) {
    throw new Error("[shim.get] - Missing options");
  }

  const { key } = options;

  if (!key) {
    throw new Error("[shim.get] - Missing key");
  }

  setToCheck.add(key);

  return await localStore.get({ key });
};

export const put = ({ localStore, ecds }) => async options => {
  if (!options) {
    throw new Error("[shim.put] - Missing options");
  }

  const { key, val, after } = options;

  if (!key) {
    throw new Error("[shim.put] - Missing key");
  }

  if (!val) {
    throw new Error("[shim.put] - Missing val");
  }

  if (!after) {
    throw new Error("[shim.put] - Missing after");
  }

  const serialised = serialise({ val, deps: after });

  await ecds.put({ key, val: serialised });
  await localStore.put({ key, val: serialised });
};

export default options => {
  if (!options) {
    throw new Error("[getShim] - No options given.");
  }

  const { localStore, setToCheck, ecds } = options;

  if (!localStore || !setToCheck || !ecds) {
    throw new Error("[getShim] - Invalid options given.");
  }

  return {
    get: get({ localStore, setToCheck }),
    put: put({ localStore, ecds })
  };
};
