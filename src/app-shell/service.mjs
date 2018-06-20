export const Service = ({ PouchDB, dbPath }) => {
    const db = new PouchDB(dbPath);
    return { db };
};
