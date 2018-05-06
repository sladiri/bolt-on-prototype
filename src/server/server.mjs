import fs from "fs";
import http2 from "http2";
import https from "https";
// @ts-ignore
import { httpServer, gunServer } from "./control";

const host = "localhost";
const appPort = 9900;
const syncPort = 9901;
const key = fs.readFileSync("./privkey.pem", "utf8");
const cert = fs.readFileSync("./cert.pem", "utf8");

const serverCallback = ({ host, port }) => error => {
  if (error) {
    console.error(
      `Server [ https://${host}:${port} ] listen error:`,
      error,
      error && error.stack,
    );
    throw error;
  } else {
    console.log(`Server [ https://${host}:${port} ] listen OK.`);
  }
};

const appServer = http2.createSecureServer(
  { key, cert },
  httpServer({ publicPath: "public" }).callback(),
);
const appServerOptions = { host, port: appPort };
appServer.listen(appServerOptions, serverCallback(appServerOptions));

const syncServer = https.createServer({ key, cert });
gunServer({ httpServer: syncServer });
const syncServerOptions = { host, port: syncPort };
syncServer.listen(syncServerOptions, serverCallback(syncServerOptions));
