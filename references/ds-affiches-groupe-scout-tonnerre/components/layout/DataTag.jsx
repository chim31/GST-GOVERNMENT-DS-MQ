import React from "react";

/* Monospace grid marker — ".01 / SPÉCIFICATION" style tag posed along
   grid borders. Traité comme une donnée technique. */
export function DataTag({ index, label, tone = "auto", style, ...rest }) {
  const color = tone === "red" ? "var(--red)" : "var(--tag)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5em",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-tag)",
        fontWeight: "var(--fw-medium)",
        letterSpacing: "var(--ls-tag)",
        textTransform: "uppercase",
        color,
        ...style,
      }}
      {...rest}
    >
      {index != null && <span>{index}</span>}
      {index != null && label != null && <span style={{ opacity: 0.5 }}>/</span>}
      {label != null && <span>{label}</span>}
    </span>
  );
}
