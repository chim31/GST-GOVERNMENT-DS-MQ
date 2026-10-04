# PROMPT DE DESIGN — GST GOVERNMENT
### Plateforme de commandement du Groupe Scout Tonnerre · Direction artistique, design system web, motion & 3D

> **Mode d'emploi.** Copie tout ce qui se trouve sous la ligne « DÉBUT DU PROMPT » dans ton outil de design ou de génération (Claude Design, Claude Code, v0, Lovable, Figma Make…). Joins **impérativement** : le ZIP `Groupe_Scout_Tonnerre___Design_System.zip` et les trois documents `01-document-de-reference`, `02-roadmap`, `03-cahier-des-charges`. Le prompt est découpé en blocs numérotés : tu peux l'envoyer en entier, ou bloc par bloc (fondations → composants → écrans → 3D) pour garder le contrôle à chaque étape.

---

## ▌DÉBUT DU PROMPT

---

## .00 / RÔLE

Tu es **directeur artistique et lead designer d'un studio de product design primé**, spécialiste des interfaces éditoriales, du motion design et de la 3D temps réel sur le web (niveau Awwwards Site of the Day, Linear, Vercel, Teenage Engineering, Active Theory). Tu conçois **GST GOVERNMENT**, la plateforme numérique de commandement du **Groupe Scout Tonnerre** (District Golfe, Association Scoute du Togo, depuis 2013).

Ta mission : produire un **système de design web complet, cohérent et spectaculaire**, qui étend le design system d'affiches existant (fourni en pièce jointe) vers une application web, un site vitrine public et deux expériences 3D signature. Le résultat doit impressionner au premier regard **et** rester utilisable par un chef scout en plein soleil, sur un téléphone d'entrée de gamme, avec un réseau faible.

Lis entièrement le design system joint (`readme.md`, `tokens/`, `components/`, `guidelines/`, `ui_kits/posters/`) et les trois documents de projet **avant** de proposer quoi que ce soit.

---

## .01 / LE PROJET EN UNE PAGE

**GST Government** est une PWA unique, responsive, mobile d'abord, qui couvre la vie d'un camp de sa décision jusqu'à son bilan chiffré. Elle repose sur un **socle commun** et **cinq modules** :

| N° | Module | Rôle | Registre visuel |
|---|---|---|---|
| .01 | **Logistique** | 10 groupes de gestion (A Matériel · B Alimentaire · C Technique · D Santé · E Salubrité · F Économique · G Transport · H Retours · I Activités · J Social). Recensement, coût, stock disponible, seuils critiques. | Terrain |
| .02 | **Comptabilité** | Calculatrice vivante. Version A « test supervisé » (prévisionnel) et Version B « live supervisé » (réel) côte à côte, courbes cliquables, comptes du jour, écart prévu/réel. | Terrain |
| .03 | **Cuisine & menus** | Catalogue de plats, choix des jeunes, taux de proposition / sélection, liste de courses chiffrée, suggestion live sur le terrain. | Terrain |
| .04 | **Roadmap 3D** | Circuit 3D du camp, un véhicule qui avance d'une étape par journée, agenda, version 2D dégradée. | Ciel |
| .05 | **Vitrine & Bus volant** | Site public du GST, inscription en ligne, **bus 3D suspendu dans le ciel** dont chaque siège est une inscription. | Ciel |
| — | **Socle** | Camps, personnes, rôles, unités, base de prix, historique, hook intelligent des prix, notifications, journal. | Terrain |

**Neuf rôles** voient des interfaces différentes : chef de groupe, commissaire logistique, responsable de groupe, trésorier, responsable cuisine, chef d'unité, scout/jeune, parent/tuteur, public.

**Idée centrale à rendre visible dans tout le design : la chaîne de chiffrage.**
Cuisine → Alimentaire → Économique → Comptabilité → Bilan → Base de références. *Tout part d'un camp. Le calcul est continu. La mémoire du groupe est une donnée.*

---

## .02 / CONCEPT CRÉATIF — « TONNERRE · LE PAPIER TECHNIQUE QUI PREND VIE »

Le design system d'affiches est **plat, éditorial, sur grille hairline** (inspiration Longbow Motors : grille technique, réticules, marqueurs mono `.01 / SPEC`). Tu ne trahis pas cette identité : **tu l'animes**.

Le concept : **GST Government est un plan d'ingénieur scout qui s'éveille.** Au repos, tout ressemble à une planche technique impeccable — lignes fines, réticules, fiches mono, grands titres condensés. Dès que l'utilisateur agit, le plan **se trace, se calcule, s'élève en relief**. Le nom du groupe donne la ponctuation : le **Tonnerre** — une énergie rare, nette, décisive, jamais décorative.

Trois métaphores pilotent chaque décision :

1. **La planche** — grille hairline, réticules, data tags. C'est la structure. *Tout est aligné, tout est mesuré.*
2. **Le trait** — les lignes se dessinent avant que le contenu n'apparaisse. *Le plan précède l'action.*
3. **L'éclair** — un signal jaune-électrique, bref, réservé aux moments décisifs (seuil critique, décollage du bus, validation d'un budget). *Rare donc puissant.*

### Deux registres, une seule identité

| | **Registre TERRAIN** (app interne) | **Registre CIEL** (vitrine publique + 3D) |
|---|---|---|
| Usage | Saisir, vérifier, décider, vite | Émerveiller, fédérer, rendre visible |
| Densité | Haute, lisible au soleil | Aérée, cinématique, beaucoup d'espace négatif |
| Fond dominant | Blanc / écru, panneaux teal ponctuels | Teal profond, ciel en aplats étagés, nuit de camp |
| Motion | Fonctionnelle : 80–240 ms, jamais bloquante | Narrative : 400–1600 ms, scrollytelling, 3D |
| 3D | Absente (sauf aperçus) | Roadmap, Bus volant, hero montagne |

Les deux registres partagent **exactement** les mêmes tokens, polices, grille et data tags. On doit reconnaître la même main sur une table de dépenses et sur le bus qui décolle.

---

## .03 / HÉRITAGE NON NÉGOCIABLE (repris du design system fourni)

- **Polices — trio** : `Bebas Neue` (titres capitales condensés, chiffres géants) · `EB Garamond` (titres éditoriaux en italique, texte courant) · `IBM Plex Mono` (toutes les données : montants, dates, quantités, labels, tags).
- **Couleurs de marque** : teal `#0C7873`, teal profond `#06605E`, teal encre `#063F3E`, rouge `#C42621`, rouge profond `#9E1C18`, écru `#F4F4F2`, blanc `#FFFFFF`, encre `#141414`, graphites `#4A4A4A` / `#8A8A8A`.
- **Grille hairline 1 px** + **réticules carrés 7 px** aux nœuds + **marqueurs mono** `.01 / LABEL` en bord de bloc.
- **Filet rouge 4 px** comme séparateur éditorial, annoté d'un tag mono.
- **Cartouches** à coins droits (radius 0), contour teal 2 px ; puces mono radius 3 px max.
- **Fleur de lys** uniquement via le glyphe `⚜` (U+269C), à plat. **Aucun emoji.** Aucune icône dessinée à la main hors d'un set cohérent.
- **Logos officiels** : ceux de `assets/logos/`, jamais redessinés, jamais déformés.
- **Ton** : français, institutionnel et chaleureux, émetteur collectif « nous ». Capitales espacées pour les bandeaux, Bebas pour les titres, bas-de-casse discret pour les mentions. Infos pratiques en format **fiche technique** (label court + valeur). Monnaie : **F CFA**, écrite `25 000 F CFA` (espace fine insécable).

### Ce que le passage au web ajoute (extensions assumées — à documenter comme telles)

Le DS d'affiches interdit l'animation, la 3D et les dégradés **parce qu'il vise un média imprimé statique**. Pour le web, tu ouvres ces portes **de façon contrôlée** :

- **Animation** : autorisée et centrale, selon le système de motion du bloc .05.
- **3D** : autorisée dans le registre Ciel, avec un rendu **plat stylisé** (toon shading par bandes, arêtes en hairline) — jamais réaliste, jamais « plastique IA ».
- **Dégradés** : toujours interdits dans l'interface. Dans les scènes 3D, le ciel est construit en **aplats étagés** (bandes de couleur nettes) — c'est la traduction du « zéro dégradé » en 3D.
- **Glow** : interdit, sauf **un seul** : la pulsation de l'Éclair sur une alerte critique, sous forme d'anneau net (pas de flou).
- **Couleur Éclair** : une 5ᵉ couleur **fonctionnelle**, jamais décorative (voir .04).

---

## .04 / TOKENS WEB (à produire en CSS custom properties + JSON)

Repars des fichiers `tokens/*.css` existants et **ajoute** les tokens ci-dessous. Nomme tout en kebab-case, préfixe `--gst-`.

### Couleurs — échelles

```
Teal      50 #E7F2F1 · 100 #C6E2E0 · 200 #93C8C4 · 300 #5FAAA5 · 400 #2E8F89
          500 #0C7873 (marque) · 600 #06605E · 700 #064C4B · 800 #063F3E · 900 #032726
Rouge     50 #FBEAE9 · 100 #F5C9C7 · 300 #E0716D · 500 #C42621 (marque) · 700 #9E1C18 · 900 #5E0F0D
Écru      #F4F4F2 · papier #FAFAF8 · pierre #E4E4E1 · sable #C9C9C6
Encre     #141414 · 70 #4A4A4A · 40 #8A8A8A
Éclair    #FFD23F (signal) · #C79A00 (éclair profond, texte sur fond clair)
Forêt     #1F6F4A (succès, validé, payé)
```

### Couleurs — sémantique (obligatoire, jamais de hex brut dans un composant)

| Rôle | Valeur claire | Valeur nuit |
|---|---|---|
| `bg-canvas` | écru `#F4F4F2` | teal-900 `#032726` |
| `bg-panel` | blanc | teal-800 `#063F3E` |
| `bg-invert` | teal-500 | écru |
| `text-primary` | encre | écru |
| `text-secondary` | encre-70 | teal-100 |
| `line-hairline` | pierre `#E4E4E1` | blanc 14 % |
| `node-reticle` | sable `#C9C9C6` | blanc 34 % |
| `accent` | rouge-500 | rouge-300 |
| `state-success` / payé / validé | forêt | teal-300 |
| `state-warning` / à vérifier | éclair profond | éclair |
| `state-danger` / seuil critique | rouge-500 | rouge-300 |
| `state-info` / suggestion du hook | teal-500 | teal-200 |
| `data-planned` (prévu) | teal-500, trait pointillé | teal-200 |
| `data-actual` (réel) | rouge-500, trait plein | rouge-300 |

**Règle Éclair** : jamais en aplat de grande surface, jamais pour décorer. Uniquement : alerte de seuil critique, badge « groupe renforcé » (repris des documents), décollage du bus, validation définitive d'un budget. Maximum **un** élément Éclair visible par écran.

### Modes d'affichage

- **Jour** (défaut, terrain).
- **Nuit de camp** (dark mode) : fond teal-900, étoiles = réticules écru. Pensé pour la lampe frontale, pas pour le style.
- **Plein soleil** : contraste renforcé (texte encre pur, hairlines doublées à 2 px, tags en 600), bascule manuelle en un tap depuis la barre supérieure. Cible : **WCAG AAA** sur tous les textes de données.

### Typographie web (rem, base 16 px, échelle fluide `clamp()`)

| Token | Police | Mobile → Desktop | Usage |
|---|---|---|---|
| `display-hero` | Bebas | 72 → 220 px | Hero vitrine, compte à rebours |
| `display-xl` | Bebas | 48 → 120 px | Titre de page vitrine |
| `display-lg` | Bebas | 36 → 72 px | Titre de module |
| `display-md` | Bebas | 28 → 48 px | Chiffres clés, KPI |
| `serif-xl` | Garamond italique | 32 → 56 px | Titre éditorial |
| `serif-lg` | Garamond italique | 22 → 32 px | Sous-titre, citation |
| `body` | Garamond | 17 → 19 px · lh 1.5 | Texte courant |
| `ui` | Plex Mono 500 | 14 → 15 px | Boutons, onglets, navigation |
| `data` | Plex Mono 400 | 15 → 16 px · chiffres tabulaires | Montants, quantités, tableaux |
| `label` | Plex Mono 500 caps | 11 → 12 px · ls 0.16em | Labels de champ |
| `tag` | Plex Mono caps | 10 → 11 px · ls 0.18em | `.01 / LABEL` |

Tous les chiffres en `font-variant-numeric: tabular-nums`. Les montants s'alignent à droite, toujours.

### Espacement, grille, rayons, élévation

- Espacement base 4 : `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`.
- Grille : 4 colonnes mobile (gouttière 16), 8 tablette (24), 12 desktop (24), marges 20 / 40 / 80 px. La grille hairline peut être **rendue visible** en filigrane sur les écrans éditoriaux.
- Rayons : `0` partout ; `3 px` puces et badges ; `999 px` uniquement pour l'indicateur de synchronisation et les avatars.
- Élévation : **pas d'ombre portée dans l'interface**. La hiérarchie passe par hairlines, contours 2 px et aplats. Une seule ombre est tolérée : `lift` pour les panneaux flottant au-dessus d'une scène 3D (`0 24px 48px -24px rgba(3,39,38,.45)`).
- Zones tactiles : **44 × 44 px minimum**, 56 px pour les actions principales de terrain.

### Motion (tokens)

```
--gst-dur-instant  80ms    retour tactile
--gst-dur-fast     160ms   survol, toggle, focus
--gst-dur-base     240ms   ouverture de panneau, changement d'onglet
--gst-dur-slow     420ms   transition de page, révélation de section
--gst-dur-scene    800ms   déplacement de caméra 3D, arrivée sur étape
--gst-dur-epic     1600ms  décollage du bus, ouverture de camp, intro vitrine

--gst-ease-tonnerre  cubic-bezier(0.16, 1, 0.3, 1)     sortie expo — signature, 80 % des cas
--gst-ease-trace     cubic-bezier(0.65, 0, 0.35, 1)    tracé de lignes, caméra
--gst-ease-snap      cubic-bezier(0.2, 0, 0, 1)        UI terrain, nette, sans rebond
--gst-ease-strike    cubic-bezier(0.7, 0, 0.84, 0)     entrée de l'éclair (accélère)
--gst-spring-seat    { stiffness: 420, damping: 28, mass: 0.8 }   sièges, pins, badges

--gst-stagger-tight  24ms   lettres, cellules
--gst-stagger-base   56ms   lignes de tableau, cartes
--gst-stagger-loose  110ms  sections, stations du circuit
```

---

## .05 / SYSTÈME DE MOTION — « LE TRAIT, LE CALCUL, L'ÉCLAIR »

### Cinq lois

1. **Le trait d'abord.** Une structure se dessine (hairlines, cadres, axes) avant que son contenu n'apparaisse. Le contenu naît de la structure, jamais de nulle part.
2. **Tout part d'un nœud.** Chaque animation a une origine visible : un réticule, un tag, le bouton touché. Les ondes, les tracés et les ouvertures partent de ce point.
3. **Le chiffre se calcule.** Un nombre ne « remplace » jamais un autre : il **roule** (odomètre mono) de l'ancienne à la nouvelle valeur. C'est la traduction visuelle de « le calcul est continu ».
4. **L'éclair est rare.** Une seule animation Éclair par écran, réservée aux moments décisifs.
5. **La beauté ne bloque jamais.** Aucune animation ne retarde une saisie de terrain. Toute animation d'interface est interruptible. `prefers-reduced-motion` → fondus 120 ms uniquement, 3D figée sur son état final.

### Catalogue des animations signature (à spécifier et prototyper chacune)

| # | Nom | Description | Où |
|---|---|---|---|
| M1 | **Tracé de grille** | Les hairlines se dessinent depuis les réticules (`stroke-dashoffset`, `ease-trace`, 600 ms), les réticules apparaissent en pop d'échelle 0 → 1 (spring), puis le contenu se révèle. | Chargement d'écran, sections vitrine |
| M2 | **Décodage de tag** | Les data tags `.01 / LABEL` se déchiffrent caractère par caractère (brouillage mono → texte final, 24 ms/caractère). | Tous les en-têtes de bloc |
| M3 | **Levée Bebas** | Les titres montent d'un masque de découpe, lettre par lettre (`stagger-tight`, `ease-tonnerre`), légère compression verticale 0.92 → 1. | Titres de module, hero |
| M4 | **Odomètre** | Les chiffres roulent verticalement, colonne par colonne, unités en dernier. Couleur flash 160 ms : forêt si favorable, rouge si dépassement. | KPI, budgets, compteur de places |
| M5 | **Onde de recalcul** | Quand une donnée change (un inscrit de plus, un prix qui monte), une onde hairline part du champ modifié et **traverse la chaîne de chiffrage** : chaque chiffre dépendant pulse puis roule (M4) dans l'ordre Cuisine → Alimentaire → Économique → Comptabilité. *C'est l'animation qui raconte le produit.* | Logistique, Compta, Cuisine |
| M6 | **Frappe de l'Éclair** | Seuil critique franchi : un tracé en zigzag Éclair traverse la carte en 180 ms (`ease-strike`), le contour passe au rouge 2 px, un anneau net pulse 2 fois autour du réticule d'origine, puis tout se stabilise. Vibration haptique courte sur mobile. | Alertes seuil critique |
| M7 | **Volet de cadre** | Transition de page : le cadre teal des affiches se referme depuis les bords (34 px → plein écran → 34 px) et révèle la nouvelle page. 420 ms. | Navigation entre modules |
| M8 | **Tampon de validation** | Validation d'un budget / clôture des comptes du jour : un tampon mono « VALIDÉ · 03.10.26 · ⚜ » s'imprime en rotation −4°, avec un très léger écrasement d'échelle. | Compta, Logistique |
| M9 | **Courbe tracée** | Les courbes de dépenses se dessinent de gauche à droite ; le prévu en pointillé teal, le réel en plein rouge qui « rattrape » le prévu. Le point survolé devient un réticule qui s'agrandit et ouvre le détail des mouvements. | Comptabilité |
| M10 | **Crête du Tonnerre** | Loader et intro : la ligne de crête de la montagne du logo GST se dessine en un trait continu, un éclair la frappe, le mot TONNERRE se lève en Bebas. Version courte (900 ms) pour l'app, longue (2,4 s) pour l'intro vitrine. | Chargement, splash PWA |
| M11 | **Synchronisation** | Indicateur hors ligne : pastille pilule qui « respire » en teal quand des données attendent ; à la synchronisation, les lignes en file défilent vers le haut et se cochent une à une. | Barre supérieure terrain |

**Micro-interactions** (toutes en `ease-snap`, 80–160 ms) : bouton = translation 1 px + contour qui se ferme ; case = coche tracée ; onglet = filet rouge qui glisse sous l'onglet actif ; ligne de tableau = réticule qui apparaît à gauche au survol ; toast = entre depuis le bas avec son tag décodé (M2).

**Stack recommandée** : GSAP (+ ScrollTrigger, SplitText, DrawSVG) pour la vitrine et les séquences ; Motion (Framer Motion) pour l'UI React de l'app ; Lenis pour le défilement doux **uniquement** sur la vitrine ; Three.js via React Three Fiber + drei pour la 3D, chargés **à la demande** sur les deux seules pages concernées.

---

## .06 / LES EXPÉRIENCES 3D

### Langage 3D commun — « Diorama papier technique »

- **Low-poly stylisé**, faces planes, **toon shading à 3 bandes** (lumière / ombre propre / ombre portée), aucune texture photo, aucune réflexion.
- **Arêtes en hairline** (contour post-process ou géométrie d'arêtes) dans la couleur `line-hairline` du mode courant : la 3D ressemble à un plan d'ingénieur extrudé.
- **Palette stricte** : uniquement les tokens de .04. Le teal porte le terrain et les véhicules, l'écru les surfaces claires, le rouge les accents et l'étape en cours, l'Éclair les moments décisifs.
- **Ciel en aplats étagés** (4 bandes nettes) selon l'heure réelle du camp :
  - Jour : `#F4F4F2` / `#E7F2F1` / `#C6E2E0` / `#93C8C4`
  - Aube & crépuscule : `#F4F4F2` / `#FFF1C2` / `#F5C9C7` / `#E0716D`
  - Nuit de camp : `#032726` / `#063F3E` / `#064C4B` / `#06605E`, étoiles = petits réticules carrés écru.
- **Socle** : chaque scène repose sur un plateau carré à bords nets, entouré d'un cadre teal — clin d'œil direct au cadre des affiches. Des data tags mono flottent en HTML au-dessus des points d'intérêt (`J.04 / SORTIE`, `SIÈGE 23`).
- **Performance** : GLB compressé Draco/Meshopt < 1,5 Mo par scène, < 80 000 triangles, instancing pour les répétitions (arbres, sièges, nuages), 1 seule lumière directionnelle + ambiante, DPR plafonné à 1,5, ombres pré-calculées quand c'est possible. **Chargement < 5 s sur téléphone d'entrée de gamme** (critère M4.2 du cahier des charges).
- **Bascule 2D automatique** (détection GPU / mémoire / FPS < 30 pendant 2 s) + bascule manuelle. La 2D reprend **100 % de l'information** et le même vocabulaire de motion.

### 3D-1 · ROADMAP — « Le Circuit du Camp » (module .04)

**Scène.** Un diorama topographique en courbes de niveau superposées (comme des feuilles de carte découpées), traversé par une **voie ferrée** qui serpente du départ au retour. Une **station par journée** : petit quai, mât, drapeau, totem numéroté en Bebas (`J.01` … `J.14`). Éléments de camp en low-poly : tentes, feu, mât des couleurs, arbres instanciés, rivière en aplats.

**Véhicule.** Un **train scout** : locomotive teal avec filet rouge et ⚜ à plat sur le flanc, un wagon par unité (couleur de foulard si définie). Alternative paramétrable : bus.

**États des étapes.**
- *Passée* : station pleine, teal, drapeau abaissé, petite vignette photo qui flotte au survol (le compte-rendu du jour).
- *En cours* : station rouge, balise réticule pulsante, train à quai, drapeau hissé.
- *À venir* : station en **fil de fer hairline** (géométrie fantôme), qui se « matérialise » face par face à l'approche du train.

**Animations.**
- *Intro* (1,6 s) : la caméra descend du ciel en plongée, les courbes de niveau s'empilent une à une (M1 en 3D), la voie se trace, les stations surgissent en `stagger-loose`, le train glisse jusqu'à la journée en cours.
- *Arrivée sur une nouvelle étape* (exigée par M4.2) : le train décélère (`ease-tonnerre`), la station passe de fil de fer à pleine, le drapeau se hisse — **la levée des couleurs** — et le tag `J.05 / AUJOURD'HUI` se décode.
- *Clic sur une station* : travelling caméra (`dur-scene`, `ease-trace`) qui cadre la station, le reste de la scène se désature vers l'écru, un **panneau fiche technique** glisse depuis la droite (desktop) ou monte en tiroir (mobile) : horaires, lieu, responsable, unités, matériel (issu du groupe I), menu du jour (issu de la Cuisine), photos.
- *Cycle jour/nuit* lié à l'heure réelle : bascule des bandes du ciel en 800 ms, fenêtres des tentes allumées la nuit.

**Interaction.** Orbite contrainte (rotation ±35°, zoom borné), angle par défaut ~30° isométrique, double-tap pour recentrer sur aujourd'hui. Navigation clavier entre stations (←/→), chaque station focusable avec libellé accessible.

**Version 2D dégradée.** Frise horizontale SVG défilable : même voie, mêmes stations, même train qui glisse, mêmes trois états, même panneau au clic, même levée de drapeau. Imprimable A4 en agenda lisible sans couleur (critère M4.4).

### 3D-2 · BUS VOLANT — « Le Bus du Tonnerre » (module .05)

**Scène.** Un **bus scout** stylisé (carrosserie teal, bande rouge, toit écru, ⚜ et « GST » sur le flanc) **suspendu sous une montgolfière / des hélices**, qui navigue lentement au-dessus d'une **carte stylisée** en plaques plates (régions de Togo et Bénin découpées, le lieu du camp marqué d'un réticule rouge). Nuages = disques plats empilés, instanciés, qui défilent en parallaxe. Le cadre de la scène est un « ciel défini » : une fenêtre carrée bordée du cadre teal.

**Sièges.** Le toit est en **vue écorchée** (coupe nette, arêtes hairline) : on voit les rangées de sièges vues de dessus. Chaque siège = une place du camp, numérotée en mono.

**États visuels.**
- *Vue publique* (protection des familles, exigence du document de référence) : **deux** états seulement — **libre** (contour hairline vide) et **occupé** (siège teal plein, prénom + initiale du nom). Aucun statut de paiement exposé.
- *Vue personnelle* (« Mon inscription ») et *vue responsables* : les **quatre** états — libre / réservé (écru, nom estompé) / partiellement payé (siège rempli à moitié, jauge verticale teal) / garanti (teal plein, nom affiché, petit ⚜).

**Animations.**
- *Ralenti permanent* : balancement doux (± 2°, 6 s), hélices qui tournent, nuages qui passent.
- *Nouvelle inscription en direct* : un **pin** tombe du ciel sur le siège (spring `seat`), le siège se remplit de bas en haut, le nom s'écrit en mono (M2), le compteur `PLACES RESTANTES` roule (M4).
- *Paiement enregistré* (dans la minute, exigence M5.3) : le siège passe à l'état suivant avec une onde hairline.
- *Décollage* — **le moment Éclair de la plateforme** : quand l'effectif est atteint, compte à rebours Bebas géant `3 · 2 · 1`, éclair qui frappe le mât, hélices à pleine vitesse, le bus prend de l'altitude en traversant les bandes du ciel, la caméra le suit puis le laisse partir, et un tampon `BUS COMPLET · DÉCOLLAGE CONFIRMÉ` s'imprime (M8). Durée : 3 à 4 s, puis retour à un état calme.

**Interaction.** Glisser pour tourner autour du bus, survol / tap d'un siège = info-bulle mono, bouton principal permanent « RÉSERVER MA PLACE » (rouge, 56 px). Compteur de places et date du camp en fiche technique dans un coin du cadre.

**Version 2D dégradée.** Plan de sièges vu de dessus, en SVG, mêmes états, même pin, même compteur, décollage rendu par une animation de translation verticale + tampon.

### 3D-3 · HERO VITRINE — « La Montagne du Tonnerre » (optionnel, recommandé)

La ligne de crête du logo GST extrudée en relief low-poly, en courbes de niveau. À l'arrivée sur le site : M10 en version longue — la crête se trace, la montagne s'élève couche par couche, un éclair frappe le sommet, « GROUPE SCOUT TONNERRE » se lève en Bebas, `DISTRICT GOLFE · DEPUIS 2013` se décode en mono. Au défilement, la caméra tourne lentement autour du sommet et révèle les sections. Version statique (image) si 3D indisponible.

---

## .07 / ARCHITECTURE DES ÉCRANS

### Shell de l'application (registre Terrain)

- **Barre supérieure** : sélecteur de camp (nom + type + compte à rebours `J-21` en Bebas), indicateur de synchronisation (M11), bascule Plein soleil / Nuit, avatar avec rôle.
- **Navigation modules** : rail vertical à gauche sur desktop (`.01 LOGISTIQUE` … `.05 VITRINE`, tags mono, filet rouge sur le module actif) ; barre d'onglets en bas sur mobile (5 entrées max, icône + tag).
- **Fil d'Ariane technique** : `CAMP RÉJOUISSANCE 2026 / .01 LOGISTIQUE / B · ALIMENTAIRE`.
- **Ouverture de camp** : assistant plein écran en étapes numérotées (`.01 / IDENTITÉ` → `.06 / MODULES`), aperçu en direct des groupes logistiques qui s'ouvrent selon le type de camp (cartes qui se tracent M1).

### Écrans haute fidélité à livrer (mobile 390 px **et** desktop 1440 px)

**Socle**
1. Splash / connexion (M10).
2. Tableau de bord — Chef de groupe (KPI odomètres, alertes, jalons du rétroplanning J-60 → J+10 sur une frise hairline).
3. Tableau de bord — Scout / jeune (mes repas à choisir, ma roadmap, mon inscription).
4. Assistant d'ouverture de camp.
5. Base de prix (table dense, suggestions du hook en état `info`, badges « périmé > 6 mois »).

**Module .01 Logistique**
6. Vue d'ensemble des 10 groupes : grille de cartes A → J, badge Éclair « RENFORCÉ » pour B, F, G, jauge besoin / disponible / manquant par groupe.
7. Recensement d'un groupe : table article · quantité · unité · coût unitaire · disponible · manquant · seuil, ajout « terrain » en ligne.
8. Groupe Économique : consolidation des 9 autres groupes, simulation d'effectif 60 / 80 / 100 côte à côte, onde de recalcul (M5).
9. Alerte de seuil critique (M6) et écran de blocage de départ.
10. Inventaire de retour (logistique inversée) : intact / usé / endommagé / perdu.

**Module .02 Comptabilité**
11. Vue double A « Test supervisé » | B « Live supervisé », écart en grand odomètre.
12. Courbes prévu / réel avec point cliquable ouvrant les mouvements (M9).
13. Saisie de dépense terrain : 4 champs max par écran, photo du reçu, rattachement poste + activité obligatoire, double validation au-delà du seuil.
14. Comptes du jour : arrêt de journée, rapprochement de caisse, tampon VALIDÉ (M8).

**Module .03 Cuisine**
15. Espace jeune : choix des plats par service (cartes plat avec ingrédients, vote en un tap, proposition d'un nouveau plat).
16. Espace intendance : taux de proposition vs taux de sélection (graphique en barres jumelles), arbitrage du menu, liste de courses chiffrée générée.
17. Suggestion live terrain : stock restant saisi, plats réalisables, vote du lendemain.

**Module .04 Roadmap** — 18. Scène 3D · 19. Panneau journée · 20. Frise 2D · 21. Agenda liste/semaine + version imprimable A4.

**Module .05 Vitrine** — 22. Accueil avec hero Montagne · 23. Histoire & valeurs · 24. Unités et tranches d'âge · 25. Galerie par camp · 26. Bilans de retour publiés · 27. Bus volant · 28. Formulaire d'inscription · 29. « Mon inscription » (statut, payé, reste dû).

### Visualisation de données

Axes en hairline, graduations en tags mono, aucune grille pleine. Prévu = teal pointillé, réel = rouge plein. Points = réticules carrés 7 px. Info-bulle = mini fiche technique. Barres à coins droits. Jamais de camembert 3D, jamais de dégradé.

---

## .08 / BIBLIOTHÈQUE DE COMPOSANTS

Pour **chaque** composant : variantes, tailles (sm / md / lg), états (repos, survol, focus, actif, désactivé, chargement, erreur, hors ligne), comportement motion, accessibilité (rôle ARIA, clavier, libellé), et **un exemple d'usage**. Réutilise et étends les composants existants du DS (`PosterFrame`, `GridOverlay`, `Divider`, `DataTag`, `SpecSheet`, `Countdown`, `TitleBlock`, `Fleur`, `HeaderBand`, `PartnerRow`, `SocialRail`).

- **Fondations** : `Frame`, `GridOverlay` (animable M1), `Reticle`, `DataTag` (animable M2), `Divider`, `Fleur`.
- **Actions** : `Button` (primaire rouge, secondaire contour teal, fantôme, danger, Éclair réservé), `IconButton`, `SegmentedControl`, `Toggle`.
- **Saisie** : `Field` (label mono caps au-dessus, valeur mono, unité en suffixe), `NumberStepper` (gros boutons terrain), `MoneyInput` (F CFA), `Select`, `Search`, `PhotoCapture` (reçu), `Checkbox`, `Radio`.
- **Données** : `StatOdometer` (M4), `BudgetGauge` (enveloppe / consommé / reste), `NeedBar` (besoin · disponible · manquant · seuil), `DataTable` (dense, en-têtes collants, alignement tabulaire), `SpecSheet` (stack / inline / cards), `Chart` (ligne, barres jumelles), `Timeline` (rétroplanning J-xx).
- **Métier** : `CampCard`, `CampTypeBadge`, `LogisticsGroupCard` (A → J, variante RENFORCÉ), `ExpenseRow`, `DishCard`, `RateBar` (proposition / sélection), `StationCard`, `SeatToken` (4 états), `RoleBadge`, `PriceSuggestion` (hook).
- **Retours** : `Alert` (info / succès / avertissement / critique M6), `Toast`, `Stamp` (M8), `SyncIndicator` (M11), `EmptyState` (illustré uniquement en typographie + ⚜, jamais vide de sens), `Skeleton` (hairlines qui se tracent, pas de shimmer).
- **Navigation** : `TopBar`, `ModuleRail`, `BottomTabs`, `Breadcrumb`, `Tabs` (filet rouge glissant), `Drawer`, `Modal`, `Stepper` (assistant).

---

## .09 / CONTRAINTES DE TERRAIN (exigences du cahier des charges)

- Mobile d'abord ; la majorité des usages se fait sur téléphone, souvent en plein soleil, parfois les mains sales.
- Écran chargé en **< 3 s sur réseau lent** ; poids initial **< 500 Ko hors 3D** ; 3D chargée uniquement sur Roadmap et Bus.
- **Hors ligne** : chaque écran de saisie terrain affiche clairement son état (synchronisé / en attente / conflit).
- Contraste élevé, cibles **44 px min**, peu de champs par écran, grands boutons.
- Données sensibles (santé, coordonnées de mineurs, statuts de paiement) **jamais** affichées dans un écran public.
- Interface en français ; monnaie F CFA ; multi-devises prévu pour les jamborees internationaux (taux saisi manuellement).
- Accessibilité : focus visible (contour rouge 2 px + réticule), navigation clavier complète, libellés ARIA sur toute la 3D, `prefers-reduced-motion` respecté partout.

---

## .10 / LIVRABLES ATTENDUS (dans cet ordre)

1. **Note d'intention** (1 page) : ta lecture du concept, les choix forts, les extensions par rapport au DS d'affiches.
2. **Tokens** : `tokens.css` (custom properties, modes Jour / Nuit / Plein soleil) + `tokens.json`.
3. **Planches de fondations** : couleurs, typographie, grille, espacements, iconographie, en reprenant le format des cartes `guidelines/` du DS.
4. **Spécification motion** : tableau des animations M1 → M11 avec durée, easing, déclencheur, version réduite — et **prototypes HTML animés** de M1, M4, M5, M6, M10.
5. **Bibliothèque de composants** documentée (bloc .08).
6. **Écrans haute fidélité** (bloc .07), mobile et desktop.
7. **Prototypes 3D** en React Three Fiber : Roadmap (3D-1) et Bus volant (3D-2), avec leur version 2D, données factices réalistes (camp de réjouissance 14 jours, 80 participants, 6 unités).
8. **Guide d'utilisation** : quand utiliser quoi, et les erreurs à éviter.

Données factices à utiliser : *Camp de Réjouissance 2026 · du 05 au 18 août 2026 · Attikoumé · 80 participants · budget prévisionnel 4 850 000 F CFA · inscription 25 000 F CFA*. Noms togolais et béninois réalistes. Handles : `@associationscoutedutogo`, `@groupesscouttonnerre`.

---

## .11 / CRITÈRES DE RÉUSSITE

- On reconnaît **immédiatement** l'identité des affiches GST sur n'importe quel écran.
- Aucun hex brut dans un composant : tout passe par les tokens sémantiques.
- Chaque écran fonctionne **sans animation** et reste beau.
- L'onde de recalcul (M5) fait comprendre la chaîne de chiffrage sans aucune explication écrite.
- Le décollage du bus donne envie de filmer l'écran.
- Un chef d'unité retrouve le programme de demain en **moins de 3 taps**, en plein soleil, en réseau faible.
- La version 2D ne fait perdre **aucune** information.

## .12 / INTERDITS

Dégradés dans l'interface · glow et flou décoratifs · ombres portées partout · glassmorphism · coins arrondis généreux · emoji · illustrations 3D réalistes ou générées par IA · icônes hétérogènes · plus d'un élément Éclair par écran · animation qui bloque une saisie · texte gris clair sur fond clair · carrousels automatiques · statut de paiement public · 3D chargée sur toute l'application · police hors du trio.

---

## ▌FIN DU PROMPT
