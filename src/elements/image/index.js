// @ts-check
// https://www.nczonline.net/blog/2013/04/01/making-accessible-icon-buttons/
import * as React from "react";
import md5 from "md5";
import "./style.css";

const getMediaString = ([mediaKey, size]) => {
  const [mediaPredicate, mediaSize] = mediaKey;
  return `(${mediaPredicate}: ${mediaSize}) ${size}`;
};

const getSrcSetString = srcSetMap =>
  [...srcSetMap.entries()]
    .reduce((string, [fileName, size]) => {
      const entry = size ? `${fileName} ${size}` : `${fileName}`;
      return `${string}, ${entry}`;
    }, "")
    .trim();

const getSizesString = sizesMap =>
  [...sizesMap.entries()]
    .reduce((string, [mediaKey, size]) => {
      let entry;
      if (mediaKey) {
        entry = getMediaString([mediaKey, size]);
      } else {
        entry = `${size}`;
      }
      return `${string}, ${entry}`;
    }, "")
    .trim();

const getSources = sourcesMap =>
  [...sourcesMap.entries()].map(([media, fileName]) => (
    <source
      key={md5(`${media}${fileName}`)}
      media={getMediaString(media)}
      srcSet={fileName}
    />
  ));

const getImage = ({ alt, src, className, title, srcSet, sizes, role }) => (
  <img
    alt={alt}
    src={src}
    className={className}
    title={title}
    srcSet={srcSet && getSrcSetString(srcSet)}
    sizes={sizes && getSizesString(sizes)}
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
      "Figure image has no alt attribute, most screen readers will ignore the image. https://dequeuniversity.com/presentations/html5-nfb/figure-figcaption"
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
  title,
  srcSet,
  sizes,
  role,
  imageEl // Allow eg. SVG sprite element
}) => {
  if (imageEl && (imageEl.length || !imageEl.props)) {
    throw new Error("Image - imageEl must be single React element.");
  }

  let image =
    imageEl || getImage({ alt, src, className, title, srcSet, sizes, role });

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
      role
    });
  }

  if (children) {
    if (role) {
      console.warn("Figure image has group role, ignoring role prop.");
    }

    image = getFigure({
      image,
      children,
      className
    });
  }

  return image;
};
