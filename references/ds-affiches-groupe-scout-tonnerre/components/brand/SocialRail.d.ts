import React from "react";

export interface SocialRailProps {
  /** Simple-Icons slugs, top to bottom. Default facebook / instagram / youtube / tiktok. */
  platforms?: string[];
  /** Rotated handle text. Default "@groupesscouttonnerre". Pass "" to hide. */
  handle?: string;
  /** Hex (no #) passed to Simple Icons CDN. Default "FFFFFF". */
  iconColor?: string;
  /** Icon size in px. Default 22. */
  iconSize?: number;
  /** Gap between icons. */
  gap?: string;
  style?: React.CSSProperties;
}

/** Discreet lateral social rail: rotated @handle + a vertical stack of platform icons. */
export function SocialRail(props: SocialRailProps): JSX.Element;
