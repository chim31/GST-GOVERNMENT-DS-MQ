import React from "react";

export interface CountdownProps {
  /** Red Bebas kicker, e.g. "Fin des inscriptions". */
  kicker?: string;
  /** Mono date line, e.g. "30 juillet 2026". */
  date?: string;
  /** Big number prefix. Default "JJ -". */
  prefix?: string;
  /** Big number, e.g. "10". */
  value: string;
  /** Big number color. Default "ink". */
  color?: "ink" | "red" | "teal";
  align?: "left" | "center";
  style?: React.CSSProperties;
}

/**
 * @startingPoint section="Content" subtitle="Variante compte à rebours / date limite" viewport="900x520"
 * Countdown / deadline variant: giant Bebas numerals, minimal supporting text.
 */
export function Countdown(props: CountdownProps): JSX.Element;
