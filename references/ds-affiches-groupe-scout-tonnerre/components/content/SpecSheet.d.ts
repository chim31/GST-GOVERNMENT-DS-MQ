import React from "react";

export interface SpecItem {
  /** Short label, e.g. "Départ", "Lieu", "Inscription". */
  label: string;
  /** Value, e.g. "8h30", "Attikoumé", "5 000 F CFA". */
  value: string;
  /** Optional mono index prefix on the label (stack layout), e.g. ".01". */
  index?: string;
}

export interface SpecSheetProps {
  items: SpecItem[];
  /** "stack" (label→value rows), "inline" (a | b | c), "cards" (bordered value cartouches). Default "stack". */
  layout?: "stack" | "inline" | "cards";
  style?: React.CSSProperties;
}

/**
 * @startingPoint section="Content" subtitle="Fiche technique mono : date / lieu / prix / contact" viewport="900x360"
 * Practical-info block rendered like a technical spec sheet, all in monospace.
 */
export function SpecSheet(props: SpecSheetProps): JSX.Element;
