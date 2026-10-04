# Groupe Scout Tonnerre — Design System

Système de design réutilisable pour les **affiches carrées 1:1 (1080×1080)** du **Groupe Scout Tonnerre** (Association Scoute du Togo), destinées à Instagram / Facebook.

Objectif : conserver l'identité visuelle existante (teal, rouge, fleur de lys, badges scouts, mentions institutionnelles) mais la rendre **plus épurée, éditoriale, moins « template Canva »** — design **plat, net, typographique et sur grille**, sans dégradés, sans illustration 3D/IA, sans effet glow.

## Sources fournies
- **6 affiches existantes** (`uploads/01.jpeg` … `06.jpeg`) → identité de marque : palette teal/rouge, cadre + panneau, bandeau d'en-tête, rail réseaux sociaux, badges partenaires, variantes (Tabaski, examens, camp, compte à rebours, journée bonne action).
- **Site Longbow Motors** (`uploads/Longbow _ British Hand-Built…​.html` + `_files/`) → direction artistique : trio typographique (Bebas Neue / EB Garamond / Geist Mono), grille hairline avec réticules, marqueurs de données mono (`.01 / SPEC`), beaucoup d'espace négatif.
- **Notes du brief** (piliers « style Longbow poster ») → grille technique, trilogie typographique, palette stricte.

> **Logo officiel fourni** : `assets/logos/groupe-scout-tonnerre.jpeg` (crête montagne, « GROUPE SCOUT TONNERRE · DISTRICT GOLFE · since 2013 »). Une **bibliothèque de logos originaux** (WOSM, colombe scoute, Région Afrique, African United Camp, Safe From Harm, Digitalise Youth, Digital Democracy) est disponible dans `assets/logos/`. Le motif **fleur de lys** reste utilisable à plat via le glyphe Unicode ⚜. Formats fournis : **JPEG** (fond blanc/couleur, non détouré) — des **PNG/SVG détourés** seraient préférables pour un placement sur fond teal.

---

## CONTENT FUNDAMENTALS
Comment la marque écrit.

- **Langue** : français. Ton **institutionnel mais chaleureux**, fédérateur, orienté service et communauté.
- **Adresse** : on parle **au public/à la 2ᵉ personne** via l'association (« vous présente », « vous souhaite », « Nous invitons tous les scouts et non scouts à se joindre à nous »). L'émetteur est collectif (« nous »), jamais « je ».
- **Casse** :
  - Bandeau institutionnel en **CAPITALES très espacées** (« ASSOCIATION SCOUTE DU TOGO »).
  - Gros titres en **CAPITALES condensées** (« CAMP DE L'UNITÉ AFRICAINE », « FIN DES INSCRIPTIONS »).
  - Mentions & sous-titres en **bas-de-casse** discret (« vous présente », « en collaboration avec », « organisent »).
- **Infos pratiques** : format **fiche technique** — label court + valeur (« Départ : 8h30 · Lieu : Attikoumé · Arrivée : CPLT » ; « INSCRIPTION 5 000 F CFA »). Contacts en numéros bruts séparés par ` / `.
- **Dates** : « 17 juillet 2026 », « DU 05 – 18 AOÛT 2026 », comptes à rebours « JJ - 10 ».
- **Notes** : mention d'avertissement en italique préfixée « NB : … » (« NB : Prévoir des gants et des sacs poubelles »).
- **Vœux** : chaleureux et courts (« Bonne fête de Tabaski », « Bonne chance à tous pour vos examens », « On croit en vous ! »).
- **Emoji** : **aucun**. Les seuls pictogrammes sont les badges/emblèmes scouts et le motif fleur de lys.
- **Signature** : handles réseaux `@associationscoutedutogo` et `@groupesscouttonnerre`.

---

## VISUAL FOUNDATIONS
Les motifs et fondations visuelles.

- **Palette (4 couleurs, zéro dégradé)** : teal `#0C7873`, rouge accent `#C42621`, écru `#F4F4F2` / blanc, encre `#141414`. Teal profond `#06605E` pour les cadres. Contrastes stricts, aucune saturation fluo.
- **Typographie — trio** :
  - **Bebas Neue** (`--font-display`) : gros titres condensés capitales, chiffres géants, accents.
  - **EB Garamond** (`--font-serif`) : titres élégants (italique) + **texte courant lisible**.
  - **IBM Plex Mono** (`--font-mono`, *substitut de Geist Mono*) : toutes les infos pratiques, labels, tags de grille.
- **Grille & structure** : lignes **hairline** (1px) horizontales/verticales traversant la composition, **réticules** (petits carrés 7px) aux nœuds, **marqueurs de données** mono en bord de bloc (`.01 / LABEL`, `N° / INFOS`). Beaucoup d'**espace négatif**, alignements stricts, base d'espacement 4.
- **Structure d'affiche** : **cadre teal** extérieur (34px) → **panneau** blanc ou écru (padding 68px) → contenu. **Rail réseaux** vertical discret dans la gouttière droite. **Pied** = badges partenaires (+ emblème événement à droite).
- **Arrière-plans** : **aplats** (teal ou blanc/écru). Pas de dégradé, pas de texture générée, pas de glow. Les photos réelles (fournies plus tard) occupent ~40-50 % de la surface, le reste respire.
- **Filets** : **filet rouge** court (4px) comme séparateur éditorial, souvent annoté d'un tag mono.
- **Cartouches** : contour teal net (2px), **coins droits** (radius ~0). Puces mono à radius 3px max. Aucune ombre portée dans le système à plat (les ombres appartiennent aux photos réelles, façon studio Longbow).
- **Coins / rayons** : `--radius-none: 0` par défaut, `--radius-sm: 3px`, pilule `999px` réservée à de rares capsules.
- **Animation** : néant (média statique imprimé/social). Sur les cartes de démo, un simple survol (outline rouge) sans transition élaborée.
- **États** : liens/cibles → couleur plus foncée (`--red-deep`, `--teal-deep`), pas d'effet lumineux.
- **Transparence / flou** : uniquement les lignes de grille (blanc 14-16 % sur teal). Pas de blur.
- **Vibe imagerie** : nette, contrastée, lumière naturelle/studio, sans lissage « plastique IA ».

---

## ICONOGRAPHY
- **Fleur de lys** : motif scout universel rendu **à plat via le glyphe Unicode ⚜** (U+269C) — jamais un logo dessiné. Colorable en teal / rouge / encre. Composant `Fleur`.
- **Icônes réseaux sociaux** : Facebook, Instagram, YouTube, TikTok, servies par le **CDN Simple Icons** (`https://cdn.simpleicons.org/<slug>/<hex>`) — marques officielles des plateformes, en blanc sur le cadre teal. Voir `SocialRail`.
- **Logo officiel du groupe** : `assets/logos/groupe-scout-tonnerre.jpeg`.
- **Bibliothèque de logos** (`assets/logos/`, originaux fournis) : `world-scouting-wordmark`, `wosm-emblem-purple`, `wosm-patch`, `wosm-dove-emblem` (+ `-round`), `africa-scout-region`, `africa-united-camp`, `safe-from-harm` (+ `-horizontal`), `digitalise-youth`, `digital-democracy-initiative`. Voir la carte « Logos officiels ».
- **Badges partenaires (bandeau)** : `assets/partner-badges.png` — bandeau de 6 emblèmes extrait de l'affiche 01, utilisé par `PartnerRow`. Raster basse résolution ; recomposable à partir des logos originaux si besoin.
- **Emblème événement** : `assets/camp-unite-badge.png` — emblème du « Camp de l'Unité Africaine » extrait de l'affiche 05 (original proche : `assets/logos/africa-united-camp.jpeg`).
- **Objectifs de Développement Durable (ODD/SDG)** : l'affiche 06 utilise les **pictos officiels de l'ONU** (roue des 17 ODD, ODD 13). Ce sont des assets externes officiels **non inclus** ici — à fournir en original si besoin.
- **Aucun emoji, aucune icône dessinée à la main.**

---

## Index des fichiers

**Fondations (root)**
- `styles.css` — point d'entrée global (uniquement des `@import`).
- `tokens/fonts.css` · `colors.css` · `typography.css` · `spacing.css` — tokens CSS.
- `thumbnail.html` — vignette du système.
- `assets/` — `partner-badges.png`, `camp-unite-badge.png`, et `logos/` (logo officiel du groupe + emblèmes partenaires originaux).

**Composants** (`components/`, lus via `window.GroupeScoutTonnerreDesignSystem_ad7474`)
- `layout/` — **PosterFrame** (cadre carré + panneau + slots), **GridOverlay** (grille hairline + réticules), **Divider** (filet rouge + tag), **DataTag** (marqueur mono `.01 / LABEL`).
- `brand/` — **HeaderBand** (bandeau association + groupe, variante collaboration), **SocialRail** (rail réseaux), **PartnerRow** (badges + emblème), **Fleur** (motif ⚜).
- `content/` — **TitleBlock** (sur-titre + gros titre + sous-titre), **BodyText** (paragraphe serif + note), **SpecSheet** (fiche infos pratiques mono : stack / inline / cards), **Countdown** (compte à rebours), **GreetingBlock** (variante vœux).

**UI Kit** (`ui_kits/posters/`)
- `journee-bonne-action.html` — affiche annonce d'événement *(livrable #1)*.
- `camp-unite-africaine.html` — affiche compte à rebours J-10 *(livrable #2)*.
- `bonne-chance-examens.html` — variante vœux.
- `index.html` — galerie des affiches.

**Guidelines** (`guidelines/`) — cartes-spécimens : couleurs, type, espacement, grille, emblèmes.

---

## Additions intentionnelles
Aucune source ne définissait un inventaire formel de composants ; le système a été dérivé des 8 blocs demandés dans le brief + fondations minimales (PosterFrame, GridOverlay, Divider, DataTag, Fleur) nécessaires pour composer des affiches sur grille.

## Substitutions à valider
- **Geist Mono → IBM Plex Mono** (Google Fonts). Fournir les `.woff2` Geist pour un rendu identique au site Longbow.
- **Police script** des vœux (« Bonne fête de » manuscrit sur l'affiche Tabaski) → remplacée par **EB Garamond italique**, plus éditoriale. Volontaire.
- Fontes chargées depuis le **CDN Google Fonts** (pas de `.woff2` locaux).
- Logos fournis en **JPEG non détouré** (fond blanc/plein) — fournir des **PNG/SVG transparents** pour poser un logo directement sur le cadre teal sans halo blanc.
