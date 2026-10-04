import React from "react";

export interface DividerProps {
  /** Rule length (px or CSS length). Default 220. */
  width?: number | string;
  /** Rule thickness. Default --rule-weight (4px). */
  weight?: string;
  /** Rule color. Default --rule (red). */
  color?: string;
  /** Optional mono label rendered under the rule. */
  tag?: string;
  /** Optional mono index rendered under the rule. */
  tagIndex?: string;
  /** Horizontal alignment of rule + tag. Default "left". */
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
}

/** Short red editorial rule, optionally annotated with a mono DataTag. */
export function Divider(props: DividerProps): JSX.Element;
