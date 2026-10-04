import React from "react";

export interface BodyTextProps {
  children: React.ReactNode;
  /** Body size. Default "md". */
  size?: "md" | "sm";
  /** "muted" | "ink" | any CSS color. Default "muted". */
  color?: "muted" | "ink" | string;
  /** Max line length. Default "38ch". */
  maxWidth?: string;
  /** Optional red-italic note line, e.g. "NB : Prévoir des gants…". */
  note?: string;
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
}

/** Short descriptive paragraph in the editorial serif, with an optional red-italic note. */
export function BodyText(props: BodyTextProps): JSX.Element;
