import React from "react";

/* BodyText — bloc de texte descriptif, en serif lisible (EB Garamond).
   Note optionnelle façon "NB : …" en rouge italique. */
export function BodyText({
  children,
  size = "md",
  color = "muted",
  maxWidth = "38ch",
  note,
  align = "left",
  style,
  ...rest
}) {
  const fs = size === "sm" ? "var(--fs-body-sm)" : "var(--fs-body)";
  const col = color === "ink" ? "var(--text-body)" : color === "muted" ? "var(--text-muted)" : color;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", textAlign: align, ...style }} {...rest}>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-serif)",
          fontSize: fs,
          lineHeight: "var(--lh-body)",
          color: col,
          maxWidth,
          textWrap: "pretty",
        }}
      >
        {children}
      </p>
      {note && (
        <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "var(--fs-body-sm)", lineHeight: 1.4, color: "var(--red)", maxWidth }}>
          {note}
        </p>
      )}
    </div>
  );
}
