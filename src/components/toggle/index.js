// @ts-check
import * as React from "react";
import { F } from "@grammarly/focal";
import { ImageButton } from "components/image-button";
import { Image } from "components/image";
import "./style.css";

export const Toggle = ({ value, onClick }) => (
  <F.div>
    clickValue: {value}&nbsp;
    <ImageButton alt="Toggle" onClick={onClick}>
      <Image
        alt="Toggle"
        src="/assets/icons8-socks.png"
        className="toggleButton"
      />
    </ImageButton>
  </F.div>
);
