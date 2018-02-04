import { isCovered } from "./is-covered";
import { serialise, deSerialise } from "./serialiser";

// const vectorsAreEqual = (clockA, clockB) => {
//   if (Object.keys(clockA).length !== Object.keys(clockB).length) {
//     return false;
//   }

//   for (const [name, tick] of Object.entries(clockA)) {
//     if (clockB[name] !== tick) {
//       return false;
//     }
//   }

//   return true;
// };

export const getResolve = ({ keysToCheck, localStore, ecds }) => async () => {
  debugger;
  for (const key of keysToCheck.values()) {
    const tentativeWrites = {};

    try {
      const { val } = await ecds.get({ key });
      const remoteItem = deSerialise(val);
      tentativeWrites[key] = remoteItem;

      if (
        await isCovered({
          localStore,
          ecds,
          remoteMeta: remoteItem._meta,
          tentativeWrites: { [key]: remoteItem },
        })
      ) {
        for (const [key, item] of Object.entries(tentativeWrites)) {
          localStore.put({ key, val: serialise(item) });
          debugger;
          keysToCheck.delete(key);
        }
      }
    } catch (error) {
      if (error.name !== "not_found") {
        throw error;
      }
    }
  }
  // window.setTimeout(resolve, 1000);
};

export const getResolver = async ({ localStore, ecds }) => {
  const keysToCheck = new Set();

  const resolve = getResolve({ keysToCheck, localStore, ecds });

  // resolve();

  return {
    add(key) {
      debugger;
      return keysToCheck.add(key);
    },
  };
};
