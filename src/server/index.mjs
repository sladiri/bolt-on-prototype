import fs from "fs";
import https from "https";
import http2 from "http2";
// @ts-ignore
import { app } from "./control";

const key = fs.readFileSync("./privkey.pem", "utf8");
const cert = fs.readFileSync("./cert.pem", "utf8");

const host = "localhost";
const port = 3001;
const server = http2.createSecureServer({ key, cert }, app().callback());

const serverCallback = error => {
  if (error) {
    console.error("Server listen error: ", error, error && error.stack);
  } else {
    console.log(`Server listen OK: https://${host}:${port}`);
  }
};
server.listen({ host, port }, serverCallback);

import WebSocket from "ws";
import Gun from "gun";

const gunPeers = []; // used as a list of connected clients.

Gun.on("out", function(msg) {
  this.to.next(msg);
  msg = JSON.stringify(msg);
  gunPeers.forEach(function(peer) {
    peer.send(msg);
  });
});

var gun = Gun({
  file: "./gundb-data.json",
});

function acceptConnection(connection) {
  // connection.upgradeReq.headers['sec-websocket-protocol'] === (if present) protocol requested by client
  // connection.upgradeReq.url  === url request
  console.log(
    "connect?",
    connection.upgradeReq.headers,
    connection.upgradeReq.url,
  );
  gunPeers.push(connection);

  connection.on("error", function(error) {
    console.log("WebSocket Error:", error);
  });

  connection.on("message", function(msg) {
    msg = JSON.parse(msg);
    if ("forEach" in msg) msg.forEach(m => gun.on("in", JSON.parse(m)));
    else gun.on("in", msg);
  });

  connection.on("close", function(reason, desc) {
    // gunpeers gone.
    var i = gunPeers.findIndex(function(p) {
      return p === connection;
    });
    if (i >= 0) gunPeers.splice(i, 1);
  });
}

const gunServer = https.createServer({ key, cert });
const wss = new WebSocket.Server({ server: gunServer });

wss.on("connection", acceptConnection);

// wss.on("connection", function connection(ws) {
//   ws.on("message", function incoming(message) {
//     console.log("received: %s", message);
//   });

//   ws.send("something");
// });

gunServer.listen(3002, error => {
  if (error) {
    console.error("gun Server listen error: ", error, error && error.stack);
  } else {
    console.log(`gun Server listen OK: https://${host}:3002`);
  }
});
