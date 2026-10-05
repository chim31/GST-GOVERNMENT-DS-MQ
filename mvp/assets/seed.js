/* GST GOVERNMENT — MVP · Données de démonstration
   Tout est fictif mais cohérent avec le cahier des charges :
   - 80 personnes × 14 jours × 6 sachets = 6 720 sachets d'eau (M1.3) ;
   - base de prix > 150 articles (M0.4), catalogue ≥ 30 plats (M3.1) ;
   - neuf rôles (M0.1), six types de camp (M0.3), dix groupes logistiques. */
(function () {
  "use strict";
  var SEED = (window.GST_SEED = {});

  /* Date simulée de la démo : 10 août 2026 = J.06 du camp de Réjouissance. */
  SEED.today = "2026-08-10";

  /* ── Types de camp ──────────────────────────────────────────────────── */
  SEED.TYPES = {
    rejouissance: { nom: "Camp de réjouissance", court: "Réjouissance", l: "R", duree: "2 semaines", prep: 60, niveau: "Lourde", groupes: "ABCDEFGHIJ", modules: { roadmap: true, inscription: true, bus: true }, cuisine: true },
    survie: { nom: "Camp de survie", court: "Survie", l: "S", duree: "3 jours", prep: 14, niveau: "Légère", groupes: "ABDFGH", modules: { roadmap: false, inscription: false, bus: false }, cuisine: false },
    formation: { nom: "Camp de formation", court: "Formation", l: "F", duree: "3 jours", prep: 21, niveau: "Moyenne", groupes: "ABDEFGHI", modules: { roadmap: false, inscription: true, bus: false }, cuisine: true },
    jamboree: { nom: "Jamboree national", court: "Jamboree national", l: "J", duree: "2 semaines +", prep: 90, niveau: "Très lourde", groupes: "ABCDEFGHIJ", modules: { roadmap: true, inscription: true, bus: true }, cuisine: true },
    jamboreeint: { nom: "Jamboree international", court: "Jamboree international", l: "I", duree: "2 semaines +", prep: 180, niveau: "Maximale", groupes: "ABCDEFGHIJ", modules: { roadmap: true, inscription: true, bus: true }, cuisine: true, international: true },
    mission: { nom: "Mission ponctuelle", court: "Mission", l: "M", duree: "1 journée", prep: 7, niveau: "Minimale", groupes: "AFG", modules: { roadmap: false, inscription: false, bus: false }, cuisine: false }
  };

  /* Jalons de rétroplanning (en jours relatifs au début / à la fin du camp) */
  SEED.JALONS = [
    { k: "J-60", d: -60, t: "Ouverture du camp, responsables de groupe désignés, effectif prévisionnel" },
    { k: "J-45", d: -45, t: "Menu proposé aux jeunes, ouverture des inscriptions publiques" },
    { k: "J-30", d: -30, t: "Clôture des choix de menu, recensement de tous les groupes terminé" },
    { k: "J-21", d: -21, t: "Budget prévisionnel consolidé et validé, itinéraires arrêtés" },
    { k: "J-14", d: -14, t: "Achats engagés, devis validés, plan de chargement établi" },
    { k: "J-7", d: -7, t: "Contrôle des seuils critiques, vérification santé et sécurité" },
    { k: "J-1", d: -1, t: "Chargement, pointage du matériel au départ" },
    { k: "J+3", d: 3, fin: true, t: "Inventaire de retour, saisie des écarts" },
    { k: "J+10", d: 10, fin: true, t: "Bilan chiffré publié, versement dans la base de références" }
  ];

  /* ── Groupes logistiques ────────────────────────────────────────────── */
  SEED.GROUPES = {
    A: { nom: "Matériel", ico: "tent", poste: "MAT", desc: "Tout ce que le groupe emporte collectivement." },
    B: { nom: "Alimentaire", ico: "utensils", poste: "ALI", renforce: true, desc: "Traduit le menu validé en vivres chiffrés, et gère l'eau potable." },
    C: { nom: "Technique", ico: "zap", poste: "TEC", desc: "Énergie, éclairage, câblage, audiovisuel, outillage." },
    D: { nom: "Santé", ico: "heart-pulse", poste: "SAN", critique: true, desc: "Groupe à seuil critique : en dessous, le camp ne part pas." },
    E: { nom: "Salubrité", ico: "droplet", poste: "SAL", desc: "Hygiène, sanitaires, déchets, remise en état du terrain." },
    F: { nom: "Économique", ico: "calculator", poste: null, renforce: true, pivot: true, desc: "Le groupe pivot : il agrège tous les autres et produit le budget." },
    G: { nom: "Transport", ico: "truck", poste: "TRA", renforce: true, desc: "Itinéraires, véhicules, coûts, plan de chargement." },
    H: { nom: "Retours", ico: "rotate-ccw", poste: null, inverse: true, desc: "Ce qui revient du camp. Bilan rendu public." },
    I: { nom: "Activités", ico: "compass", poste: "ACT", desc: "Matériel, droits d'entrée et intervenants par activité." },
    J: { nom: "Social & divers", ico: "users", poste: "SOC", desc: "Uniformes, équipement individuel, accueil, divers." }
  };
  SEED.POSTES = [
    { id: "ALI", nom: "Alimentaire", g: "B" }, { id: "TRA", nom: "Transport", g: "G" }, { id: "MAT", nom: "Matériel", g: "A" },
    { id: "ACT", nom: "Activités", g: "I" }, { id: "TEC", nom: "Technique", g: "C" }, { id: "SAN", nom: "Santé", g: "D" },
    { id: "SOC", nom: "Social & divers", g: "J" }, { id: "SAL", nom: "Salubrité", g: "E" }
  ];

  /* ── Rôles ──────────────────────────────────────────────────────────── */
  SEED.ROLES = {
    chef: { nom: "Chef de groupe", acces: "Total" },
    commissaire: { nom: "Commissaire logistique", acces: "Module 1 complet" },
    respgroupe: { nom: "Responsable de groupe", acces: "Son groupe" },
    tresorier: { nom: "Trésorière", acces: "Module 2 complet" },
    cuisine: { nom: "Responsable cuisine", acces: "Module 3 intendance" },
    chefunite: { nom: "Chef d'unité", acces: "Son unité" },
    scout: { nom: "Scout", acces: "Espace jeune" },
    parent: { nom: "Parent", acces: "Espace famille" },
    sante: { nom: "Responsable santé", acces: "Groupe D + fiches sanitaires" }
  };

  /* ── Base de prix : [id, nom, cat, unité, prix, périssable, marché, relevé] ── */
  var M1 = "Marché d'Adawlato", M2 = "Marché d'Hédzranawoé", M3 = "Marché d'Adakpamé", M4 = "Grossiste Bè", M5 = "Pharmacie du Golfe", M6 = "Quincaillerie Assivito", M7 = "Station Total Agoè", M8 = "Transports Kpalimé Express";
  SEED.ARTICLES = [
    // Alimentaire — vivres
    ["riz", "Riz local", "ALI", "kg", 650, 0, M3, "2026-06-12"], ["riz50", "Riz local — sac 50 kg", "ALI", "sac", 32000, 0, M4, "2026-06-12"],
    ["mais", "Farine de maïs", "ALI", "kg", 420, 0, M3, "2026-06-20"], ["mil", "Mil", "ALI", "kg", 520, 0, M1, "2026-05-30"],
    ["gari", "Gari", "ALI", "kg", 480, 0, M3, "2026-06-20"], ["atieke", "Atiéké", "ALI", "kg", 600, 1, M2, "2026-07-02"],
    ["igname", "Igname", "ALI", "kg", 450, 1, M3, "2026-07-02"], ["plantain", "Banane plantain", "ALI", "kg", 350, 1, M1, "2026-07-02"],
    ["spag", "Spaghetti", "ALI", "kg", 900, 0, M4, "2026-06-12"], ["farine", "Farine de blé", "ALI", "kg", 620, 0, M4, "2026-06-12"],
    ["haricot", "Haricot blanc", "ALI", "kg", 900, 0, M3, "2026-06-20"], ["haricotr", "Haricot rouge", "ALI", "kg", 950, 0, M3, "2026-06-20"],
    ["arachide", "Pâte d'arachide", "ALI", "kg", 1800, 0, M1, "2026-06-01"], ["arachg", "Arachides grillées", "ALI", "kg", 1500, 0, M1, "2026-06-01"],
    ["palme", "Noix de palme", "ALI", "kg", 600, 1, M3, "2026-07-02"], ["gombo", "Gombo", "ALI", "kg", 900, 1, M2, "2026-07-02"],
    ["gboma", "Épinards gboma", "ALI", "kg", 600, 1, M2, "2026-07-02"], ["tomate", "Tomate fraîche", "ALI", "kg", 800, 1, M2, "2026-07-02"],
    ["tomconc", "Concentré de tomate", "ALI", "boîte", 350, 0, M4, "2026-06-12"], ["oignon", "Oignon", "ALI", "kg", 700, 1, M3, "2026-07-02"],
    ["piment", "Piment", "ALI", "kg", 1500, 1, M2, "2026-07-02"], ["ail", "Ail", "ALI", "kg", 2500, 0, M3, "2026-06-20"],
    ["epices", "Épices (soumbala, cube)", "ALI", "kg", 3000, 0, M1, "2025-11-14"], ["sel", "Sel", "ALI", "kg", 250, 0, M4, "2026-06-12"],
    ["huile", "Huile végétale", "ALI", "L", 1100, 0, M4, "2026-06-12"], ["huiler", "Huile rouge", "ALI", "L", 1200, 0, M1, "2025-12-02"],
    ["poulet", "Poulet", "ALI", "kg", 2800, 1, M2, "2026-07-02"], ["boeuf", "Viande de bœuf", "ALI", "kg", 3500, 1, M2, "2026-07-02"],
    ["poissonf", "Poisson fumé", "ALI", "kg", 3000, 0, M1, "2026-06-01"], ["poisson", "Poisson frais (chinchard)", "ALI", "kg", 2400, 1, M2, "2026-07-02"],
    ["sardine", "Sardine en boîte", "ALI", "boîte", 400, 0, M4, "2026-06-12"], ["oeuf", "Œufs", "ALI", "pièce", 100, 1, M3, "2026-07-02"],
    ["lait", "Lait en poudre", "ALI", "kg", 4500, 0, M4, "2026-06-12"], ["sucre", "Sucre", "ALI", "kg", 750, 0, M4, "2026-06-12"],
    ["the", "Thé (sachets)", "ALI", "boîte", 1200, 0, M4, "2026-06-12"], ["cafe", "Café soluble", "ALI", "boîte", 2500, 0, M4, "2025-10-30"],
    ["pain", "Pain", "ALI", "pièce", 150, 1, M3, "2026-07-02"], ["beurre", "Beurre / margarine", "ALI", "kg", 2800, 0, M4, "2026-06-12"],
    ["eau", "Sachet d'eau potable 50 cl", "ALI", "sachet", 25, 0, M4, "2026-06-12"], ["bidon", "Eau technique — bidon 25 L", "ALI", "bidon", 150, 0, M3, "2026-06-12"],
    ["charbon", "Charbon de bois — sac", "ALI", "sac", 5500, 0, M3, "2026-05-30"], ["gaz", "Recharge gaz 12 kg", "ALI", "bouteille", 7500, 0, M7, "2026-06-25"],
    ["akassa", "Akassa", "ALI", "kg", 500, 1, M2, "2026-07-02"], ["fruits", "Fruits de saison", "ALI", "kg", 600, 1, M2, "2026-07-02"],
    // Matériel
    ["djembe", "Djembé", "MAT", "pièce", 35000, 0, M1, "2025-09-10"], ["bache", "Bâche 6 × 8 m", "MAT", "pièce", 18000, 0, M6, "2026-04-18"],
    ["tente6", "Tente 6 places", "MAT", "pièce", 85000, 0, M6, "2026-04-18"], ["tente4", "Tente 4 places", "MAT", "pièce", 55000, 0, M6, "2026-04-18"],
    ["drapTG", "Drapeau Togo", "MAT", "pièce", 7500, 0, M1, "2026-03-02"], ["drapAST", "Drapeau AST", "MAT", "pièce", 9000, 0, M1, "2026-03-02"],
    ["drapGST", "Drapeau GST", "MAT", "pièce", 9000, 0, M1, "2026-03-02"], ["etend", "Porte-étendard", "MAT", "pièce", 6500, 0, M6, "2026-03-02"],
    ["sono", "Sonorisation (location / jour)", "MAT", "jour", 15000, 0, M1, "2026-05-10"], ["corde8", "Corde 8 mm", "MAT", "m", 150, 0, M6, "2026-04-18"],
    ["ficelle", "Ficelle sisal — bobine", "MAT", "bobine", 1500, 0, M6, "2026-04-18"], ["piquet", "Piquets bois", "MAT", "lot de 20", 3000, 0, M6, "2026-04-18"],
    ["marteau", "Marteau", "MAT", "pièce", 3500, 0, M6, "2026-04-18"], ["clous", "Clous (kg)", "MAT", "kg", 1200, 0, M6, "2026-04-18"],
    ["pioche", "Pioche", "MAT", "pièce", 6000, 0, M6, "2026-04-18"], ["scie", "Scie", "MAT", "pièce", 5500, 0, M6, "2026-04-18"],
    ["pelle", "Pelle", "MAT", "pièce", 4500, 0, M6, "2026-04-18"], ["balai", "Balai", "MAT", "pièce", 800, 0, M3, "2026-04-18"],
    ["seau", "Seau 15 L", "MAT", "pièce", 1500, 0, M3, "2026-04-18"], ["bassine", "Bassine 40 L", "MAT", "pièce", 3500, 0, M3, "2026-04-18"],
    ["natte", "Natte de couchage", "MAT", "pièce", 2500, 0, M1, "2026-04-18"], ["matelas", "Matelas mousse", "MAT", "pièce", 12000, 0, M1, "2025-08-02"],
    ["marmite", "Marmite 100 L", "MAT", "pièce", 45000, 0, M6, "2026-02-14"], ["louche", "Ustensiles de cuisine — lot", "MAT", "lot", 15000, 0, M3, "2026-02-14"],
    ["foyer", "Foyer amélioré", "MAT", "pièce", 18000, 0, M6, "2026-02-14"], ["glaciere", "Glacière 60 L", "MAT", "pièce", 25000, 0, M4, "2026-02-14"],
    ["table", "Table pliante", "MAT", "pièce", 22000, 0, M6, "2026-02-14"], ["chaise", "Chaise plastique (location)", "MAT", "pièce", 200, 0, M1, "2026-05-10"],
    // Technique
    ["groupe", "Groupe électrogène 5 kVA (location / jour)", "TEC", "jour", 12000, 0, M7, "2026-05-28"], ["essence", "Essence", "TEC", "L", 680, 0, M7, "2026-07-01"],
    ["gasoil", "Gasoil", "TEC", "L", 650, 0, M7, "2026-07-01"], ["batterie", "Batterie 12 V", "TEC", "pièce", 38000, 0, M6, "2026-03-20"],
    ["frontale", "Lampe frontale", "TEC", "pièce", 3500, 0, M6, "2026-03-20"], ["torche", "Torche rechargeable", "TEC", "pièce", 5500, 0, M6, "2026-03-20"],
    ["projo", "Projecteur LED 50 W", "TEC", "pièce", 14000, 0, M6, "2026-03-20"], ["rallonge", "Rallonge 25 m", "TEC", "pièce", 9000, 0, M6, "2026-03-20"],
    ["multi", "Multiprise", "TEC", "pièce", 3000, 0, M6, "2026-03-20"], ["cable", "Câble électrique 2,5 mm²", "TEC", "m", 450, 0, M6, "2026-03-20"],
    ["piles", "Piles AA — pack de 4", "TEC", "pack", 1200, 0, M4, "2026-03-20"], ["talkie", "Talkie-walkie (paire)", "TEC", "paire", 28000, 0, M6, "2025-07-15"],
    ["videoproj", "Vidéoprojecteur (location / jour)", "TEC", "jour", 10000, 0, M1, "2026-05-10"], ["outils", "Caisse à outils", "TEC", "pièce", 25000, 0, M6, "2026-03-20"],
    ["panneau", "Panneau solaire 100 W", "TEC", "pièce", 45000, 0, M6, "2026-03-20"], ["chargeur", "Chargeur solaire USB", "TEC", "pièce", 8500, 0, M6, "2026-03-20"],
    // Santé
    ["trousse", "Trousse de secours complète", "SAN", "pièce", 25000, 0, M5, "2026-06-05"], ["parac", "Paracétamol 500 mg — boîte", "SAN", "boîte", 600, 0, M5, "2026-06-05"],
    ["antisep", "Antiseptique (Bétadine)", "SAN", "flacon", 2500, 0, M5, "2026-06-05"], ["compresse", "Compresses stériles — boîte", "SAN", "boîte", 1500, 0, M5, "2026-06-05"],
    ["bande", "Bandes de gaze", "SAN", "rouleau", 400, 0, M5, "2026-06-05"], ["sparadrap", "Sparadrap", "SAN", "rouleau", 700, 0, M5, "2026-06-05"],
    ["sro", "Sels de réhydratation (SRO)", "SAN", "sachet", 200, 0, M5, "2026-06-05"], ["antipal", "Antipaludéen (CTA) — boîte", "SAN", "boîte", 2500, 0, M5, "2026-06-05"],
    ["moustiq", "Répulsif anti-moustiques", "SAN", "flacon", 2000, 0, M5, "2026-06-05"], ["gants", "Gants d'examen — boîte de 100", "SAN", "boîte", 4500, 0, M5, "2026-06-05"],
    ["thermo", "Thermomètre", "SAN", "pièce", 3000, 0, M5, "2026-06-05"], ["attelle", "Attelle", "SAN", "pièce", 3500, 0, M5, "2026-06-05"],
    ["couverture", "Couverture de survie", "SAN", "pièce", 1500, 0, M5, "2026-06-05"], ["brulure", "Crème anti-brûlure", "SAN", "tube", 2200, 0, M5, "2026-06-05"],
    ["ibup", "Ibuprofène 400 mg — boîte", "SAN", "boîte", 900, 0, M5, "2026-06-05"], ["antihist", "Antihistaminique — boîte", "SAN", "boîte", 1800, 0, M5, "2025-12-20"],
    ["serum", "Sérum physiologique — dosettes", "SAN", "boîte", 1500, 0, M5, "2026-06-05"],
    // Salubrité
    ["savon", "Savon de Marseille", "SAL", "pièce", 300, 0, M4, "2026-06-12"], ["javel", "Eau de Javel 1 L", "SAL", "L", 600, 0, M4, "2026-06-12"],
    ["detergent", "Détergent en poudre — kg", "SAL", "kg", 1400, 0, M4, "2026-06-12"], ["papier", "Papier hygiénique — paquet de 12", "SAL", "paquet", 2400, 0, M4, "2026-06-12"],
    ["sacpoub", "Sacs poubelle 100 L — rouleau", "SAL", "rouleau", 1500, 0, M4, "2026-06-12"], ["dispositif", "Dispositif lave-mains", "SAL", "pièce", 12000, 0, M6, "2026-02-10"],
    ["latrine", "Bâche latrines + structure", "SAL", "pièce", 15000, 0, M6, "2026-02-10"], ["rateau", "Râteau", "SAL", "pièce", 3500, 0, M6, "2026-02-10"],
    ["brouette", "Brouette", "SAL", "pièce", 28000, 0, M6, "2026-02-10"], ["gel", "Gel hydroalcoolique 500 ml", "SAL", "flacon", 2000, 0, M5, "2026-06-05"],
    ["eponge", "Éponges — lot de 10", "SAL", "lot", 1000, 0, M4, "2026-06-12"], ["poubelle", "Poubelle 120 L", "SAL", "pièce", 9000, 0, M6, "2026-02-10"],
    ["douche", "Kit douche de camp", "SAL", "pièce", 18000, 0, M6, "2026-02-10"],
    // Transport
    ["bus70", "Location bus 70 places — aller-retour", "TRA", "trajet", 380000, 0, M8, "2026-05-15"], ["bus30", "Location minibus 30 places — aller-retour", "TRA", "trajet", 190000, 0, M8, "2026-05-15"],
    ["camion", "Location camion 10 t — aller-retour", "TRA", "trajet", 160000, 0, M8, "2026-05-15"], ["pickup", "Location pick-up / jour", "TRA", "jour", 25000, 0, M8, "2026-05-15"],
    ["chauffeur", "Chauffeur / jour", "TRA", "jour", 7500, 0, M8, "2026-05-15"], ["peage", "Péage — passage", "TRA", "passage", 1000, 0, M7, "2026-05-15"],
    ["parking", "Stationnement / jour", "TRA", "jour", 1500, 0, M7, "2026-05-15"], ["taxi", "Taxi-moto (course)", "TRA", "course", 500, 0, M3, "2026-05-15"],
    ["pirogue", "Traversée en pirogue — personne", "TRA", "personne", 750, 0, "Embarcadère de Togoville", "2026-05-15"],
    // Activités
    ["boussole", "Boussole", "ACT", "pièce", 4500, 0, M6, "2026-04-02"], ["carteIGN", "Carte IGN 1/50 000", "ACT", "pièce", 6000, 0, "Institut géographique", "2025-06-15"],
    ["sifflet", "Sifflet", "ACT", "pièce", 500, 0, M1, "2026-04-02"], ["chrono", "Chronomètre", "ACT", "pièce", 3500, 0, M6, "2026-04-02"],
    ["medaille", "Médaille", "ACT", "pièce", 1500, 0, M1, "2026-04-02"], ["ballon", "Ballon de football", "ACT", "pièce", 7500, 0, M1, "2026-04-02"],
    ["entree", "Droit d'entrée — site touristique", "ACT", "personne", 1000, 0, "Office du tourisme", "2026-04-02"], ["guide", "Guide local / jour", "ACT", "jour", 10000, 0, "Office du tourisme", "2026-04-02"],
    ["intervenant", "Intervenant extérieur — séance", "ACT", "séance", 20000, 0, "Croix-Rouge togolaise", "2026-04-02"], ["peinture", "Peinture acrylique 20 L", "ACT", "seau", 28000, 0, M6, "2026-04-02"],
    ["pinceau", "Pinceaux — lot", "ACT", "lot", 3500, 0, M6, "2026-04-02"], ["gilet", "Gilet de sauvetage (location)", "ACT", "pièce", 500, 0, "Embarcadère de Togoville", "2026-04-02"],
    ["bois", "Bois de feu — stère", "ACT", "stère", 12000, 0, M3, "2026-04-02"], ["mannequin", "Mannequin de secourisme (location)", "ACT", "jour", 5000, 0, "Croix-Rouge togolaise", "2026-04-02"],
    ["jeux", "Jeux de société — lot", "ACT", "lot", 8000, 0, M1, "2026-04-02"], ["fanion", "Fanion de patrouille", "ACT", "pièce", 2500, 0, M1, "2026-04-02"],
    // Social & divers
    ["foulard", "Foulard GST", "SOC", "pièce", 2500, 0, "Atelier GST", "2026-03-15"], ["insigne", "Insigne brodé", "SOC", "pièce", 800, 0, "Atelier GST", "2026-03-15"],
    ["tshirt", "T-shirt du camp", "SOC", "pièce", 3500, 0, "Atelier GST", "2026-03-15"], ["badge", "Badge nominatif", "SOC", "pièce", 300, 0, "Atelier GST", "2026-03-15"],
    ["cadeau", "Cadeau protocolaire", "SOC", "pièce", 15000, 0, M1, "2026-03-15"], ["souvenir", "Souvenir du camp", "SOC", "pièce", 1000, 0, M1, "2026-03-15"],
    ["diplome", "Diplôme / attestation imprimée", "SOC", "pièce", 250, 0, "Imprimerie du Golfe", "2026-03-15"], ["accueil", "Collation d'accueil — invité", "SOC", "personne", 1500, 0, M2, "2026-03-15"],
    ["impr", "Impressions diverses", "SOC", "lot", 15000, 0, "Imprimerie du Golfe", "2026-03-15"], ["chemise", "Chemise d'uniforme", "SOC", "pièce", 9000, 0, "Atelier GST", "2025-09-01"]
  ];

  /* ── Catalogue de plats : ingrédients par portion (unité de l'article) ── */
  SEED.PLATS = [
    // Matin
    { id: "m1", nom: "Bouillie de mil & beignets", service: "matin", t: 50, diff: "facile", ing: [["mil", 0.06], ["sucre", 0.03], ["farine", 0.05], ["huile", 0.02]], all: ["gluten"] },
    { id: "m2", nom: "Koko (bouillie de maïs)", service: "matin", t: 40, diff: "facile", ing: [["mais", 0.08], ["sucre", 0.03], ["arachg", 0.02]], all: ["arachide"] },
    { id: "m3", nom: "Thé & pain beurré", service: "matin", t: 15, diff: "facile", ing: [["the", 0.04], ["sucre", 0.03], ["pain", 1], ["beurre", 0.02], ["lait", 0.015]], all: ["gluten", "lait"] },
    { id: "m4", nom: "Pain & omelette", service: "matin", t: 25, diff: "facile", ing: [["pain", 1], ["oeuf", 1.5], ["oignon", 0.02], ["huile", 0.015]], all: ["gluten", "oeuf"] },
    { id: "m5", nom: "Riz au lait", service: "matin", t: 35, diff: "facile", ing: [["riz", 0.07], ["lait", 0.03], ["sucre", 0.03]], all: ["lait"] },
    { id: "m6", nom: "Akassa & bouillie", service: "matin", t: 30, diff: "facile", ing: [["akassa", 0.15], ["sucre", 0.02], ["mais", 0.03]], all: [] },
    { id: "m7", nom: "Haricot & gari", service: "matin", t: 60, diff: "moyenne", ing: [["haricot", 0.1], ["gari", 0.06], ["huiler", 0.02], ["piment", 0.005]], all: [] },
    { id: "m8", nom: "Igname frite & sauce piment", service: "matin", t: 35, diff: "facile", ing: [["igname", 0.3], ["huile", 0.04], ["piment", 0.01], ["tomate", 0.03]], all: [] },
    { id: "m9", nom: "Café au lait & pain", service: "matin", t: 15, diff: "facile", ing: [["cafe", 0.03], ["lait", 0.02], ["sucre", 0.03], ["pain", 1]], all: ["gluten", "lait"] },
    { id: "m10", nom: "Bouillie de riz aux arachides", service: "matin", t: 40, diff: "facile", ing: [["riz", 0.06], ["arachg", 0.03], ["sucre", 0.03]], all: ["arachide"] },
    // Midi
    { id: "d1", nom: "Akoumé sauce gombo", service: "midi", t: 80, diff: "moyenne", ing: [["mais", 0.18], ["gombo", 0.08], ["poissonf", 0.04], ["piment", 0.005], ["huiler", 0.02]], all: ["poisson"] },
    { id: "d2", nom: "Riz sauce arachide", service: "midi", t: 75, diff: "moyenne", ing: [["riz", 0.15], ["arachide", 0.05], ["poulet", 0.07], ["tomate", 0.04], ["oignon", 0.02]], all: ["arachide"] },
    { id: "d3", nom: "Ayimolou", service: "midi", t: 70, diff: "facile", ing: [["riz", 0.1], ["haricot", 0.06], ["huiler", 0.02], ["gari", 0.03], ["sardine", 0.2]], all: ["poisson"] },
    { id: "d4", nom: "Amiwo poulet", service: "midi", t: 90, diff: "moyenne", ing: [["mais", 0.15], ["tomconc", 0.1], ["poulet", 0.08], ["epices", 0.004], ["huile", 0.02]], all: [], spe: true },
    { id: "d5", nom: "Riz gras", service: "midi", t: 70, diff: "moyenne", ing: [["riz", 0.15], ["tomconc", 0.12], ["boeuf", 0.06], ["oignon", 0.03], ["huile", 0.03]], all: [] },
    { id: "d6", nom: "Pâte de maïs sauce légumes", service: "midi", t: 70, diff: "facile", ing: [["mais", 0.18], ["gboma", 0.08], ["tomate", 0.05], ["poissonf", 0.03]], all: ["poisson"] },
    { id: "d7", nom: "Fufu sauce arachide", service: "midi", t: 100, diff: "difficile", ing: [["igname", 0.35], ["arachide", 0.05], ["poulet", 0.07], ["tomate", 0.04]], all: ["arachide"] },
    { id: "d8", nom: "Riz sauce tomate poisson", service: "midi", t: 60, diff: "facile", ing: [["riz", 0.15], ["tomate", 0.06], ["poisson", 0.08], ["oignon", 0.02], ["huile", 0.02]], all: ["poisson"] },
    { id: "d9", nom: "Ablo & poisson frit", service: "midi", t: 75, diff: "moyenne", ing: [["riz", 0.08], ["mais", 0.06], ["poisson", 0.09], ["huile", 0.04], ["piment", 0.006]], all: ["poisson"], spe: true },
    { id: "d10", nom: "Couscous de maïs & sauce gombo", service: "midi", t: 65, diff: "facile", ing: [["mais", 0.16], ["gombo", 0.06], ["boeuf", 0.04], ["huiler", 0.015]], all: [] },
    // Soir
    { id: "s1", nom: "Fufu sauce graine", service: "soir", t: 110, diff: "difficile", ing: [["igname", 0.35], ["palme", 0.15], ["boeuf", 0.06], ["piment", 0.005]], all: [] },
    { id: "s2", nom: "Spaghetti sauce tomate", service: "soir", t: 40, diff: "facile", ing: [["spag", 0.12], ["tomconc", 0.1], ["oignon", 0.03], ["sardine", 0.3], ["huile", 0.02]], all: ["gluten", "poisson"] },
    { id: "s3", nom: "Atiéké poisson", service: "soir", t: 45, diff: "facile", ing: [["atieke", 0.2], ["poisson", 0.1], ["oignon", 0.03], ["piment", 0.006], ["huile", 0.02]], all: ["poisson"] },
    { id: "s4", nom: "Gboma dessi", service: "soir", t: 70, diff: "moyenne", ing: [["gboma", 0.12], ["poissonf", 0.04], ["tomate", 0.05], ["mais", 0.15]], all: ["poisson"] },
    { id: "s5", nom: "Riz sauce tomate", service: "soir", t: 50, diff: "facile", ing: [["riz", 0.15], ["tomconc", 0.1], ["poulet", 0.05], ["oignon", 0.02], ["huile", 0.02]], all: [] },
    { id: "s6", nom: "Koklo mémé & frites d'igname", service: "soir", t: 80, diff: "moyenne", ing: [["poulet", 0.15], ["igname", 0.25], ["huile", 0.05], ["epices", 0.005]], all: [], fete: true },
    { id: "s7", nom: "Abobo (haricot rouge & plantain)", service: "soir", t: 70, diff: "facile", ing: [["haricotr", 0.12], ["plantain", 0.2], ["huiler", 0.02], ["oignon", 0.02]], all: [] },
    { id: "s8", nom: "Djinkoumé (pâte rouge)", service: "soir", t: 60, diff: "moyenne", ing: [["mais", 0.17], ["tomconc", 0.08], ["poulet", 0.06], ["huiler", 0.02]], all: [], spe: true },
    { id: "s9", nom: "Igname pilée sauce légumes", service: "soir", t: 90, diff: "difficile", ing: [["igname", 0.35], ["gboma", 0.08], ["boeuf", 0.05], ["tomate", 0.04]], all: [] },
    { id: "s10", nom: "Soupe de poisson & akassa", service: "soir", t: 55, diff: "facile", ing: [["poisson", 0.1], ["akassa", 0.2], ["tomate", 0.04], ["piment", 0.006]], all: ["poisson"] },
    // Route & fête
    { id: "r1", nom: "Repas de route : gari, arachides & sardine", service: "route", t: 10, diff: "facile", ing: [["gari", 0.12], ["arachg", 0.05], ["sardine", 0.5], ["sucre", 0.02]], all: ["arachide", "poisson"], route: true },
    { id: "f1", nom: "Repas de fête : riz gras & poulet braisé", service: "midi", t: 120, diff: "difficile", ing: [["riz", 0.15], ["poulet", 0.2], ["tomconc", 0.1], ["huile", 0.03], ["fruits", 0.15]], all: [], fete: true }
  ];

  /* ── Unités ─────────────────────────────────────────────────────────── */
  SEED.UNITES = [
    { id: "LOU", nom: "Meute des Louveteaux", age: "8 – 11 ans", chef: "p-kossi" },
    { id: "JEA", nom: "Ronde des Jeannettes", age: "8 – 11 ans", chef: "p-afi" },
    { id: "ECL", nom: "Troupe des Éclaireurs", age: "12 – 15 ans", chef: "p-yao" },
    { id: "GUI", nom: "Compagnie des Guides", age: "12 – 15 ans", chef: "p-delali" },
    { id: "PIO", nom: "Poste des Pionniers", age: "15 – 18 ans", chef: "p-sena" },
    { id: "ROU", nom: "Clan des Routiers", age: "18 – 25 ans", chef: "p-mawuli" }
  ];

  /* ── Encadrement nommé (personnes clés de la démo) ──────────────────── */
  SEED.STAFF = [
    ["p-codjo", "Codjo", "Agossou", "chef", "ROU", "1984-03-12"], ["p-komi", "Komi", "Ayité", "commissaire", "ROU", "1988-07-02"],
    ["p-abla", "Abla", "Dossou", "respgroupe:B", "ROU", "1990-11-20"], ["p-essi", "Essi", "Amouzou", "tresorier", "ROU", "1987-01-30"],
    ["p-ama", "Ama", "Tossou", "cuisine", "ROU", "1986-05-17"], ["p-yao", "Yao", "Kpodo", "chefunite:ECL", "ROU", "1992-09-09"],
    ["p-enyonam", "Enyonam", "Atayi", "sante", "ROU", "1985-02-21"], ["p-edem", "Edem", "Klutse", "respgroupe:C", "ROU", "1991-04-04"],
    ["p-kafui", "Kafui", "Sossou", "respgroupe:E", "ROU", "1993-08-15"], ["p-yawo", "Yawo", "Tchalla", "respgroupe:G", "ROU", "1989-12-01"],
    ["p-akouvi", "Akouvi", "Gbadoé", "respgroupe:H", "ROU", "1994-06-26"], ["p-elom", "Elom", "Fiagbé", "respgroupe:I", "ROU", "1990-10-10"],
    ["p-fifame", "Fifamè", "Hounkpatin", "respgroupe:J", "ROU", "1995-03-03"], ["p-kossi", "Kossi", "Agbodjan", "chefunite:LOU", "ROU", "1993-01-14"],
    ["p-afi", "Afi", "Amegah", "chefunite:JEA", "ROU", "1996-02-08"], ["p-delali", "Délali", "Mensah", "chefunite:GUI", "ROU", "1995-07-19"],
    ["p-sena", "Sèna", "Houngbo", "chefunite:PIO", "ROU", "1994-11-11"], ["p-mawuli", "Mawuli", "Lawson", "chefunite:ROU", "ROU", "1991-05-25"],
    ["p-ahouefa", "Ahouefa", "Zinsou", "staff", "ROU", "1997-09-30"], ["p-kodjo", "Kodjo", "Adjaho", "cuisinier", "ROU", "1983-04-18"],
    ["p-adjoa", "Adjoa", "Dovi", "cuisinier", "ROU", "1988-10-05"], ["p-gbeto", "Gbèto", "Glèlè", "staff", "ROU", "1996-12-12"],
    ["p-koffi", "Koffi", "Assogba", "staff", "ROU", "1992-02-02"]
  ];
  /* Comptes de démonstration (un par rôle) */
  SEED.COMPTES = [
    { role: "chef", person: "p-codjo", login: "codjo.agossou" },
    { role: "commissaire", person: "p-komi", login: "komi.ayite" },
    { role: "respgroupe", person: "p-abla", login: "abla.dossou", groupe: "B" },
    { role: "tresorier", person: "p-essi", login: "essi.amouzou" },
    { role: "cuisine", person: "p-ama", login: "ama.tossou" },
    { role: "chefunite", person: "p-yao", login: "yao.kpodo", unite: "ECL" },
    { role: "sante", person: "p-enyonam", login: "enyonam.atayi" },
    { role: "scout", person: "p-selom", login: "selom.akakpo" },
    { role: "parent", person: "p-mawuena", login: "mawuena.akakpo", enfant: "p-selom" }
  ];

  SEED.PRENOMS = ["Kossi", "Afi", "Komi", "Abla", "Kodjo", "Ama", "Yao", "Akossiwa", "Koffi", "Adjoa", "Mawuli", "Délali", "Edem", "Enyonam",
    "Kafui", "Elom", "Dzifa", "Yawo", "Akouvi", "Kwami", "Essi", "Mawuena", "Ablavi", "Kokou", "Ayaba", "Sèna", "Fifamè",
    "Codjo", "Ahouefa", "Mahougnon", "Gbèto", "Chabi", "Bio", "Sabi", "Orou", "Houénou", "Nadège", "Euloge", "Rodrigue",
    "Prudence", "Fortuné", "Espérance", "Aurore", "Wilfried", "Ghislaine", "Arsène", "Mireille", "Romaric", "Bénédicte", "Dodji", "Eyram", "Senam", "Kekeli"];
  SEED.NOMS = ["Agbodjan", "Amegah", "Adjaho", "Akakpo", "Ayité", "Dossou", "Houngbo", "Kpodo", "Mensah", "Lawson", "Gbadoé", "Tchalla",
    "Atayi", "Sossou", "Agossou", "Hounkpatin", "Zinsou", "Ahouansou", "Tossou", "Dovi", "Fiagbé", "Klutse", "Agbéko", "Adjovi",
    "Amouzou", "Kodjovi", "Assogba", "Hounsou", "Dégbé", "Sodjinou", "Glèlè", "Ahyi", "Djossou", "Akpovi", "Toviho", "Kossouvi"];

  /* ── Gabarits de recensement par groupe ─────────────────────────────────
     mode : fixe (q) · pers (q × effectif) · persjour (q × effectif × jours) · ratio (⌈effectif / q⌉)
     inv : la quantité disponible vient de l'inventaire permanent.          */
  SEED.GABARITS = {
    A: [
      ["Instruments & animation", "djembe", "fixe", 6, 1], ["Abris", "bache", "fixe", 8, 1], ["Abris", "tente6", "ratio", 6, 1],
      ["Protocole", "drapTG", "fixe", 2, 1], ["Protocole", "drapAST", "fixe", 2, 1], ["Protocole", "drapGST", "fixe", 2, 1], ["Protocole", "etend", "fixe", 3, 1],
      ["Sonorisation", "sono", "fixe", 4, 0], ["Cordes & froissartage", "corde8", "fixe", 240, 1], ["Cordes & froissartage", "ficelle", "fixe", 20, 1], ["Cordes & froissartage", "piquet", "fixe", 12, 1],
      ["Construction", "marteau", "fixe", 8, 1], ["Construction", "clous", "fixe", 6, 0], ["Construction", "pioche", "fixe", 4, 1], ["Construction", "scie", "fixe", 6, 1], ["Construction", "pelle", "fixe", 6, 1],
      ["Entretien", "balai", "fixe", 12, 1], ["Entretien", "seau", "fixe", 16, 1], ["Entretien", "bassine", "fixe", 10, 1],
      ["Couchage", "natte", "pers", 1, 1], ["Cuisine collective", "marmite", "fixe", 4, 1], ["Cuisine collective", "louche", "fixe", 2, 1], ["Cuisine collective", "foyer", "fixe", 4, 1]
    ],
    C: [
      ["Énergie", "groupe", "jour", 1, 0], ["Énergie", "essence", "fixe", 140, 0], ["Énergie", "batterie", "fixe", 2, 1], ["Énergie", "panneau", "fixe", 2, 1],
      ["Éclairage", "frontale", "ratio", 4, 1], ["Éclairage", "torche", "fixe", 12, 1], ["Éclairage", "projo", "fixe", 6, 1],
      ["Câblage", "rallonge", "fixe", 6, 1], ["Câblage", "multi", "fixe", 8, 1], ["Câblage", "cable", "fixe", 100, 0], ["Câblage", "piles", "fixe", 20, 0],
      ["Audiovisuel & communication", "talkie", "fixe", 4, 1], ["Audiovisuel & communication", "videoproj", "fixe", 2, 0], ["Outillage", "outils", "fixe", 1, 1]
    ],
    D: [
      ["Pharmacie de camp", "trousse", "fixe", 4, 1, 3], ["Pharmacie de camp", "parac", "ratio", 8, 0, 6], ["Pharmacie de camp", "antisep", "fixe", 8, 0, 6], ["Pharmacie de camp", "compresse", "fixe", 10, 0, 8],
      ["Pharmacie de camp", "bande", "fixe", 30, 0, 20], ["Pharmacie de camp", "sparadrap", "fixe", 10, 0, 6], ["Pharmacie de camp", "sro", "ratio", 2, 0, 30], ["Pharmacie de camp", "antipal", "ratio", 10, 0, 6],
      ["Pharmacie de camp", "moustiq", "ratio", 4, 0, 15], ["Consommables", "gants", "fixe", 3, 0, 2], ["Consommables", "thermo", "fixe", 3, 1, 2], ["Consommables", "attelle", "fixe", 4, 1, 2],
      ["Consommables", "couverture", "fixe", 10, 0, 6], ["Consommables", "brulure", "fixe", 4, 0, 2], ["Consommables", "ibup", "fixe", 6, 0, 3], ["Consommables", "antihist", "fixe", 4, 0, 2], ["Consommables", "serum", "fixe", 4, 0, 2]
    ],
    E: [
      ["Hygiène & nettoyage", "savon", "pers", 2, 0], ["Hygiène & nettoyage", "javel", "fixe", 20, 0], ["Hygiène & nettoyage", "detergent", "fixe", 15, 0], ["Hygiène & nettoyage", "gel", "fixe", 12, 0], ["Hygiène & nettoyage", "eponge", "fixe", 6, 0],
      ["Sanitaires & douches", "papier", "ratio", 4, 0], ["Sanitaires & douches", "latrine", "fixe", 6, 1], ["Sanitaires & douches", "douche", "fixe", 4, 1],
      ["Déchets & tri", "sacpoub", "fixe", 12, 0], ["Déchets & tri", "poubelle", "fixe", 8, 1],
      ["Points d'eau", "dispositif", "fixe", 6, 1], ["Remise en état du terrain", "rateau", "fixe", 6, 1], ["Remise en état du terrain", "brouette", "fixe", 2, 1]
    ],
    I: [
      ["Grand jeu de piste", "boussole", "fixe", 12, 1, 0, 3], ["Grand jeu de piste", "carteIGN", "fixe", 6, 0, 0, 3], ["Grand jeu de piste", "sifflet", "fixe", 12, 1, 0, 3],
      ["Sortie Togoville", "pirogue", "pers", 1, 0, 0, 4], ["Sortie Togoville", "gilet", "pers", 1, 0, 0, 4], ["Sortie Togoville", "entree", "pers", 1, 0, 0, 4], ["Sortie Togoville", "guide", "fixe", 1, 0, 0, 4],
      ["Service communautaire", "peinture", "fixe", 2, 0, 0, 5], ["Service communautaire", "pinceau", "fixe", 4, 0, 0, 5],
      ["Secourisme", "intervenant", "fixe", 2, 0, 0, 9], ["Secourisme", "mannequin", "fixe", 1, 0, 0, 9],
      ["Olympiades", "chrono", "fixe", 6, 1, 0, 11], ["Olympiades", "medaille", "fixe", 24, 0, 0, 11], ["Olympiades", "ballon", "fixe", 4, 1, 0, 11],
      ["Feu de camp", "bois", "fixe", 2, 0, 0, 13], ["Quartier libre", "jeux", "fixe", 3, 1, 0, 8]
    ],
    J: [
      ["Uniformes & insignes", "foulard", "fixe", 14, 0], ["Uniformes & insignes", "insigne", "pers", 1, 0], ["Uniformes & insignes", "tshirt", "pers", 1, 0], ["Uniformes & insignes", "badge", "pers", 1, 0],
      ["Récompenses & souvenirs", "souvenir", "pers", 1, 0], ["Récompenses & souvenirs", "diplome", "pers", 1, 0], ["Cadeaux protocolaires", "cadeau", "fixe", 6, 0],
      ["Accueil des délégations", "accueil", "fixe", 40, 0], ["Divers", "impr", "fixe", 2, 0]
    ]
  };

  /* Équipement individuel demandé aux familles (groupe J) */
  SEED.EQUIPEMENT = ["Sac à dos ou valise", "Natte ou matelas fin", "Drap & couverture légère", "Moustiquaire", "Uniforme complet + foulard", "3 tenues de rechange", "Chaussures fermées + sandales",
    "Gourde 1 L", "Assiette, gobelet, couverts", "Lampe torche + piles", "Trousse de toilette", "Serviette", "Imperméable ou K-way", "Carnet & stylo", "Copie de la carte d'identité scolaire"];

  /* ── Inventaire permanent : [article, qté, état, localisation, détenteur] ── */
  SEED.INVENTAIRE = [
    ["djembe", 4, "bon", "Local GST — Bè", "p-gbeto"], ["djembe", 1, "à réparer", "Local GST — Bè", "p-gbeto"],
    ["bache", 5, "bon", "Local GST — Bè", "p-komi"], ["bache", 1, "usé", "Local GST — Bè", "p-komi"],
    ["tente6", 9, "bon", "Local GST — Bè", "p-komi"], ["tente6", 2, "hors service", "Local GST — Bè", "p-komi"],
    ["drapTG", 2, "bon", "Local GST — Bè", "p-codjo"], ["drapAST", 1, "bon", "Local GST — Bè", "p-codjo"], ["drapGST", 2, "neuf", "Local GST — Bè", "p-codjo"], ["etend", 3, "bon", "Local GST — Bè", "p-codjo"],
    ["corde8", 180, "bon", "Local GST — Bè", "p-mawuli"], ["ficelle", 12, "neuf", "Local GST — Bè", "p-mawuli"], ["piquet", 8, "bon", "Local GST — Bè", "p-mawuli"],
    ["marteau", 6, "bon", "Local GST — Bè", "p-koffi"], ["pioche", 3, "bon", "Local GST — Bè", "p-koffi"], ["scie", 4, "usé", "Local GST — Bè", "p-koffi"], ["pelle", 5, "bon", "Local GST — Bè", "p-koffi"],
    ["balai", 6, "usé", "Local GST — Bè", "p-kafui"], ["seau", 12, "bon", "Local GST — Bè", "p-kafui"], ["bassine", 8, "bon", "Local GST — Bè", "p-kafui"],
    ["natte", 40, "bon", "Local GST — Bè", "p-komi"], ["marmite", 3, "bon", "Local GST — Bè", "p-ama"], ["louche", 2, "bon", "Local GST — Bè", "p-ama"], ["foyer", 2, "bon", "Local GST — Bè", "p-ama"],
    ["batterie", 1, "bon", "Local GST — Bè", "p-edem"], ["panneau", 2, "neuf", "Local GST — Bè", "p-edem"], ["frontale", 14, "bon", "Local GST — Bè", "p-edem"], ["torche", 8, "bon", "Local GST — Bè", "p-edem"],
    ["projo", 4, "bon", "Local GST — Bè", "p-edem"], ["rallonge", 4, "bon", "Local GST — Bè", "p-edem"], ["multi", 5, "bon", "Local GST — Bè", "p-edem"], ["talkie", 2, "bon", "Local GST — Bè", "p-edem"], ["outils", 1, "bon", "Local GST — Bè", "p-edem"],
    ["trousse", 3, "bon", "Infirmerie GST", "p-enyonam"], ["thermo", 2, "bon", "Infirmerie GST", "p-enyonam"], ["attelle", 2, "neuf", "Infirmerie GST", "p-enyonam"],
    ["latrine", 4, "bon", "Local GST — Bè", "p-kafui"], ["douche", 2, "bon", "Local GST — Bè", "p-kafui"], ["poubelle", 6, "bon", "Local GST — Bè", "p-kafui"], ["dispositif", 4, "bon", "Local GST — Bè", "p-kafui"],
    ["rateau", 4, "bon", "Local GST — Bè", "p-kafui"], ["brouette", 1, "à réparer", "Local GST — Bè", "p-kafui"],
    ["boussole", 10, "bon", "Local GST — Bè", "p-elom"], ["sifflet", 15, "bon", "Local GST — Bè", "p-elom"], ["chrono", 4, "bon", "Local GST — Bè", "p-elom"], ["ballon", 3, "usé", "Local GST — Bè", "p-elom"], ["jeux", 2, "bon", "Local GST — Bè", "p-elom"]
  ];

  /* ── Fournisseurs ───────────────────────────────────────────────────── */
  SEED.FOURNISSEURS = [
    { id: "f1", nom: "Transports Kpalimé Express", spe: "Transport", contact: "+228 90 12 34 56", fiab: 4 },
    { id: "f2", nom: "STM Voyages", spe: "Transport", contact: "+228 91 22 18 40", fiab: 3 },
    { id: "f3", nom: "Rakieta Transport", spe: "Transport", contact: "+228 99 40 51 77", fiab: 5 },
    { id: "f4", nom: "Grossiste Bè — Ets Dzidzo", spe: "Vivres", contact: "+228 92 61 10 03", fiab: 4 },
    { id: "f5", nom: "Marché d'Adakpamé — Mama Ablavi", spe: "Vivres", contact: "+228 97 08 24 55", fiab: 5 },
    { id: "f6", nom: "Quincaillerie Assivito", spe: "Matériel", contact: "+228 22 21 45 60", fiab: 4 },
    { id: "f7", nom: "Pharmacie du Golfe", spe: "Santé", contact: "+228 22 26 33 10", fiab: 5 },
    { id: "f8", nom: "Sono Évasion", spe: "Sonorisation", contact: "+228 93 77 01 12", fiab: 3 }
  ];

  /* ── Base de références : camps passés (avant la plateforme inclus) ──── */
  SEED.REFERENCES = [
    { id: "ref-r23", nom: "Réjouissance 2023 — Aného", type: "rejouissance", annee: 2023, effectif: 62, jours: 12, ali: 1310000, tra: 820000, mat: 410000, autres: 640000, source: "Saisie manuelle (carnets)" },
    { id: "ref-s24", nom: "Survie 2024 — Badou", type: "survie", annee: 2024, effectif: 28, jours: 3, ali: 98000, tra: 140000, mat: 46000, autres: 31000, source: "Saisie manuelle (carnets)" },
    { id: "ref-r24", nom: "Réjouissance 2024 — Kpalimé", type: "rejouissance", annee: 2024, effectif: 71, jours: 14, ali: 1720000, tra: 960000, mat: 455000, autres: 790000, source: "Saisie manuelle (tableur)" },
    { id: "ref-f25", nom: "Formation 2025 — Tsévié", type: "formation", annee: 2025, effectif: 34, jours: 3, ali: 156000, tra: 98000, mat: 52000, autres: 64000, source: "Saisie manuelle (tableur)" },
    { id: "ref-r25", nom: "Réjouissance 2025 — Atakpamé", type: "rejouissance", annee: 2025, effectif: 76, jours: 14, ali: 1860000, tra: 1080000, mat: 498000, autres: 905000, source: "Saisie manuelle (tableur)" },
    { id: "ref-j25", nom: "Jamboree national 2025 — Sokodé", type: "jamboree", annee: 2025, effectif: 64, jours: 12, ali: 1540000, tra: 1650000, mat: 520000, autres: 980000, source: "Saisie manuelle (tableur)" }
  ];

  /* ── Hook des prix : suggestions en file ────────────────────────────── */
  SEED.HOOK = [
    { id: "h1", art: "riz50", prix: 34560, src: "Marché d'Adakpamé — relevé terrain", url: "releve://adakpame/2026-08-02", date: "2026-08-02" },
    { id: "h2", art: "gasoil", prix: 705, src: "Prix à la pompe — affichage station", url: "releve://total-agoe/2026-08-05", date: "2026-08-05" },
    { id: "h3", art: "bus70", prix: 395000, src: "Devis Rakieta Transport", url: "devis://rakieta/2026-07-28", date: "2026-07-28" },
    { id: "h4", art: "huiler", prix: 12500, src: "Annonce en ligne (vendeur inconnu)", url: "web://annonces/huile-rouge", date: "2026-08-06", aberrant: true },
    { id: "h5", art: "tomate", prix: 950, src: "Marché d'Hédzranawoé — relevé terrain", url: "releve://hedzranawoe/2026-08-07", date: "2026-08-07" },
    { id: "h6", art: "epices", prix: 3200, src: "Grossiste Bè — liste de prix", url: "liste://grossiste-be/2026-08", date: "2026-08-01" }
  ];

  /* ── Site public : actualités, galerie ───────────────────────────────── */
  SEED.ACTUS = [
    { d: "2026-08-08", t: "Le camp de Réjouissance a franchi sa première semaine", x: "Froissartage, grand jeu de piste et traversée du lac Togo : la roadmap du camp se remplit chaque soir de photos et de comptes-rendus." },
    { d: "2026-07-20", t: "Inscriptions ouvertes au Jamboree national — Kara 2026", x: "80 places dans le bus. Chaque inscription réserve un siège visible de tous ; le statut de paiement reste privé." },
    { d: "2026-06-14", t: "Journée de salubrité au marché de Bè", x: "Les Pionniers et les Routiers ont nettoyé les abords du marché avec la mairie du Golfe 1." },
    { d: "2026-03-28", t: "Bilan du camp de survie d'Agou publié", x: "Matériel revenu à 96 %, un écart de caisse de 0 F CFA : le bilan de retour est consultable par tous." }
  ];
})();
