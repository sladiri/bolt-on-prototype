// @ts-check
import { getLocalStore } from "./control/local-store";
import { getResolver } from "./control/resolver";

export const getSerialise = ({ version }) => ({ key, val, after }) => {
  if (!val) {
    throw new Error("[shim.put] - Missing val");
  }

  if (!Array.isArray(after)) {
    throw new Error("[shim.put] - Invalid after");
  }

  return {
    data: JSON.stringify(val),
    deps: after,
    meta: {
      version,
      key,
    },
  };
};

export const getDeSerialise = ({ version }) => ({
  key,
  item: { meta, data, deps, ...payload },
}) => {
  if (!meta) {
    throw new Error("[shim.deserialise] - Invalid meta-data");
  }

  if (meta.version !== version) {
    throw new Error("[shim.deserialise] - Invalid version");
  }

  if (meta.key !== key) {
    throw new Error("[shim.deserialise] - Invalid key");
  }

  if (!Array.isArray(deps)) {
    throw new Error("[shim.deserialise] - Invalid deps");
  }

  return {
    ...payload,
    val: JSON.parse(data),
    after: deps,
  };
};

export const get = ({
  deSerialise,
  setToCheck,
  localStore,
}) => async options => {
  if (!options) {
    throw new Error("[shim.get] - Missing options");
  }

  const { key } = options;

  if (!key) {
    throw new Error("[shim.get] - Missing key");
  }

  setToCheck.add(key);

  const item = localStore.get({ key });

  if (!item) {
    throw new Error("[shim.get] - Invalid item");
  }

  const deserialised = deSerialise({ item, key });

  console.log("deserialised", deserialised);

  throw new Error("[shim.get] - Not implemented");
};

export const put = ({ serialise, localStore, ecds }) => async options => {
  if (!options) {
    throw new Error("[shim.put] - Missing options");
  }

  const { key } = options;

  if (!key) {
    throw new Error("[shim.put] - Missing key");
  }

  const serialised = serialise({
    key,
    ...options,
  });

  const doc = await ecds.put({
    key,
    val: serialised,
  });

  localStore.put({
    key,
    ...doc,
    ...serialised,
  });
};

export const getShim = async options => {
  const version = "1";

  if (!options) {
    throw new Error("[getShim] - No options given");
  }

  const { setToCheck, ecds } = options;

  if (!setToCheck) {
    throw new Error("[getShim] - Missing setToCheck");
  }

  if (!ecds) {
    throw new Error("[getShim] - Missing ecds");
  }

  const localStore = getLocalStore();

  const resolver = await getResolver({ setToCheck, localStore, ecds });

  await resolver.start();

  const serialise = getSerialise({ version });
  const deSerialise = getDeSerialise({ version });

  return {
    get: get({ deSerialise, localStore, setToCheck }),
    put: put({ serialise, localStore, ecds }),
  };
};
