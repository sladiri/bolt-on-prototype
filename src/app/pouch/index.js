// @ts-check
import PouchDB from "pouchdb";
import pouchMemory from "pouchdb-adapter-memory";

PouchDB.plugin(pouchMemory);
// PouchDB.debug.enable("*");

const logPrefix = "pouch -";

const connectRemote = ({ host, name }) => {
  if (!host || !name) {
    return;
  }

  const dbOptions = { skip_setup: true };
  let db;

  try {
    db = new PouchDB(`${host}/${name}`, dbOptions);
  } catch (e) {
    console.warn(logPrefix, "Could not connect to remote DB.", host, name);
  }

  return db;
};

const connectLocal = ({ name }) => {
  if (!name) {
    throw new Error("[pouch.connectLocal] - No local DB name given.");
  }

  const db = new PouchDB(name);

  const cacheOptions = { adapter: "memory" };
  let cache;

  try {
    cache = new PouchDB(`${name}-in-memory`, cacheOptions);
  } catch (e) {
    console.warn(logPrefix, "Could not create cache DB.", name);
  }

  return [db, cache];
};

const syncDb = async ({ source, target }) => {
  if (!source || !target) {
    return;
  }

  const syncOpts = { live: true, retry: true };

  try {
    await new Promise((resolve, reject) => {
      PouchDB.sync(source, target, syncOpts)
        .on("paused", resolve)
        .on("error", reject);
    });
  } catch (error) {
    console.warn(logPrefix, "Could not sync.", error);
  }
};

const getDb = async ({ remoteOpts, localOpts }) => {
  let remote;
  let local;
  let cache;

  if (remoteOpts) {
    remote = connectRemote(remoteOpts);
  }

  if (localOpts) {
    [local, cache] = connectLocal(localOpts);
  }

  await syncDb({ source: remote, target: local });
  await syncDb({ source: local, target: cache });

  return cache;
};

const getProxy = ({ db }) => {
  if (!db) {
    return;
  }

  return {
    get: options => {
      if (!options) {
        throw new Error("[pouch.getProxy] - Missing options");
      }

      const { key } = options;

      if (!key) {
        throw new Error("[pouch.getProxy] - Missing key");
      }

      throw new Error("Not implemented.");
    },
    put: options => {
      if (!options) {
        throw new Error("[pouch.getProxy] - Missing options");
      }

      const { key, val } = options;

      if (!key) {
        throw new Error("[pouch.getProxy] - Missing key");
      }

      if (!val) {
        throw new Error("[pouch.getProxy] - Missing val");
      }

      throw new Error("Not implemented.");
    }
  };
};

export default async options => {
  if (!options) {
    return;
  }

  if (!options) {
    throw new Error("[getPouch] - No options given.");
  }

  const { localOpts } = options;

  if (!localOpts) {
    throw new Error("[getPouch] - Invalid options given.");
  }

  const db = await getDb(options);

  return getProxy({ db });
};
