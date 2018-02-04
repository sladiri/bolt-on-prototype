import * as React from "react";
import { F } from "@grammarly/focal";

export const AnInput = ({ value, onChange }) => (
  <F.div>
    <F.input onChange={onChange} />
    <br />
    textValue: {value}&nbsp;
  </F.div>
);
