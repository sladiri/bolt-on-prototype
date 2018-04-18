import fs from "fs";
import http2 from "http2";
import https from "https";
import WebSocket from "ws";
// @ts-ignore
import { app, gun } from "./control";

const serverCallback = ({ host, port }) => error => {
  if (error) {
    console.error(
      `Server [ https://${host}:${port} ] listen error:`,
      error,
      error && error.stack,
    );
  } else {
    console.log(`Server [ https://${host}:${port} ] listen OK.`);
  }
};

const key = fs.readFileSync("./privkey.pem", "utf8");
const cert = fs.readFileSync("./cert.pem", "utf8");

const server = http2.createSecureServer(
  { key, cert },
  app({ publicPath: "public" }).callback(),
);
const serverOptions = { host: "localhost", port: 3001 };
server.listen(serverOptions, serverCallback(serverOptions));

const gunServer = https.createServer({ key, cert });
gun({ wss: new WebSocket.Server({ server: gunServer }) });
const gunServerOptions = { host: "localhost", port: 3002 };
gunServer.listen(gunServerOptions, serverCallback(gunServerOptions));
