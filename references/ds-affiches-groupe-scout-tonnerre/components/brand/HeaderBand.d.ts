import React from "react";

export interface HeaderBandProps {
  /** Top over-line. Default "Association Scoute du Togo". */
  eyebrow?: string;
  /** Group name (Bebas display). Default "Groupe Scout Tonnerre". */
  org?: string;
  /** Sub-mention under the name, e.g. "vous présente" / "vous souhaite". */
  submention?: string;
  /** Collaboration variant: partner org line above the connector. */
  collaborator?: string;
  /** Connector line for the collaboration variant. Default "en collaboration avec". */
  connector?: string;
  /** Closing verb for the collaboration variant, e.g. "organisent". */
  closer?: string;
  /** Text tone. "light" on teal frame, "dark" on a white panel. Default "light". */
  tone?: "light" | "dark";
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
}

/**
 * @startingPoint section="Brand" subtitle="Bandeau d'en-tête association + groupe" viewport="900x260"
 * Brand header band: association over-line, group name, sub-mention, with a collaboration variant.
 */
export function HeaderBand(props: HeaderBandProps): JSX.Element;
