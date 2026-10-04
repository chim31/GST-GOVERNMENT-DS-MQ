import React from "react";

const COLORS = {
  red: "var(--red)",
  ink: "var(--ink)",
  teal: "var(--teal)",
  white: "var(--white)",
};
const SIZES = {
  xl: "var(--fs-display-xl)",
  lg: "var(--fs-display-lg)",
  md: "var(--fs-display-md)",
};

/* TitleBlock — bloc titre principal : sur-titre (mono/ink) + gros titre
   condensé Bebas, avec sous-titre serif italique optionnel. */
export function TitleBlock({
  eyebrow,
  title,
  subtitle,
  color = "red",
  size = "xl",
  align = "left",
  fleur = false,
  style,
  ...rest
}) {
  const items = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: items, textAlign: align, gap: "var(--space-3)", ...style }} {...rest}>
      {fleur && (
        <span aria-hidden="true" style={{ fontFamily: "var(--font-serif)", fontSize: 40, lineHeight: 1, color: "var(--teal)" }}>
          {"\u269C"}
        </span>
      )}
      {eyebrow && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-mono)", textTransform: "uppercase", color: "var(--text-body)" }}>
          {eyebrow}
        </span>
      )}
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: SIZES[size] || SIZES.xl,
          lineHeight: "var(--lh-display)",
          letterSpacing: "var(--ls-display)",
          textTransform: "uppercase",
          color: COLORS[color] || COLORS.red,
          whiteSpace: "pre-line",
          textWrap: "balance",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ margin: 0, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "var(--fs-serif-lg)", lineHeight: 1.15, color: "var(--text-muted)", maxWidth: "24ch" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
