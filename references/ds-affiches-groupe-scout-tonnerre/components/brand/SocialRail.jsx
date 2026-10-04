import React from "react";

/* SocialRail — rail réseaux sociaux latéral, discret, sur le cadre teal.
   Pile d'icônes + poignée verticale (@). Icônes servies par Simple Icons CDN
   (marques standards des plateformes, pas de logo dessiné à la main). */
export function SocialRail({
  platforms = ["facebook", "instagram", "youtube", "tiktok"],
  handle = "@groupesscouttonnerre",
  iconColor = "FFFFFF",
  iconSize = 22,
  gap = "var(--space-3)",
  style,
  ...rest
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-5)",
        ...style,
      }}
      {...rest}
    >
      {handle && (
        <span
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontFamily: "var(--font-mono)",
            fontSize: "calc(var(--fs-tag) - 1px)",
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.7)",
            whiteSpace: "nowrap",
          }}
        >
          {handle}
        </span>
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap }}>
        {platforms.map((p) => (
          <img
            key={p}
            src={`https://cdn.simpleicons.org/${p}/${iconColor}`}
            alt={p}
            width={iconSize}
            height={iconSize}
            style={{ display: "block", opacity: 0.92 }}
          />
        ))}
      </div>
    </div>
  );
}
