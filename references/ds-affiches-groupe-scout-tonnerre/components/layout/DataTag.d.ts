import React from "react";

export interface DataTagProps {
  /** Left marker, e.g. ".01", ".FEV", "N°". */
  index?: string;
  /** Right label, e.g. "SPÉCIFICATION", "INFOS". */
  label?: string;
  /** Color tone. Default "auto" (--tag). */
  tone?: "auto" | "red";
  style?: React.CSSProperties;
}

/** Small monospace grid marker in the Longbow ".01 / LABEL" idiom. */
export function DataTag(props: DataTagProps): JSX.Element;
