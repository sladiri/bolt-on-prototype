import * as React from "react";
import { SvgSprite } from "elements/svg-sprite";
import { Image } from "elements/image";
import { ImageButton } from "elements/image-button";
import danger3 from "svgSprite/danger-3.svg";
import danger9 from "svgSprite/danger-9.svg";
import danger14 from "svgSprite/danger-14.svg";
import socks from "assets/icons8-socks.png";
import "./style.css";

export const ElementsTest = () => (
  <section className="elementTest">
    <h1>
      <SvgSprite {...danger3} />&nbsp;Elements Gallery
    </h1>
    <section>
      <h1>Images</h1>
      <div className="elementTest__divWithBg">Test SVG background.</div>
      <Image src={socks} className="elementTest__socksImg" />
      <Image
        src={socks}
        alt="Simple Socks Image"
        imgClassName="elementTest__socksFigure"
      >
        This is a figure caption.
      </Image>
      <Image
        alt="Explosion"
        imageEl={
          <SvgSprite {...danger14} description="Explosion is destructive" />
        }
      >
        This is a figure caption with SVG sprite.
      </Image>
    </section>
    <section>
      <h1>Image Buttons</h1>
      <ImageButton className="elementTest__sock-btn" alt="Image Input" />
      <ImageButton alt="Image Button">
        <Image src={socks} className="elementTest__toggleButton" />
      </ImageButton>
      <ImageButton alt="SVG Image Button">
        <SvgSprite {...danger9} className="elementTest__svgImageButtonTest" />
      </ImageButton>
    </section>
  </section>
);
