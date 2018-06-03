import Gun from "gun";
import WebSocket from "ws";

export const GunJsServer = ({ httpServer }) => {
    const wss = new WebSocket.Server({ server: httpServer });
    const gunPeers = new Set(); // used as a list of connected clients.

    Gun.on("out", onGunOut({ peers: gunPeers }));

    wss.on(
        "connection",
        acceptConnection({
            gunPeers,
            gunLocal: Gun({ file: "./gundb-data.json" }),
        }),
    );
};

const acceptConnection = ({ gunPeers, gunLocal }) => connection => {
    // connection.upgradeReq.headers['sec-websocket-protocol'] === (if present) protocol requested by client
    // connection.upgradeReq.url  === url request
    console.log(
        "gun cn?",
        connection.upgradeReq,
        connection.upgradeReq.headers,
        connection.upgradeReq.url,
    );
    gunPeers.add(connection);

    connection.on("error", onWsError);
    connection.on("message", onWsMessage({ gunLocal }));
    connection.on("close", onWsClose({ peers: gunPeers, connection }));
};

const onGunOut = ({ peers }) => {
    return function(message) {
        this.to.next(message);

        message = JSON.stringify(message);
        peers.forEach(peer => {
            peer.send(message);
        });
    };
};

const onWsError = error => {
    console.error("Gun WebSocket error", error);
    throw error;
};

const onWsMessage = ({ gunLocal }) => json => {
    let message = JSON.parse(json);
    message = Array.isArray(message) ? message : [json];

    for (const itemJson of message) {
        const item = JSON.parse(itemJson);
        gunLocal.on("in", item);
    }
};

const onWsClose = ({ peers, connection }) => (reason, description) => {
    peers.delete(connection);
    if (reason === 1000 || reason === 1001) {
        return;
    }
    console.error("Gun peer closed due to error", reason, description);
};
