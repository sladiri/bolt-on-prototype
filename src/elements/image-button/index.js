// @ts-check
// https://www.nczonline.net/blog/2013/04/01/making-accessible-icon-buttons/
import * as React from "react";
import classNames from "classnames";
import "./style.css";

const transparentPixel =
  "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

export const ImageButton = ({ alt, className, children, type, onClick }) =>
  children ? (
    <button
      type={type}
      onClick={onClick}
      className={classNames("imageButton--button", className)}
    >
      <span className="imageButton__label">{alt}</span>
      {React.cloneElement(children, { role: "presentation" })}
    </button>
  ) : (
    <input
      type="image"
      src={transparentPixel}
      alt={alt}
      className={classNames("imageButton--input", className)}
    />
  );
