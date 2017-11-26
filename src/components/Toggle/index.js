// @ts-check
import * as React from "react";
import { F } from "@grammarly/focal";

export const Toggle = ({ value, onClick }) => (
  <F.div>
    clickValue: {value}&nbsp;
    <button onClick={onClick}>Toggle</button>
  </F.div>
);
