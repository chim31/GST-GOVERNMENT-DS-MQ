# GST GOVERNMENT — Design system

Plateforme de commandement du **Groupe Scout Tonnerre** (District Golfe, Association Scoute du Togo) : design system web, motion et expériences 3D.

## Ouvrir le design system

Ouvrir [`design-system/index.html`](design-system/index.html) dans un navigateur (aucune installation), ou :

```bash
cd design-system && python3 -m http.server 8080   # http://localhost:8080
```

## Organisation du dépôt

```
design-system/        Le design system web (livrable) — voir design-system/README.md
  index.html …        8 planches : ouverture, fondations, motion, composants, écrans, roadmap 3D, bus volant, guide
  tokens/             gst-tokens.css (source de vérité) + gst-tokens.json (DTCG, généré)
  assets/css, js, img Composants, moteur de motion, kit 3D, icônes, données factices
  tools/              build-tokens-json.py

docs/
  projet/             Les 3 documents du projet : référence, roadmap, cahier des charges
  prompt-design/      Prompt de design (md + pdf) et tokens source fournis

references/
  ds-affiches-groupe-scout-tonnerre/   DS d'affiches d'origine (identité visuelle, logos, composants)
```

## Workflow

- Les tokens se modifient dans `design-system/tokens/gst-tokens.css`, puis :
  `python3 design-system/tools/build-tokens-json.py` régénère le JSON.
- Les composants (`assets/css/gst.css`) n'utilisent que des tokens sémantiques — jamais de couleur en dur.
- `?noperf` dans l'URL désactive la bascule 2D automatique des pages 3D (tests sur machine lente).
