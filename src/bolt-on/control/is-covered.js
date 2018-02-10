import { deSerialise } from "./serialiser";
import { happenedBefore } from "./happened-before";

export const checkRemoteDependency = async options => {
  debugger;
  const { ecds, depKey, depVectorClock, tentativeWrites } = options;

  let remoteDepSerialised;

  try {
    remoteDepSerialised = await ecds.get({ key: depKey });
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
      clockRef: depVectorClock,
      clock: item._meta.vectorClock,
    })
  ) {
    debugger;
    return false;
  }

  debugger;
  tentativeWrites[depKey] = item;

  if (await isCovered({ ...options, write: item })) {
    debugger;
    return true;
  }

  debugger;
  return false;
};

const checkLocalDependency = async options => {
  debugger;
  const { localStore, tentativeWrites, depKey, depVectorClock } = options;

  const localDepSerialised = localStore.get({ key: depKey });

  if (localDepSerialised) {
    const { _meta: localMeta } = deSerialise(localDepSerialised);

    if (
      !happenedBefore({
        clockRef: depVectorClock,
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
        key === depKey &&
        !happenedBefore({
          clockRef: depVectorClock,
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
  const depKeys = Object.entries(happenedAfter);

  for (const [depKey, depVectorClock] of depKeys) {
    if (await checkLocalDependency({ ...options, depKey, depVectorClock })) {
      debugger;
      continue;
    }
    debugger;
    return false;
  }
  debugger;
  return true;
};
