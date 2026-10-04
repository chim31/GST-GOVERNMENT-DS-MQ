import React from "react";

export interface FleurProps {
  /** Glyph size (px or CSS length). Default 64. */
  size?: number | string;
  /** Color. Default var(--teal). */
  color?: string;
  style?: React.CSSProperties;
}

/** Flat fleur-de-lys brand motif using the Unicode glyph ⚜ (no drawn logo). */
export function Fleur(props: FleurProps): JSX.Element;
