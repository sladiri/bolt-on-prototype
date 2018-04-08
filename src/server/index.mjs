import fs from "fs";
import http2 from "http2";
// @ts-ignore
import { createApp } from "./control";

const key = fs.readFileSync("./privkey.pem", "utf8").toString();
const cert = fs.readFileSync("./cert.pem", "utf8").toString();

const host = "localhost";
const port = 3001;
const server = http2.createSecureServer({ key, cert }, createApp().callback());

const serverCallback = error => {
  if (error) {
    console.error("Server listen error: ", error, error && error.stack);
  } else {
    console.log(`Server listen OK: https://${host}:${port}`);
  }
};
server.listen({ host, port }, serverCallback);
