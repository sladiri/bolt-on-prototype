import * as React from "react";

export const Icon = ({ id }) => (
  <svg
    className="icon"
    style={{
      //width:1em;height:1em;vertical-align:middle;margin-right:0.25em;fill:#333;
      width: "1em",
      height: "1em",
      verticalAlign: "middle",
      fill: "#333"
    }}
  >
    <use href={`#${id}`} />
  </svg>
);
