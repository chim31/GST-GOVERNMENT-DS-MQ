import React from "react";
import { GridOverlay } from "./GridOverlay.jsx";

/* PosterFrame — cadre carré 1080×1080 de la marque.
   Bordure teal extérieure + panneau de contenu (blanc / écru / teal),
   avec emplacements pour le bandeau d'en-tête, le rail réseaux et le pied. */
export function PosterFrame({
  tone = "white",          // panneau : white | cream | teal
  inset = true,            // panneau posé en carte avec marge teal visible
  grid = false,            // grille hairline dans le panneau
  gridCols = 3,
  gridRows = 3,
  header,
  rail,
  footer,
  size = "var(--poster-size)",
  children,
  className,
  style,
  ...rest
}) {
  const panelBg =
    tone === "cream" ? "var(--bg-panel-alt)" : tone === "teal" ? "var(--bg-invert)" : "var(--bg-panel)";
  const onTeal = tone === "teal";

  const root = {
    position: "relative",
    width: size,
    height: size,
    background: "var(--bg-frame)",
    boxSizing: "border-box",
    padding: "var(--frame-pad)",
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--font-serif)",
    color: "var(--text-body)",
    overflow: "hidden",
    ...style,
  };

  const stack = {
    position: "relative",
    zIndex: 1,
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    // laisse la place au rail à droite
    paddingRight: "var(--rail-width)",
  };

  const panel = {
    position: "relative",
    flex: 1,
    minHeight: 0,
    background: panelBg,
    boxSizing: "border-box",
    padding: "var(--panel-pad)",
    marginTop: header ? "var(--space-6)" : 0,
    display: "flex",
    flexDirection: "column",
    ...(inset ? {} : { margin: 0 }),
  };

  return (
    <div
      className={[onTeal ? "gst-on-teal" : "", className].filter(Boolean).join(" ")}
      style={root}
      {...rest}
    >
      <div style={stack}>
        {header && <div style={{ flex: "none" }}>{header}</div>}
        <div className={onTeal ? "" : ""} style={panel}>
          {grid && <GridOverlay cols={gridCols} rows={gridRows} inset={0} />}
          <div style={{ position: "relative", zIndex: 1, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            {children}
          </div>
          {footer && (
            <div style={{ position: "relative", zIndex: 1, flex: "none", marginTop: "var(--space-6)" }}>{footer}</div>
          )}
        </div>
      </div>
      {rail && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: "var(--frame-pad)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          {rail}
        </div>
      )}
    </div>
  );
}
