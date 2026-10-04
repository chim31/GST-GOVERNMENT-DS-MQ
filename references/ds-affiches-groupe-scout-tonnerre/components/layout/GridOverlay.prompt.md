Hairline composition grid with crosshair nodes — lay it over a panel to add the discreet technical structure of the Longbow art direction.

```jsx
<div style={{ position: "relative" }}>
  <GridOverlay cols={3} rows={3} nodes />
  {/* content sits above with its own z-index */}
</div>
```

Notes: draws `cols-1` vertical and `rows-1` horizontal lines. Colors default to `--line-on-white` / `--node-on-white`, which auto-flip to light on a `.gst-on-teal` ancestor. Set `nodes={false}` for lines only. Keep it subtle — it should never compete with the type.
