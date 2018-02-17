import { deSerialise } from "./serialiser";
import { happenedBefore } from "./happened-before";

export const checkRemoteDependency = async options => {
  debugger;
  const { ecds, tentativeWrites, dependency } = options;

  let remoteDepSerialised;

  try {
    remoteDepSerialised = await ecds.get({ key: dependency.key });
    debugger;
  } catch (error) {
    if (error.name !== "not_found") {
      debugger;
      throw error;
    }
    remoteDepSerialised = null;
    debugger;
  }

  if (!remoteDepSerialised) {
    debugger;
    return false;
  }

  const item = deSerialise(remoteDepSerialised.val);
  debugger;

  if (
    happenedBefore({
      clockRef: dependency.vectorClock,
      clock: item._meta.vectorClock,
    })
  ) {
    debugger;
    return false;
  }

  debugger;
  tentativeWrites[dependency.key] = item;

  if (await isCovered({ ...options, write: item })) {
    debugger;
    return true;
  }

  debugger;
  return false;
};

const checkLocalDependency = async options => {
  debugger;
  const { localStore, tentativeWrites, dependency } = options;

  const localDepSerialised = await localStore.get({ key: dependency.key });

  if (localDepSerialised) {
    const { _meta: localMeta } = deSerialise(localDepSerialised);

    if (
      !happenedBefore({
        clockRef: dependency.vectorClock,
        clock: localMeta.vectorClock,
      })
    ) {
      debugger;
      return true;
    }
  }

  if (
    Object.entries(tentativeWrites).find(
      ([key, item]) =>
        key === dependency.key &&
        !happenedBefore({
          clockRef: dependency.vectorClock,
          clock: item._meta.vectorClock,
        }),
    )
  ) {
    debugger;
    return true;
  }

  debugger;
  return await checkRemoteDependency(options);
};

export const isCovered = async options => {
  debugger;

  const { write: { _meta: { happenedAfter } } } = options;
  const dependencies = Object.entries(happenedAfter);

  for (const [depKey, depVectorClock] of dependencies) {
    if (
      await checkLocalDependency({
        ...options,
        dependency: { key: depKey, vectorClock: depVectorClock },
      })
    ) {
      debugger;
      continue;
    }
    debugger;
    return false;
  }
  debugger;
  return true;
};
