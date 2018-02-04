// https://www.nczonline.net/blog/2013/04/01/making-accessible-icon-buttons/
import * as React from "react";
import md5 from "md5";
import "./style.css";

const getSources = sourcesMap =>
  [...sourcesMap.entries()].map(([media, fileName]) => (
    <source
      key={md5(`${media}${fileName}`)}
      media={undefined}
      srcSet={fileName}
    />
  ));

const getImage = ({ alt, src, className, srcSet, sizes, role }) => (
  <img
    alt={alt}
    src={src}
    className={className}
    srcSet={srcSet}
    sizes={sizes}
    role={role}
  />
);

const getPicture = ({ sources, image, className, role }) => (
  <picture className={className} role={role}>
    {getSources(sources)}
    {image}
  </picture>
);

// Not supported by a11y tools?
const getFigure = ({ image, children, className }) => {
  if (!image.props.alt) {
    console.warn(
      "Figure image has no alt attribute, most screen readers will ignore the image. https://dequeuniversity.com/presentations/html5-nfb/figure-figcaption",
    );
  }

  return (
    <figure role="group" className={className}>
      {image}
      <figcaption>{children}</figcaption>
    </figure>
  );
};

export const Image = ({
  sources,
  children,
  alt = "",
  src,
  className,
  imgClassName,
  srcSet,
  sizes,
  role,
  imageEl, // Allow eg. SVG sprite element
}) => {
  if (imageEl && (imageEl.length || !imageEl.props)) {
    throw new Error("Image - imageEl must be single React element.");
  }

  let image = imageEl || getImage({ alt, src, className, srcSet, sizes, role });

  const imgProps = {};

  if (imageEl) {
    imgProps.alt = alt;
  }

  if (imgClassName) {
    imgProps.className = imgClassName;
  }

  if (sources || children) {
    imgProps.role = undefined;
  }

  image = React.cloneElement(image, imgProps);

  if (sources) {
    image = getPicture({
      sources,
      image,
      className,
      role,
    });
  }

  if (children) {
    if (role) {
      console.warn("Figure image has group role, ignoring role prop.");
    }

    image = getFigure({
      image,
      children,
      className,
    });
  }

  return image;
};
