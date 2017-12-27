// @ts-check
import { getLocalStore } from "./control/local-store";
import { getResolver } from "./control/resolver";

export const getDeSerialise = ({ version }) => serialised => {
  if (!serialised) {
    throw new Error("[shim.deserialise] - Invalid serialised");
  }

  const deSerlialised = JSON.parse(serialised);

  if (!deSerlialised) {
    throw new Error("[shim.deserialise] - Invalid deSerlialised");
  }

  const { version: _version, payload } = deSerlialised;

  if (_version !== version) {
    throw new Error("[shim.deserialise] - Invalid version");
  }

  if (!Array.isArray(payload.after)) {
    throw new Error("[shim.deserialise] - Invalid after");
  }

  return payload;
};

export const getSerialise = ({ version }) => payload => {
  const serialised = JSON.stringify({ payload, version });

  if (!serialised) {
    throw new Error("[shim.serialise] - Invalid serialised");
  }

  return serialised;
};

export const get = ({
  deSerialise,
  setToCheck,
  localStore,
}) => async options => {
  if (!options) {
    throw new Error("[shim.get] - Invalid options");
  }

  const { key } = options;

  if (!key) {
    throw new Error("[shim.get] - Invalid key");
  }

  setToCheck.add(key);

  const serialised = localStore.get({ key });

  const payload = deSerialise(serialised);

  console.log("ddd", payload);

  throw new Error("[shim.get] - Not implemented");
};

export const put = ({ serialise, localStore, ecds }) => async options => {
  if (!options) {
    throw new Error("[shim.put] - Invalid options");
  }

  const { key, val, after } = options;

  if (!key) {
    throw new Error("[shim.put] - Invalid key");
  }

  if (!val) {
    throw new Error("[shim.put] - Invalid val");
  }

  if (!Array.isArray(after)) {
    throw new Error("[shim.serialise] - Invalid after");
  }

  const serialised = serialise({ val, after });

  await ecds.put({
    key,
    val: serialised,
  });

  localStore.put({
    key,
    val: serialised,
  });
};

export const getShim = async options => {
  const version = "1";

  if (!options) {
    throw new Error("[getShim] - Invalid options");
  }

  const { setToCheck, ecds } = options;

  if (!setToCheck) {
    throw new Error("[getShim] - Invalid setToCheck");
  }

  if (!ecds) {
    throw new Error("[getShim] - Invalid ecds");
  }

  const localStore = getLocalStore();

  await getResolver({ setToCheck, localStore, ecds });

  const serialise = getSerialise({ version });
  const deSerialise = getDeSerialise({ version });

  return {
    get: get({ deSerialise, localStore, setToCheck }),
    put: put({ serialise, localStore, ecds }),
  };
};
