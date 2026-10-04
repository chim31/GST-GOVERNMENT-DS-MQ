# UI Kit — Affiches (Posters)

Exemples d'affiches carrées **1080×1080** appliquant le design system à du contenu réel, prêtes pour Instagram / Facebook.

## Écrans
- `journee-bonne-action.html` — annonce d'événement (titre + texte descriptif + fiche infos pratiques). Livrable #1.
- `camp-unite-africaine.html` — variante compte à rebours / date limite (« JJ - 10 », fin des inscriptions 30 juillet 2026). Livrable #2.
- `bonne-chance-examens.html` — variante vœux / félicitations (plus douce, moins de data).
- `index.html` — galerie de survol des trois affiches.

## Composition
Chaque affiche est assemblée à partir des composants du système :
`PosterFrame` (cadre + panneau + grille) › `HeaderBand` › `TitleBlock` / `GreetingBlock` / `Countdown` › `BodyText` › `SpecSheet` › `Divider` + `DataTag` › `SocialRail` (rail) › `PartnerRow` (pied).

Les composants sont chargés depuis `../../_ds_bundle.js` et lus via
`window.GroupeScoutTonnerreDesignSystem_ad7474`. Les chemins d'assets/styles sont relatifs (`../../`).
