import React from "react";

export interface TitleBlockProps {
  /** Mono over-line, e.g. "Ce 17 juillet 2026,". */
  eyebrow?: string;
  /** Main headline (Bebas, uppercased by CSS). */
  title: string;
  /** Optional serif-italic subtitle. */
  subtitle?: string;
  /** Headline color. Default "red". */
  color?: "red" | "ink" | "teal" | "white";
  /** Headline size. Default "xl". */
  size?: "xl" | "lg" | "md";
  align?: "left" | "center" | "right";
  /** Show a small fleur-de-lys ornament above. Default false. */
  fleur?: boolean;
  style?: React.CSSProperties;
}

/**
 * @startingPoint section="Content" subtitle="Sur-titre + gros titre condensé + sous-titre" viewport="900x420"
 * Main title block: mono eyebrow, condensed Bebas headline, optional serif-italic subtitle.
 */
export function TitleBlock(props: TitleBlockProps): JSX.Element;
