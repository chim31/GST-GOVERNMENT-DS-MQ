import React from "react";

/* Hairline composition grid — thin intersecting lines with optional
   crosshair nodes at the intersections. Esprit Longbow : structure
   technique discrète posée par-dessus la composition. */
export function GridOverlay({
  cols = 3,
  rows = 3,
  nodes = true,
  inset = 0,
  color,
  nodeColor,
  style,
  ...rest
}) {
  const line = color || "var(--line-on-white)";
  const node = nodeColor || "var(--node-on-white)";
  const vLines = Array.from({ length: cols - 1 }, (_, i) => ((i + 1) / cols) * 100);
  const hLines = Array.from({ length: rows - 1 }, (_, i) => ((i + 1) / rows) * 100);

  const wrap = {
    position: "absolute",
    inset: typeof inset === "number" ? `${inset}px` : inset,
    pointerEvents: "none",
    zIndex: 0,
    ...style,
  };
  const nodeSize = "var(--node-size)";

  return (
    <div aria-hidden="true" style={wrap} {...rest}>
      {vLines.map((p) => (
        <div key={"v" + p} style={{ position: "absolute", top: 0, bottom: 0, left: p + "%", width: "var(--hairline)", background: line }} />
      ))}
      {hLines.map((p) => (
        <div key={"h" + p} style={{ position: "absolute", left: 0, right: 0, top: p + "%", height: "var(--hairline)", background: line }} />
      ))}
      {nodes &&
        vLines.map((x) =>
          hLines.map((y) => (
            <div
              key={"n" + x + "-" + y}
              style={{
                position: "absolute",
                left: x + "%",
                top: y + "%",
                width: nodeSize,
                height: nodeSize,
                transform: "translate(-50%,-50%)",
                borderTop: `var(--hairline) solid ${node}`,
                borderLeft: `var(--hairline) solid ${node}`,
                borderRight: `var(--hairline) solid ${node}`,
                borderBottom: `var(--hairline) solid ${node}`,
                boxSizing: "border-box",
                background: "transparent",
              }}
            />
          ))
        )}
    </div>
  );
}
