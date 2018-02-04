import { deSerialise } from "./serialiser";

export const happenedBefore = ({ clockRef, clockPrev }) => {
  let lessOrEqual = false;
  let strictlyEqual = false;

  const processKeys = [
    ...Object.keys(clockRef),
    ...Object.keys(clockPrev),
  ].reduce((acc, val) => (acc.includes(val) ? acc : [...acc, val]), []);

  for (const name of processKeys) {
    const refTick = clockRef[name] || 0;
    const prevTick = clockPrev[name] || 0;

    if (prevTick > refTick) {
      return false;
    } else {
      lessOrEqual = true;
    }

    if (prevTick < refTick) {
      strictlyEqual = true;
    }
  }

  return lessOrEqual && strictlyEqual;
};

export const checkRemoteDependency = async options => {
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
    return;
  }

  const item = deSerialise(remoteDepSerialised.val);
  debugger;

  if (
    happenedBefore({
      clockRef: depVectorClock,
      clockPrev: item._meta.vectorClock,
    })
  ) {
    debugger;
    return;
  }

  tentativeWrites[depKey] = item;

  if (await isCovered(options)) {
    debugger;
    return true;
  }
  debugger;
};

const checkLocalDependency = async options => {
  const { localStore, tentativeWrites, depKey, depVectorClock } = options;

  const localDepSerialised = localStore.get({ key: depKey });

  if (!localDepSerialised) {
    debugger;
    return await checkRemoteDependency(options);
  }

  const { _meta: localMeta } = deSerialise(localDepSerialised);

  if (
    !happenedBefore({
      clockRef: depVectorClock,
      clockPrev: localMeta.vectorClock,
    })
  ) {
    debugger;
    return true;
  }

  if (
    Object.entries(tentativeWrites).find(
      ([key, item]) =>
        key === depKey ||
        !happenedBefore({
          clockRef: depVectorClock,
          clockPrev: item._meta.vectorClock,
        }),
    )
  ) {
    debugger;
    return true;
  }
  debugger;
};

export const isCovered = async options => {
  debugger;
  const depKeys = Object.entries(options.remoteMeta.happenedAfter);

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
