// @ts-check
import * as React from "react";
import classNames from "classnames";
import "./style.css";

export const SvgSprite = ({ id, alt, description, className }) => {
  if (!id) {
    console.error("Invalid ID for SVG-sprite.");
  }

  const a11yId = `${id}-${Math.random()}`; // Ensure support bye a11y tools. https://www.sitepoint.com/tips-accessible-svg/

  const title = alt ? <title id={`title-${a11yId}`}>{alt}</title> : null;
  const desc = description ? (
    <desc id={`desc-${a11yId}`}>{description}</desc>
  ) : null;

  const a11yLabel = {
    "aria-labelledby":
      [title, desc]
        .filter(x => x && x.props.id)
        .map(x => x.props.id)
        .join(" ") || undefined
  };

  return (
    <svg
      {...a11yLabel}
      className={classNames("svgSprite", className)}
      role="img"
    >
      {title}
      {desc}
      <use role="presentation" xlinkHref={`#${id}`} />
    </svg>
  );
};
