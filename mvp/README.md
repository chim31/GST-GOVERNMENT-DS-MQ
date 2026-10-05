# GST Government — MVP (maquette cliquable de bout en bout)

Maquette fonctionnelle de la plateforme, construite avec le design system v1.1 (`../design-system`).
Tout est cliquable, tout se recalcule : les données vivent dans le navigateur (`localStorage`)
et la démo se réinitialise depuis le menu du compte.

## Ouvrir

Ouvrir [`mvp/index.html`](index.html) dans un navigateur, ou :

```bash
python3 -m http.server 8080      # depuis la racine du dépôt → http://localhost:8080/mvp/
```

Sans compte, on arrive sur le **site public**. Le bouton « Espace membres » mène à la connexion,
où l'on entre en un clic avec l'un des **neuf rôles** de démonstration :

| Rôle | Personne | Ce qu'il voit |
|---|---|---|
| Chef de groupe | Codjo Agossou | Tout |
| Commissaire logistique | Komi Ayité | Module Logistique complet, inventaire, devis, documents |
| Responsable de groupe | Abla Dossou | Son groupe (B — Alimentaire) |
| Trésorière | Essi Amouzou | Module Comptabilité complet |
| Responsable cuisine | Ama Tossou | Module Cuisine (intendance) |
| Chef d'unité | Yao Kpodo | Son unité, programme, agenda |
| Responsable santé | Dr Enyonam Atayi | Groupe Santé, fiches sanitaires |
| Scout | Sélom Akakpo | Espace jeune : repas, vote, roadmap, inscription |
| Parent | Mawuena Akakpo | Espace famille : paiement, autorisation, bus |

Le menu du compte (avatar) permet de **changer de rôle à tout moment**, de basculer
Jour / Nuit / Plein soleil et de réinitialiser la démo. La pastille « Synchronisé » de l'en-tête
coupe et rétablit le réseau pour tester le **mode hors ligne**.

## Les camps de la démo

Date simulée : **lundi 10 août 2026**.

- **Camp de Réjouissance 2026** (Attikoumé, 05 → 18 août) — *en cours*, J.06. Dépenses live,
  comptes du jour, suggestion de repas, roadmap 3D avec le train.
- **Jamboree national — Kara 2026** (15 → 27 octobre) — *en préparation*, J-66. Recensements
  en cours, choix des repas ouverts, inscriptions publiques et bus volant (57 / 80).
- **Camp de survie — Agou 2026** (mars) — *clos*. Bilan de retour publié sur le site.

## Scénarios à dérouler

1. **La chaîne de chiffrage.** Site public → *S'inscrire au Jamboree* → valider. L'effectif passe
   de 80 à 81 ; l'eau potable, les vivres et le budget consolidé se recalculent ; un siège unique
   s'allume dans le bus volant (2D et 3D).
2. **Le menu devient des vivres.** Rôle *Responsable cuisine*, camp Kara → *Choix & arrêt du menu* →
   *Composer selon les taux* → *Arrêter & transmettre*. Le groupe Alimentaire se remplit seul, puis
   le groupe Économique et le budget.
3. **Une dépense en moins d'une minute.** Rôle *Trésorière* → *Saisir* : montant, poste, activité,
   photo du reçu. Sans activité, l'enregistrement est refusé. L'enveloppe du poste diminue tout de suite.
4. **Hors ligne.** Coupez le réseau (pastille de l'en-tête), saisissez une dépense, rétablissez :
   la file se synchronise.
5. **L'arrêt de journée.** *Comptes du jour* → *Arrêter la journée* (tampon). Corriger ensuite une
   dépense de ce jour laisse une trace visible et une entrée au journal.
6. **Le cloisonnement.** Rôle *Responsable de groupe*, puis ouvrez `#/app/depenses` : accès refusé.
   La fiche sanitaire n'est visible que par le chef de groupe et la responsable santé.
7. **Le paiement et le siège.** *Entrées & paiements* → *Encaisser* : le siège passe de réservé à
   garanti, un reçu est généré. Le public ne voit jamais le statut de paiement.
8. **Le hook des prix.** Une suggestion aberrante (huile rouge à 12 500 F) est signalée et n'a aucun
   effet sur le budget tant qu'elle n'est pas validée.
9. **La roadmap.** *Roadmap* → touchez une gare : programme, matériel du groupe I, menu du jour,
   compte-rendu et photos. *Passer au lendemain (démo)* fait avancer le train.
10. **La clôture.** *Bilan de clôture* → *Clôturer le camp* : les chiffres réels sont versés dans la
    base de références, qui sert à estimer le prochain camp dès le formulaire d'ouverture.

## Couverture du cahier des charges

| Mission | Écran(s) |
|---|---|
| M0.1 Comptes, rôles, permissions | Connexion, *Rôles & accès*, écran « accès refusé » |
| M0.2 Annuaire | *Annuaire*, fiche personne, fiche sanitaire restreinte, import tableur (200 personnes, sans doublon) |
| M0.3 Camp & ouverture | *Camps*, assistant d'ouverture en 6 étapes, rétroplanning généré, modules optionnels |
| M0.4 Base de prix | *Base de prix* (> 150 articles, fraîcheur > 6 mois signalée), fiche article et historique |
| M0.5 Tableau de bord | Un tableau de bord par rôle, alertes calculées |
| M0.6 Journal | *Journal* filtrable, inaltérable, export |
| M1.1 Moteur de recensement | Tableau commun à tous les groupes : par personne, ratio, par jour ; ajout terrain et file de validation |
| M1.2 Matériel | Groupe A, catégories pré-remplies, disponible lu dans l'inventaire |
| M1.3 Alimentaire | Groupe B : vivres du menu, eau potable (6 / pers. / jour), eau technique, marge, saisie manuelle |
| M1.4 Transport | Groupe G : capacité vs effectif, itinéraires, plan de chargement, plan B |
| M1.5 Économique | Groupe F : consolidation, répartition, participation par personne, simulation 60 / 80 / 100 |
| M1.6 Technique, Santé, Salubrité | Groupes C, D (seuils critiques, responsable obligatoire, évacuation), E (remise en état exportable) |
| M1.7 Activités, Divers | Groupes I (lien roadmap) et J (équipement individuel imprimable) |
| M1.8 Inventaire | *Inventaire* : états, sortie / retour, détenteur, historique |
| M1.9 Fournisseurs, documents | *Fournisseurs & devis* (comparaison, économie), *Documents* (blocage J-7) |
| M1.10 Retours | Groupe H : pointage hors ligne, écarts, mise à jour de l'inventaire, bilan publié |
| M2.1 Budget prévisionnel | *Budget* : version A gelée, ajustements justifiés, circuit de validation, scénarios |
| M2.2 Dépenses réelles | Saisie rapide, rattachement obligatoire, reçu, double signature, hors ligne |
| M2.3 Entrées | *Entrées & paiements* : participations, reçus, impayés exportables, lien bus |
| M2.4 Courbes | *Courbes* : cumul prévu / réel cliquable, fluctuation par poste, dérive > 15 % |
| M2.5 Comptes du jour | *Comptes du jour* : arrêt, trace des modifications, impression A4 |
| M2.6 Avances & caisse | *Avances & caisse* : justification, alerte de délai, rapprochement |
| M2.7 Bilan de clôture | *Bilan* : écarts, coût par participant et par activité, export, versement en références |
| M3.1 Catalogue | *Catalogue de plats* (32 plats), fiche plat, coût par portion, allergènes |
| M3.2 Espace jeune | *Mon espace* → *Mes repas* : choix, propositions, allergies filtrées, clôture |
| M3.3 Corrélation & arrêt | *Choix & arrêt du menu* : taux croisés, calendrier, jours sans cuisine |
| M3.4 Vivres | *Calcul des vivres* : liste chiffrée, transmission, recalcul +10 participants |
| M3.5 Suggestion live | *Suggestion live* : stock, plats réalisables, votes, décrémentation |
| M3.6 Gaspillage | *Gaspillage* : portions, reste de vivres, comparaison, intégré au bilan |
| M4.1 Programme | *Construction du programme* : journées, activités, duplication |
| M4.2 Circuit 3D | *Roadmap* : scène 3D du design system, train, gares cliquables |
| M4.3 Version 2D | Frise 2D automatique (même contenu), bascule manuelle |
| M4.4 Agenda | *Agenda* : liste / semaine, filtres, impression, consultation publique |
| M5.1 Site vitrine | Site public : accueil 3D, groupe, unités, activités, galerie, actualités, bilans, contact, parents |
| M5.2 Inscription | Formulaire public, siège unique, recalcul, *Mon inscription*, fermeture à effectif plein |
| M5.3 Bus volant | Bus 3D (ballons, décollage) + plan 2D, trois vues : public, responsable, famille |
| M6.1 Références | *Base de références* : camps antérieurs, ratios par type, modèles, estimation à l'ouverture |
| M6.2 Hook des prix | *Hook des prix* : file, source, valider / corriger / rejeter, alertes, prix du terrain |

## Architecture

```
mvp/
  index.html              Point d'entrée : charge les tokens, gst.css, le moteur de motion et le kit 3D du DS
  assets/seed.js          Données de démonstration (types de camp, rôles, articles, plats, gabarits…)
  assets/core.js          État, calcul continu, droits, journal, hors ligne, routeur
  assets/shell.js         Coquilles (application, site public), navigation par rôle, composants d'interface
  assets/views-*.js       Écrans par module : socle, logistique, compta, cuisine, programme, public, mémoire
  assets/mvp.css          Mise en page de l'application
```

Règle structurante (ENF-12) : **un chiffre naît en un seul endroit et circule**. Les totaux
(groupes, consolidation, budget, enveloppes, courbes, sièges) sont toujours dérivés de l'état au
moment de l'affichage, jamais recopiés.
