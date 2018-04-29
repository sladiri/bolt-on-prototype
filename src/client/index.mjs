import assert from "assert";
// @ts-ignore
import { app } from "../app";

(async () => {
  const container = document.querySelector("#app");
  assert.ok(container);
  const { Component, hyper } = await import("hyperhtml/esm");
  const title = document.title;
  hyper(container)`${app({ render: hyper(), model: { title } })}`;
})().catch(error => {
  console.error("app index error", error);
});
