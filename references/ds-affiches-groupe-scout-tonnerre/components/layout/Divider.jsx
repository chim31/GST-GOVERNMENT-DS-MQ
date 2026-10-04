import React from "react";
import { DataTag } from "./DataTag.jsx";

/* Editorial rule — filet rouge de séparation, avec tag mono optionnel.
   Reprend le filet rouge des affiches "Journée de la Bonne Action". */
export function Divider({
  width = 220,
  weight,
  color = "var(--rule)",
  tag,
  tagIndex,
  align = "left",
  style,
  ...rest
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        gap: "var(--space-3)",
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: weight || "var(--rule-weight)",
          background: color,
        }}
      />
      {(tag || tagIndex) && <DataTag index={tagIndex} label={tag} />}
    </div>
  );
}
