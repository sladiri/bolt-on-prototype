import { getLocalStore } from "./control/local-store";
import { serialise, deSerialise } from "./control/serialiser";
import { getResolver } from "./control/resolver";

const getTemplate = ({ version, localStore, setToCheck, hook }) => {
  return async options => {
    if (!options) {
      throw new Error("[shim.get] - Invalid options");
    }

    const { key } = options;

    if (!key) {
      throw new Error("[shim.get] - Invalid key");
    }

    await hook({ version, localStore, setToCheck, key });

    const serialised = localStore.get({ key });

    if (!serialised) {
      throw new Error("[shim.get] - Invalid serialised");
    }

    const deserialised = deSerialise(serialised);

    if (!deserialised) {
      throw new Error("[shim.get] - Invalid deserialised");
    }

    const { _meta: meta } = deserialised;

    if (!meta) {
      throw new Error("[shim.get] - Invalid deserialised meta data");
    }

    if (meta.version !== version) {
      throw new Error("[shim.get] - Invalid deserialised version");
    }

    if (!meta.vectorClock || !Object.keys(meta.vectorClock).length) {
      throw new Error("[shim.get] - Invalid deserialised vector clock");
    }

    if (!meta.happenedAfter) {
      throw new Error("[shim.get] - Invalid deserialised happened-after");
    }

    return deserialised;
  };
};

export const getOptimistic = options => {
  return getTemplate({
    ...options,
    hook: ({ setToCheck, key }) => {
      setToCheck.add(key); // TODO: Could use Pouch's changes-stream.
    },
  });
};

const createHappenedAfter = async ({ get, after }) => {
  const result = {};

  for (const x of after) {
    if (!x) {
      throw new Error("[shim.put] - Invalid happened-after item");
    } else if (!x.key && !x.vectorClock) {
      try {
        const dependency = await get({ key: x });
        result[x] = dependency._meta.vectorClock;
      } catch (error) {
        throw new Error(
          `[shim.put] - Deserialise happened-after : ${error.message}`,
        );
      }
    } else {
      throw new Error("[shim.put] - Invalid happened-after item properties");
    }
  }

  return result;
};

const updateMeta = async ({ get, version, meta, vectorClock, after }) => {
  const happenedAfter = await createHappenedAfter({ get, after });

  let updatedMeta;

  if (!meta) {
    updatedMeta = {
      version,
      vectorClock,
      happenedAfter,
    };
  } else if (
    meta.version &&
    meta.vectorClock &&
    Object.keys(meta.vectorClock).length &&
    meta.happenedAfter
  ) {
    updatedMeta = {
      ...meta,
      vectorClock: { ...meta.vectorClock, ...vectorClock },
      happenedAfter: { ...meta.happenedAfter, ...happenedAfter },
    };
  } else {
    throw new Error(
      `[shim.put] - Invalid meta properties [${JSON.stringify(meta)}]`,
    );
  }

  return updatedMeta;
};

export const put = ({ version, vectorClock, localStore, ecds }) => {
  const get = getTemplate({
    version,
    localStore,
    setToCheck: null,
    hook: () => {},
  });

  return async options => {
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
      throw new Error("[shim.put] - Invalid depencencies");
    }

    try {
      vectorClock.tick += 1;

      const currentVectorClock = { [vectorClock.name]: vectorClock.tick };

      const meta = await updateMeta({
        get,
        version,
        meta: val._meta,
        vectorClock: currentVectorClock,
        after,
      });

      const serialised = serialise({ val, _meta: meta });

      ecds.put({ key, val: serialised });

      localStore.put({ key, val: serialised });
    } catch (error) {
      throw error;
    }
  };
};

export const getShim = async options => {
  if (!options) {
    throw new Error("[getShim] - Invalid options");
  }

  const { ecds } = options;

  if (!ecds) {
    throw new Error("[getShim] - Invalid ecds");
  }

  const version = "1";
  const vectorClock = { name: "p1", tick: 1 };

  const localStore = getLocalStore();

  const setToCheck = await getResolver({
    localStore,
    ecds,
  });

  return {
    get: getOptimistic({ version, localStore, setToCheck }),
    put: put({ version, vectorClock, localStore, ecds }),
  };
};
