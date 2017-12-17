// @ts-check
export const connectRemote = ({ PouchDB, host, name }) => {
  if (!host || !name) {
    return;
  }

  const dbOptions = { skip_setup: true };
  const db = new PouchDB(`${host}/${name}`, dbOptions);

  return db;
};

export const connectLocal = ({ PouchDB, name }) => {
  if (!name) {
    throw new Error("[pouch.connectLocal] - No local DB name given.");
  }

  const db = new PouchDB(name);

  const cache = new PouchDB(`${name}-in-memory`, { adapter: "memory" });

  return { db, cache };
};

export const syncDb = async ({ PouchDB, source, target }) => {
  if (!source || !target) {
    return;
  }

  const syncOpts = { live: true, retry: true };

  await new Promise((resolve, reject) => {
    PouchDB.sync(source, target, syncOpts)
      .on("paused", resolve)
      .on("error", reject);
  });
};

export const connectDb = async ({ remoteOpts, localOpts }) => {
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

  const connections = connectLocal({ ...localOpts, PouchDB });
  local = connections.db;
  cache = connections.cache;

  // TODO: In-memory sync broken?
  await syncDb({ PouchDB, source: remote, target: local });
  // await syncDb({ PouchDB, source: cache, target: local });

  return local;
};

export const get = ensureDb => async ({ key }) => {
  const db = await ensureDb();

  return await db.get(key);
};

const put = ensureDb => async ({ key, val }) => {
  const db = await ensureDb();

  let _rev;
  try {
    const doc = await db.get(key);

    console.log("[pouch.put] - update existing doc", doc);

    if (doc) {
      _rev = doc._rev;
    }
  } catch (error) {
    if (error.reason !== "missing") {
      throw error;
    }
  }

  const doc = await db.put({
    val,
    _id: key,
    _rev,
  });

  return doc;
};

export const getDb = options => {
  if (!options) {
    throw new Error("[getDb] - No options given");
  }

  const { remoteOpts, localOpts } = options;

  if (!localOpts) {
    throw new Error("[getDb] - Missing setToCheck");
  }

  let db;

  const ensureDb = async () => {
    if (!db) {
      db = await connectDb({ remoteOpts, localOpts });
    }

    return db;
  };

  return {
    get: get(ensureDb),
    put: put(ensureDb),
  };
};
