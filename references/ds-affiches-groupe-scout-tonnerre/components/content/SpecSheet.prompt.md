The practical-information block — date, time, place, price, contact — treated as a monospace technical spec sheet with short labels and aligned values.

```jsx
<SpecSheet layout="inline" items={[
  { label: "Départ", value: "8h30" },
  { label: "Lieu", value: "Attikoumé" },
  { label: "Arrivée", value: "CPLT" },
]} />

<SpecSheet layout="cards" items={[
  { label: "Inscription", value: "5 000 F CFA" },
  { label: "Participation", value: "25 000 F CFA" },
]} />
```

Layouts: `stack` for a vertical fiche (label column + values), `inline` for a one-line "a | b | c" run, `cards` for boxed prices. Keep labels one word where possible.
