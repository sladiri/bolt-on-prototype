// @ts-check
import * as React from "react";
import { F } from "@grammarly/focal";

export const SamPanel = ({ views }) => (
  <F.div>
    {views.actionPending.view(x => (x.length ? JSON.stringify(x) : "[ ]"))}
  </F.div>
);
