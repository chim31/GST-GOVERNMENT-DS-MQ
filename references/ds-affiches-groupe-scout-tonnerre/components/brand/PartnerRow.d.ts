import React from "react";

export interface PartnerRowProps {
  /** Partner badges strip image. Default "assets/partner-badges.png" (pass a correct relative path per page). */
  badgesSrc?: string;
  /** Badge strip height in px. Default 32. */
  height?: number;
  /** Optional mono caption under the strip. */
  caption?: string;
  /** Optional event emblem/logo rendered to the right (e.g. the Camp badge image). */
  logo?: React.ReactNode;
  align?: "center" | "left";
  style?: React.CSSProperties;
}

/** Footer row of real partner scout badges, with an optional event emblem at the right. */
export function PartnerRow(props: PartnerRowProps): JSX.Element;
