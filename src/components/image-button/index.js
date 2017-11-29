// @ts-check
// https://www.nczonline.net/blog/2013/04/01/making-accessible-icon-buttons/
import * as React from "react";
import { F } from "@grammarly/focal";

const transparentPixel =
  "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

export const ImageButton = ({ alt, className }) => (
  <F.input
    type="image"
    src={transparentPixel}
    className={className}
    alt={alt}
  />
);
