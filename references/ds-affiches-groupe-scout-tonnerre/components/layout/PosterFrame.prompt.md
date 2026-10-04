The square 1080×1080 shell for every poster: teal frame around a white / cream / teal content panel, with slots for the header band, social rail and partner footer.

```jsx
<PosterFrame
  tone="white"
  grid
  header={<HeaderBand submention="vous présente" />}
  rail={<SocialRail />}
  footer={<PartnerRow />}
>
  <TitleBlock eyebrow="Ce 17 juillet 2026," title="Journée de la Bonne Action" />
  <BodyText>…</BodyText>
</PosterFrame>
```

Variants: `tone="teal"` gives a full teal panel and switches the interior to light text (greeting / vœux variant). `inset={false}` lets the panel fill the frame. `grid` overlays the hairline structure. Always render at 1080×1080; scale via the card viewport, not by resizing the frame.
