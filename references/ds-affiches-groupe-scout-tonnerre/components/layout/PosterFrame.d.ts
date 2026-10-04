import React from "react";

export interface PosterFrameProps {
  /** Content panel background. Default "white". */
  tone?: "white" | "cream" | "teal";
  /** Panel sits as an inset card with a visible teal margin. Default true. */
  inset?: boolean;
  /** Draw a hairline GridOverlay inside the panel. Default false. */
  grid?: boolean;
  gridCols?: number;
  gridRows?: number;
  /** Header band rendered on the teal frame, above the panel. */
  header?: React.ReactNode;
  /** Social rail rendered in the right frame gutter. */
  rail?: React.ReactNode;
  /** Footer (partner badges + logo) rendered at the panel bottom. */
  footer?: React.ReactNode;
  /** Square size. Default var(--poster-size) = 1080px. */
  size?: number | string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * @startingPoint section="Posters" subtitle="Cadre carré 1080×1080 de la marque" viewport="1080x1080"
 * Square poster shell: teal frame + content panel with header / rail / footer slots.
 */
export function PosterFrame(props: PosterFrameProps): JSX.Element;
