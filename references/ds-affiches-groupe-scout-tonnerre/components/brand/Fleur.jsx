import React from "react";

/* Fleur de lys — motif scout universel, rendu à plat via le glyphe
   Unicode ⚜ (U+269C). Aucun logo dessiné : caractère typographique. */
export function Fleur({ size = 64, color = "var(--teal)", style, ...rest }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        fontFamily: "var(--font-serif)",
        fontSize: typeof size === "number" ? `${size}px` : size,
        lineHeight: 1,
        color,
        ...style,
      }}
      {...rest}
    >
      {"\u269C"}
    </span>
  );
}
