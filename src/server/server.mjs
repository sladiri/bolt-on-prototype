import { readFileSync } from "fs";
import http2 from "http2";
import https from "https";
import { AppServer } from "../app-server/app-server";
import { GunServer } from "../gun-server/gun-server";

const host = "localhost";
const appPort = 9900;
const syncPort = 9901;
const key = readFileSync("./privkey.pem", "utf8");
const cert = readFileSync("./cert.pem", "utf8");

const serverCallback = ({ host, port }) => error => {
    if (error) {
        console.error(
            `Server [ https://${host}:${port} ] listen error`,
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
    AppServer({ publicPath: "public" }).callback(),
);
const appServerOptions = { host, port: appPort };
appServer.listen(appServerOptions, serverCallback(appServerOptions));

const syncServer = https.createServer({ key, cert });
GunServer({ httpServer: syncServer });
const syncServerOptions = { host, port: syncPort };
syncServer.listen(syncServerOptions, serverCallback(syncServerOptions));
