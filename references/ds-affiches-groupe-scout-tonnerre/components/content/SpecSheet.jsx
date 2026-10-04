import React from "react";

/* SpecSheet — bloc "infos pratiques" façon fiche technique, en mono.
   items: [{ label, value, index? }]. Layouts : stack | inline | cards. */
export function SpecSheet({ items = [], layout = "stack", style, ...rest }) {
  const labelStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--fs-mono-sm)",
    letterSpacing: "var(--ls-label)",
    textTransform: "uppercase",
    color: "var(--text-faint)",
    fontWeight: "var(--fw-medium)",
  };
  const valueStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--fs-mono)",
    letterSpacing: "var(--ls-mono)",
    color: "var(--text-body)",
    fontWeight: "var(--fw-semibold)",
  };

  if (layout === "inline") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "var(--space-2) var(--space-4)", ...style }} {...rest}>
        {items.map((it, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>|</span>}
            <span style={{ display: "inline-flex", alignItems: "baseline", gap: "0.5em" }}>
              <span style={labelStyle}>{it.label}</span>
              <span style={valueStyle}>{it.value}</span>
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (layout === "cards") {
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-5)", ...style }} {...rest}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <span style={{ ...labelStyle, color: "var(--text-muted)" }}>{it.label}</span>
            <div style={{ border: "var(--border-weight) solid var(--teal)", padding: "var(--space-3) var(--space-4)", display: "inline-flex" }}>
              <span style={{ ...valueStyle, fontSize: "var(--fs-mono)" }}>{it.value}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // stack (défaut) : lignes label → valeur, colonne label alignée
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", ...style }} {...rest}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(120px, max-content) 1fr", columnGap: "var(--space-5)", alignItems: "baseline" }}>
          <span style={labelStyle}>
            {it.index ? it.index + " " : ""}
            {it.label}
          </span>
          <span style={valueStyle}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}
