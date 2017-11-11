// @ts-check
import getDb from "./pouch";
import { getLocalStore, getShim } from "./bolton";

const dbOpts = {
  localOpts: { name: "bolt-on-test-db" },
  remoteOpts: { host: "", name: "" }
};

(async () => {
  try {
    const db = await getDb(dbOpts);

    const setToCheck = new Set();

    const localStore = getLocalStore({ setToCheck });

    const shim = getShim({ localStore, setToCheck, ecds: db });

    await shim.get({ key: "foo" });
  } catch (error) {
    console.error("app -", error);
  }
})();
