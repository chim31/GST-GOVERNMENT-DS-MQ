import React from "react";

/* HeaderBand — bandeau d'en-tête de marque, posé sur le cadre teal.
   Sur-mention association + nom du groupe + sous-mention ("vous présente"…).
   Variante collaboration : lignes org1 / connector / org principal. */
export function HeaderBand({
  eyebrow = "Association Scoute du Togo",
  org = "Groupe Scout Tonnerre",
  submention = "vous présente",
  collaborator,                 // ex. "Le Groupe Scout Saint Pierre de Gounghin du Burkina Faso"
  connector = "en collaboration avec",
  closer,                       // ex. "organisent"
  tone = "light",               // light (sur teal) | dark (sur panneau)
  align = "center",
  style,
  ...rest
}) {
  const base = tone === "dark" ? "var(--ink)" : "var(--white)";
  const faint = tone === "dark" ? "var(--ink-40)" : "rgba(255,255,255,0.8)";
  const alignItems = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  const eyebrowStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--fs-mono-sm)",
    letterSpacing: "var(--ls-eyebrow)",
    textTransform: "uppercase",
    color: faint,
    fontWeight: "var(--fw-medium)",
  };
  const smallCaps = {
    fontFamily: "var(--font-mono)",
    fontSize: "calc(var(--fs-mono-sm) - 3px)",
    letterSpacing: "0.24em",
    textTransform: "uppercase",
    color: faint,
    fontWeight: "var(--fw-regular)",
  };

  return (
    <header
      style={{ display: "flex", flexDirection: "column", alignItems, gap: "var(--space-2)", textAlign: align, ...style }}
      {...rest}
    >
      <div style={eyebrowStyle}>{eyebrow}</div>
      <div style={{ width: 42, height: "var(--hairline)", background: faint, opacity: 0.7 }} />
      {collaborator && (
        <>
          <div style={{ ...smallCaps, fontWeight: "var(--fw-medium)", letterSpacing: "0.18em", marginTop: "var(--space-1)" }}>
            {collaborator}
          </div>
          <div style={smallCaps}>{connector}</div>
        </>
      )}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-display-md)",
          lineHeight: 1,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: base,
        }}
      >
        {org}
      </div>
      {(closer || submention) && <div style={smallCaps}>{closer || submention}</div>}
    </header>
  );
}
