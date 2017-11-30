// @ts-check
// https://www.nczonline.net/blog/2013/04/01/making-accessible-icon-buttons/
import * as React from "react";
import { F } from "@grammarly/focal";
import md5 from "md5";

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
    <F.source
      key={md5(`${media}${fileName}`)}
      media={getMediaString(media)}
      srcSet={fileName}
    />
  ));

const getImage = ({ alt, src, className, title, srcSet, sizes }) => (
  <F.img
    alt={alt}
    src={src}
    className={className}
    title={title}
    srcSet={srcSet && getSrcSetString(srcSet)}
    sizes={sizes && getSizesString(sizes)}
  />
);

const getPicture = ({ sources, image, className }) => (
  <F.picture className={className}>
    {getSources(sources)}
    {image}
  </F.picture>
);

const getFigure = ({ image, children, alt, src, className }) => {
  const baseId = md5(`${alt}-${src}`);

  const ids = [baseId];
  const figureCaptions = [];
  React.Children.forEach(children, child => {
    const id = child.props.id || `${baseId}-${Math.random()}`;
    const childWithId = child.props.id
      ? child
      : React.cloneElement(child, { id });

    ids.push(id);
    figureCaptions.push(childWithId);
  });

  return (
    <figure role="group" aria-labelledby={ids.join(" ")} className={className}>
      {image}
      {figureCaptions}
    </figure>
  );
};

const resetClassName = ({ image, className }) =>
  React.cloneElement(image, { className });

export const Image = ({
  sources,
  children,
  alt,
  src,
  className,
  title,
  srcSet,
  sizes,
  imgClassName
}) => {
  let image = getImage({ alt, src, className, title, srcSet, sizes });

  if (sources) {
    image = getPicture({
      sources,
      image: resetClassName({ image, className: imgClassName }),
      className
    });
  }

  if (children) {
    image = getPicture({
      sources,
      image: resetClassName({ image, className: imgClassName }),
      className
    });
    image = getFigure({ image, children, alt, src, className });
  }

  return image;
};
