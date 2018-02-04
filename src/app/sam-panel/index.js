import * as React from "react";
import { F } from "@grammarly/focal";

export const SamPanel = ({ views }) => (
  <F.div>
    <F.div>
      SUPER WIKI SEARCH RXJS:
      <br />
      {views.wiki}
    </F.div>
    <F.div>SUPER CLICKER RXJS: {views.ticker}</F.div>
    Pending SAM Actions:
    <br />
    {views.actionPending.view(x => (x.length ? JSON.stringify(x) : "[ ]"))}
  </F.div>
);
