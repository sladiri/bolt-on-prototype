import * as React from "react";
import "./style.css";

export const Icon = ({ id }) => (
  <svg className="icon">
    <use href={`#${id}`} />
  </svg>
);
