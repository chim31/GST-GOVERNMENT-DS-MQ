import React from "react";

/* PartnerRow — ligne de badges partenaires + logo d'événement optionnel.
   Utilise le vrai visuel de badges extrait des affiches (assets/partner-badges.png). */
export function PartnerRow({
  badgesSrc = "assets/partner-badges.png",
  height = 32,
  caption,
  logo,                 // node : logo/emblème d'événement à droite (ex. camp badge)
  align = "center",
  style,
  ...rest
}) {
  const badges = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", gap: "var(--space-2)" }}>
      {badgesSrc && <img src={badgesSrc} alt="Partenaires scouts" style={{ height, width: "auto", display: "block" }} />}
      {caption && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-tag)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-faint)" }}>
          {caption}
        </span>
      )}
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: logo ? "space-between" : align,
        gap: "var(--space-6)",
        width: "100%",
        ...style,
      }}
      {...rest}
    >
      {logo ? <span style={{ flex: "none", width: 1 }} /> : null}
      {badges}
      {logo && <div style={{ flex: "none" }}>{logo}</div>}
    </div>
  );
}
