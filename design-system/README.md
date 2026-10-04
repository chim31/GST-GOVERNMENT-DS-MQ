# GST GOVERNMENT — Design system web

Extension web du design system d'affiches **Groupe Scout Tonnerre** pour GST Government, la plateforme de commandement du groupe : tokens, motion, composants, écrans haute fidélité et deux expériences 3D.

Concept : **« Tonnerre · le papier technique qui prend vie »**. Au repos, tout ressemble à une planche technique (grille hairline, réticules, tags mono). Dès qu'on agit, le plan se trace, se calcule, s'élève en relief.

## Ouvrir

Aucune étape de build. Ouvrir `index.html` dans un navigateur récent (Chrome, Edge, Firefox, Safari 17+).
Les pages fonctionnent en `file://`. Un petit serveur local donne cependant le comportement le plus proche de la production :

```bash
cd design-system
python3 -m http.server 8080   # puis http://localhost:8080
```

Les polices (Google Fonts) et Three.js r170 (jsDelivr, chargé uniquement sur les pages 3D) viennent d'un CDN. Hors ligne, les pages 3D basculent automatiquement en version 2D.

## Les planches

| Page | Contenu |
|---|---|
| `index.html` | Ouverture : hero 3D « La Montagne du Tonnerre » (M10 long), note d'intention, chaîne de chiffrage interactive (M5) |
| `fondations.html` | Échelles, sémantique résolue dans les 3 modes avec contrastes WCAG mesurés, typographie fluide, grille, espacements, rayons, icônes, ciels |
| `motion.html` | 5 lois, tokens animés, 11 animations signature M1 → M11 jouables (prototypes M1, M4, M5, M6, M10) |
| `composants.html` | 52 composants en 7 familles : variantes, tailles, états (dont hors ligne), motion, a11y, code |
| `ecrans.html` | 6 écrans desktop 1440 + 9 écrans mobile 390, interactifs |
| `roadmap.html` | 3D-1 « Le Circuit du Camp » + frise 2D + agenda imprimable A4 |
| `bus.html` | 3D-2 « Le Bus du Tonnerre » : inscriptions en direct, paiements, décollage + plan 2D, formulaire, Mon inscription |
| `guide.html` | Quand utiliser quoi, à faire / à éviter, interdits, checklist de recette |

## Fichiers

```
tokens/gst-tokens.css       source de vérité des tokens (modes Jour / Nuit / Plein soleil)
tokens/gst-tokens.json      format W3C DTCG, généré : python3 tools/build-tokens-json.py
assets/css/gst.css          composants — n'utilise que des tokens sémantiques (0 hex)
assets/css/doc.css          mise en page de la documentation
assets/js/gst-motion.js     moteur M1 → M11 (Web Animations API, 0 dépendance)
assets/js/gst-components.js courbe prévu/réel (M9), barres jumelles
assets/js/gst-3d.js         kit 3D « diorama papier technique » (reçoit THREE)
assets/js/gst-icons.js      sprite Lucide (ISC), 69 icônes, rendu trait technique
assets/js/gst-data.js       données factices — Camp de Réjouissance 2026
assets/js/gst-shell.js      shell de la documentation (navigation, modes, transitions M7)
```

## Décisions à valider

1. **Contraste de l'éclair profond.** `#C79A00` donne 2,6:1 sur blanc : il est réservé aux aplats. Le texte d'avertissement utilise `--gst-eclair-700 #7A5B00`, soit 6,3:1.
2. **Texte d'état en Nuit.** `rouge-300` (3,8:1) et `teal-300` (4,4:1) restent des couleurs d'icône et de trait. Le texte passe par les tokens `*-text`.
3. **Badge RENFORCÉ.** Le prompt demande à la fois « badge Éclair pour B, F, G » et « un seul Éclair par écran ». Arbitrage : un badge encre, avec l'Éclair en simple marqueur de 6 px.
4. **Vue « Mon inscription » du bus.** Seul le siège de la personne y montre ses 4 états. Les autres sièges restent en 2 états, par dignité.
5. **Ligne de crête.** Le motif est une approximation de la montagne du logo. Il faudra le remplacer par la vectorisation officielle.
6. **Icônes.** Lucide (licence ISC) est redessiné par CSS : trait de 1,5, extrémités carrées.

## Production

Stack recommandée par le prompt : GSAP (ScrollTrigger, SplitText, DrawSVG) pour la vitrine, Motion pour l'UI React, Lenis pour la vitrine seulement, et React Three Fiber + drei pour la 3D, chargés à la demande. Le moteur vanilla de ce dossier implémente les mêmes tokens et les mêmes séquences, ce qui en fait la référence de comportement.

Paramètre de recette : `?noperf` désactive la bascule 2D automatique liée au FPS, pour tester la 3D sur une machine lente.
