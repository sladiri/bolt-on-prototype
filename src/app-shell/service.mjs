import assert from "assert";
import { StorePouchDb } from "../store/store-pouchdb";
import { Shim } from "../bolt-on-shim/bolt-on-shim";

export const Service = ({ PouchDB, dbPath, dbName, shimId, tick }) => {
    const remoteDb = new PouchDB(`${dbPath}/${dbName}`);
    assert(remoteDb, "Service ensureDb remoteDb");
    let dbEnsured = false;
    const ensureDb = async () => {
        if (dbEnsured) {
            return remoteDb;
        }
        const { db_name, adapter } = (await remoteDb.info()) || {};
        assert(db_name === dbName, "Service db name");
        console.log(
            `Service: PouchDB connected to [${db_name}] via [${adapter}]`,
        );
        dbEnsured = true;
        return remoteDb;
    };
    const localDbName = `${dbName}_local-store`;
    const localDb = new PouchDB(localDbName);
    let shim;
    const ensureShim = async () => {
        if (shim) {
            return shim;
        }
        const { db_name, adapter } = (await localDb.info()) || {};
        assert(db_name === localDbName, "Service localDb name");
        console.log(
            `Service: PouchDB connected to [${db_name}] via [${adapter}]`,
        );
        const remoteDb = await ensureDb();
        const localStore = StorePouchDb({ db: localDb });
        const ecdsStore = StorePouchDb({ db: remoteDb });
        shim = Shim({ localStore, ecdsStore, shimId, tick });
        return shim;
    };
    return { ensureDb, ensureShim };
};
