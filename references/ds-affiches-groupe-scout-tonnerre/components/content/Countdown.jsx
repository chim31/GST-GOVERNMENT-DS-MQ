import React from "react";

/* Countdown — variante compte à rebours / date limite.
   Chiffres très gros (Bebas), minimal. Ex. "JJ - 10". */
export function Countdown({
  kicker,            // ex. "Fin des inscriptions" (rouge)
  date,              // ex. "30 juillet 2026" (mono)
  prefix = "JJ -",   // ex. "JJ -" ou "J-"
  value,             // ex. "10"
  color = "ink",
  align = "left",
  style,
  ...rest
}) {
  const bigColor = color === "red" ? "var(--red)" : color === "teal" ? "var(--teal)" : "var(--ink)";
  const items = align === "center" ? "center" : "flex-start";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: items, textAlign: align, gap: "var(--space-4)", ...style }} {...rest}>
      {kicker && (
        <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-display-lg)", lineHeight: 0.9, letterSpacing: "0.01em", textTransform: "uppercase", color: "var(--red)" }}>
          {kicker}
        </div>
      )}
      {date && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-body)" }}>
          {date}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.3em", fontFamily: "var(--font-display)", fontSize: "var(--fs-display-2xl)", lineHeight: 0.82, letterSpacing: "0.01em", color: bigColor }}>
        <span>{prefix}</span>
        <span>{value}</span>
      </div>
    </div>
  );
}
