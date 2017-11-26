// @ts-check
import * as React from "react";
import { F } from "@grammarly/focal";

export const AnInput = ({ value, onChange }) => (
  <F.div>
    textValue: {value}&nbsp;
    <F.input value={value} onChange={onChange} />
  </F.div>
);
