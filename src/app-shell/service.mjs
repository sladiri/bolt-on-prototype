export const Service = ({ PouchDB, dbPath, dbName }) => {
    const db = new PouchDB(`${dbPath}/${dbName}`);
    console.assert(db, "Service ensureDb db");
    let ensured = false;
    const ensureDb = async () => {
        if (ensured) {
            return db;
        }
        const info = await db.info();
        console.assert(info && info.db_name === dbName, "Service CouchDB name");
        ensured = true;
        return db;
    };
    return { ensureDb };
};
