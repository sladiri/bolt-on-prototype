// @ts-check
const logPrefix = "pouch -";

const connectRemote = ({ PouchDB, host, name }) => {
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

const connectLocal = ({ PouchDB, name }) => {
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

const syncDb = async ({ PouchDB, source, target }) => {
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

const connectDb = async ({ remoteOpts, localOpts }) => {
  const [{ default: PouchDB }, { default: pouchMemory }] = await Promise.all([
    import("pouchdb"),
    import("pouchdb-adapter-memory"),
  ]);

  PouchDB.plugin(pouchMemory);
  // PouchDB.debug.enable("*");

  let remote;
  let local;
  let cache;

  if (remoteOpts) {
    remote = connectRemote({ ...remoteOpts, PouchDB });
  }

  if (localOpts) {
    [local, cache] = connectLocal({ ...localOpts, PouchDB });
  }

  await syncDb({ PouchDB, source: remote, target: local });
  await syncDb({ PouchDB, source: local, target: cache });

  return cache;
};

export const getDb = dbOptions => {
  if (!dbOptions) {
    throw new Error("[getPouch] - No options given.");
  }

  let db;

  const ensureDb = async () => {
    if (!db) {
      db = await connectDb(dbOptions);
    }
  };

  return {
    async get(options) {
      if (!options) {
        throw new Error("[pouch.getProxy] - Missing options");
      }

      const { key } = options;

      if (!key) {
        throw new Error("[pouch.getProxy] - Missing key");
      }

      await ensureDb();

      throw new Error("Not implemented.");
    },
    async put(options) {
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

      await ensureDb();

      throw new Error("Not implemented.");
    },
  };
};
