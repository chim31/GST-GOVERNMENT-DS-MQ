import React from "react";

export interface GreetingBlockProps {
  /** Serif-italic lead-in, e.g. "Bonne fête de". */
  lead?: string;
  /** Bebas highlight word, e.g. "Tabaski". */
  highlight?: string;
  /** Optional serif message line. */
  message?: string;
  /** Highlight color. Default "ink". */
  highlightColor?: "ink" | "red" | "teal";
  /** Show a fleur ornament on top. Default true. */
  fleur?: boolean;
  align?: "center" | "left";
  style?: React.CSSProperties;
}

/**
 * @startingPoint section="Content" subtitle="Variante vœux / félicitations" viewport="900x520"
 * Greeting / congratulations variant: softer serif-italic lead + Bebas highlight word.
 */
export function GreetingBlock(props: GreetingBlockProps): JSX.Element;
