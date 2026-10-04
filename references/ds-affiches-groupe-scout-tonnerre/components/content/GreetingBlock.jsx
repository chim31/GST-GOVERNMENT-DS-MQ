import React from "react";

/* GreetingBlock — variante vœux / félicitations, plus douce, moins de data.
   Amorce en serif italique (EB Garamond, remplace le script "Canva"),
   mot fort en Bebas, message serif optionnel, ornement fleur. */
export function GreetingBlock({
  lead,               // ex. "Bonne fête de" (serif italique)
  highlight,          // ex. "Tabaski" (Bebas)
  message,            // ex. "Travaillez avec confiance, réussissez avec fierté !"
  highlightColor = "ink",
  fleur = true,
  align = "center",
  style,
  ...rest
}) {
  const hc = highlightColor === "red" ? "var(--red)" : highlightColor === "teal" ? "var(--teal)" : "var(--text-body)";
  const items = align === "center" ? "center" : "flex-start";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: items, textAlign: align, gap: "var(--space-4)", ...style }} {...rest}>
      {fleur && (
        <span aria-hidden="true" style={{ fontFamily: "var(--font-serif)", fontSize: 52, lineHeight: 1, color: "var(--teal)" }}>
          {"\u269C"}
        </span>
      )}
      {lead && (
        <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "var(--fs-serif-xl)", lineHeight: 1.05, color: "var(--text-muted)" }}>
          {lead}
        </span>
      )}
      {highlight && (
        <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-display-xl)", lineHeight: 0.9, letterSpacing: "0.02em", textTransform: "uppercase", color: hc }}>
          {highlight}
        </span>
      )}
      {message && (
        <p style={{ margin: 0, marginTop: "var(--space-2)", fontFamily: "var(--font-serif)", fontSize: "var(--fs-body)", lineHeight: "var(--lh-body)", color: "var(--text-muted)", maxWidth: "30ch", textWrap: "pretty" }}>
          {message}
        </p>
      )}
    </div>
  );
}
