Footer strip of the real partner scout badges (extracted from the source posters), optionally paired with an event emblem on the right.

```jsx
<PartnerRow badgesSrc="../../assets/partner-badges.png" />

// with an event logo at the right
<PartnerRow
  badgesSrc="../../assets/partner-badges.png"
  logo={<img src="../../assets/camp-unite-badge.png" style={{ height: 96 }} />}
/>
```

`badgesSrc` defaults to a root-relative path — pass the correct relative path for the page's depth. The badge strip is a low-res raster lifted from the posters; swap for originals when available.
