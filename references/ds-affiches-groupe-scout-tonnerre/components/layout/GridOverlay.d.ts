import React from "react";

export interface GridOverlayProps {
  /** Number of vertical columns (draws cols-1 internal lines). Default 3. */
  cols?: number;
  /** Number of horizontal rows (draws rows-1 internal lines). Default 3. */
  rows?: number;
  /** Show small square crosshair nodes at line intersections. Default true. */
  nodes?: boolean;
  /** Inset from the positioned parent's edges (px or CSS length). Default 0. */
  inset?: number | string;
  /** Line color. Defaults to --line-on-white (auto-flips on .gst-on-teal). */
  color?: string;
  /** Node color. Defaults to --node-on-white. */
  nodeColor?: string;
  style?: React.CSSProperties;
}

/**
 * Hairline composition grid overlay with optional crosshair nodes.
 * Place inside a `position:relative` container (PosterFrame provides one).
 */
export function GridOverlay(props: GridOverlayProps): JSX.Element;
