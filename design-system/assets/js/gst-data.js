/* GST GOVERNMENT — Données factices réalistes (prototypes).
   Camp de Réjouissance 2026 · 05 → 18 août 2026 · Attikoumé · 80 participants
   Budget prévisionnel 4 850 000 F CFA · inscription 25 000 F CFA.
   Contrôles de cohérence avec le cahier des charges :
   - eau potable : 80 × 14 j × 6 sachets = 6 720 sachets (critère M1.3) ;
   - somme des postes = 4 850 000 F CFA. */
(function () {
  var CAMP = {
    nom: "Camp de Réjouissance 2026", court: "Réjouissance 2026", type: "Réjouissance",
    du: "05.08.26", au: "18.08.26", duLong: "05 août 2026", auLong: "18 août 2026",
    lieu: "Attikoumé", effectif: 80, places: 80, jours: 14,
    budget: 4850000, inscription: 25000, eauParJour: 6, prixSachet: 25,
    district: "District Golfe", depuis: 2013,
    handles: ["@associationscoutedutogo", "@groupesscouttonnerre"]
  };

  var UNITES = [
    { id: "LOU", nom: "Meute des Louveteaux", age: "8 – 11 ans", effectif: 16, chef: "Kossi Agbodjan" },
    { id: "JEA", nom: "Ronde des Jeannettes", age: "8 – 11 ans", effectif: 14, chef: "Afi Amegah" },
    { id: "ECL", nom: "Troupe des Éclaireurs", age: "12 – 15 ans", effectif: 16, chef: "Yao Kpodo" },
    { id: "GUI", nom: "Compagnie des Guides", age: "12 – 15 ans", effectif: 14, chef: "Délali Mensah" },
    { id: "PIO", nom: "Poste des Pionniers", age: "15 – 18 ans", effectif: 10, chef: "Sèna Houngbo" },
    { id: "ROU", nom: "Clan des Routiers", age: "18 – 25 ans", effectif: 10, chef: "Mawuli Lawson" }
  ];

  /* Groupes logistiques A → J. cost = coût du manquant (F CFA). */
  var GROUPES = [
    { l: "A", nom: "Matériel", resp: "Komi Ayité", cost: 520000, lignes: 64, need: 412, have: 318, statut: "validé" },
    { l: "B", nom: "Alimentaire", resp: "Abla Dossou", cost: 1940000, lignes: 48, need: 9840, have: 1250, statut: "soumis", renforce: true },
    { l: "C", nom: "Technique", resp: "Edem Klutse", cost: 310000, lignes: 27, need: 96, have: 71, statut: "validé" },
    { l: "D", nom: "Santé", resp: "Dr Enyonam Atayi", cost: 240000, lignes: 38, need: 140, have: 102, seuil: 120, statut: "en cours", critique: true },
    { l: "E", nom: "Salubrité", resp: "Kafui Sossou", cost: 130000, lignes: 22, need: 88, have: 64, statut: "en cours" },
    { l: "F", nom: "Économique", resp: "Codjo Agossou", cost: 4850000, lignes: 9, need: 0, have: 0, statut: "consolidé", renforce: true, pivot: true },
    { l: "G", nom: "Transport", resp: "Yawo Tchalla", cost: 1120000, lignes: 14, need: 82, have: 0, statut: "soumis", renforce: true },
    { l: "H", nom: "Retours", resp: "Akouvi Gbadoé", cost: 0, lignes: 0, need: 0, have: 0, statut: "à venir", inverse: true },
    { l: "I", nom: "Activités", resp: "Elom Fiagbé", cost: 380000, lignes: 31, need: 120, have: 77, statut: "en cours" },
    { l: "J", nom: "Social & divers", resp: "Fifamè Hounkpatin", cost: 210000, lignes: 26, need: 160, have: 94, statut: "en cours" }
  ];

  var POSTES = [
    { id: "ALI", nom: "Alimentaire", prevu: 1940000, reel: 1688400 },
    { id: "TRA", nom: "Transport", prevu: 1120000, reel: 1236000 },
    { id: "MAT", nom: "Matériel", prevu: 520000, reel: 471500 },
    { id: "ACT", nom: "Activités", prevu: 380000, reel: 352000 },
    { id: "TEC", nom: "Technique", prevu: 310000, reel: 298700 },
    { id: "SAN", nom: "Santé", prevu: 240000, reel: 212300 },
    { id: "SOC", nom: "Social & divers", prevu: 210000, reel: 241600 },
    { id: "SAL", nom: "Salubrité", prevu: 130000, reel: 118900 }
  ];

  var PRENOMS = ["Kossi", "Afi", "Komi", "Abla", "Kodjo", "Ama", "Yao", "Akossiwa", "Koffi", "Adjoa", "Mawuli", "Délali", "Edem", "Enyonam",
    "Sélom", "Kafui", "Elom", "Dzifa", "Yawo", "Akouvi", "Kwami", "Essi", "Mawuena", "Ablavi", "Kokou", "Ayaba", "Sèna", "Fifamè",
    "Codjo", "Ahouefa", "Mahougnon", "Gbèto", "Chabi", "Bio", "Sabi", "Orou", "Houénou", "Nadège", "Euloge", "Rodrigue",
    "Prudence", "Fortuné", "Espérance", "Aurore", "Wilfried", "Ghislaine", "Arsène", "Mireille", "Romaric", "Bénédicte"];
  var NOMS = ["Agbodjan", "Amegah", "Adjaho", "Akakpo", "Ayité", "Dossou", "Houngbo", "Kpodo", "Mensah", "Lawson", "Gbadoé", "Tchalla",
    "Atayi", "Sossou", "Agossou", "Hounkpatin", "Zinsou", "Ahouansou", "Tossou", "Dovi", "Fiagbé", "Klutse", "Agbéko", "Adjovi",
    "Amouzou", "Kodjovi", "Assogba", "Hounsou", "Dégbé", "Sodjinou", "Glèlè", "Ahyi", "Djossou", "Akpovi", "Toviho", "Kossouvi"];

  // Générateur déterministe (mêmes noms à chaque chargement)
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var PARTICIPANTS = [];
  for (var i = 0; i < 80; i++) {
    var p = PRENOMS[(rnd() * PRENOMS.length) | 0], n = NOMS[(rnd() * NOMS.length) | 0];
    var u = UNITES[i % UNITES.length];
    // État de paiement : 0 libre (non inscrit) · 1 réservé · 2 partiel · 3 garanti
    PARTICIPANTS.push({ siege: i + 1, prenom: p, nom: n, initiale: n[0] + ".", unite: u.id, etat: 0, paye: 0 });
  }
  // Situation à J-21 : 57 inscrits, dont 38 garantis, 11 partiels, 8 réservés
  var order = PARTICIPANTS.map(function (_, i) { return i; }).sort(function () { return rnd() - 0.5; });
  order.slice(0, 57).forEach(function (idx, k) {
    var e = k < 38 ? 3 : k < 49 ? 2 : 1;
    PARTICIPANTS[idx].etat = e;
    PARTICIPANTS[idx].paye = e === 3 ? 25000 : e === 2 ? 10000 + ((rnd() * 3) | 0) * 2500 : 0;
  });

  var PROGRAMME = [
    { j: 1, date: "05.08", titre: "Arrivée & installation", lieu: "Attikoumé — terrain principal", resp: "Codjo Agossou", unites: "Toutes", h: [["07:30", "Rassemblement & départ en convoi"], ["11:00", "Arrivée, montage des tentes"], ["16:00", "Levée des couleurs d'ouverture"], ["20:30", "Veillée d'accueil"]], materiel: ["Tentes (14)", "Bâches (6)", "Drapeaux Togo · AST · GST"], menu: ["Bouillie de mil & beignets", "Riz sauce arachide", "Pâte de maïs, sauce adémè"] },
    { j: 2, date: "06.08", titre: "Froissartage & constructions", lieu: "Zones d'unités", resp: "Komi Ayité", unites: "Éclaireurs · Guides · Pionniers", h: [["07:00", "Rassemblement, inspection"], ["08:30", "Construction des coins d'unité"], ["15:00", "Concours de portails"], ["20:30", "Veillée chants"]], materiel: ["Cordes 8 mm (240 m)", "Brelages, piquets", "Scies, marteaux"], menu: ["Akassa & sauce", "Ayimolou (haricots-riz)", "Akoumé sauce gombo"] },
    { j: 3, date: "07.08", titre: "Grand jeu de piste", lieu: "Forêt d'Attikoumé", resp: "Elom Fiagbé", unites: "Toutes", h: [["08:00", "Briefing des patrouilles"], ["09:00", "Départ du jeu de piste"], ["14:00", "Énigmes finales"], ["18:00", "Remise des fanions"]], materiel: ["Boussoles (12)", "Cartes IGN", "Sifflets"], menu: ["Bouillie de maïs", "Repas de route : gari, arachides", "Riz gras"] },
    { j: 4, date: "08.08", titre: "Sortie découverte — Togoville", lieu: "Togoville, lac Togo", resp: "Yawo Tchalla", unites: "Toutes", h: [["06:30", "Départ en bus"], ["09:00", "Traversée du lac en pirogue"], ["12:30", "Pique-nique"], ["17:30", "Retour au camp"]], materiel: ["Gilets de sauvetage (80)", "Trousse de secours mobile"], menu: ["Thé & pain", "Repas de route", "Spaghetti sauce tomate"] },
    { j: 5, date: "09.08", titre: "Service communautaire", lieu: "École primaire d'Attikoumé", resp: "Kafui Sossou", unites: "Pionniers · Routiers", h: [["07:30", "Départ à pied"], ["08:00", "Désherbage & peinture"], ["13:00", "Repas partagé"], ["16:00", "Retour, bilan"]], materiel: ["Balais, seaux, bassines", "Peinture (20 L)", "Gants"], menu: ["Bouillie de mil", "Riz sauce arachide", "Fufu sauce graine"] },
    { j: 6, date: "10.08", titre: "Hike — départ", lieu: "Piste vers Kpalimé (étape 1)", resp: "Mawuli Lawson", unites: "Éclaireurs · Guides · Pionniers", h: [["06:00", "Départ du hike"], ["12:00", "Halte & repas de route"], ["17:00", "Bivouac"], ["20:00", "Veillée étoiles"]], materiel: ["Sacs de bivouac (40)", "Lampes frontales", "Réchauds"], menu: ["Repas de route", "Repas de route", "Riz au poisson fumé"] },
    { j: 7, date: "11.08", titre: "Hike — retour", lieu: "Bivouac → camp", resp: "Mawuli Lawson", unites: "Éclaireurs · Guides · Pionniers", h: [["06:30", "Lever du bivouac"], ["12:00", "Halte"], ["16:00", "Retour au camp"], ["20:30", "Récits du hike"]], materiel: ["Lampes frontales", "Trousse de secours mobile"], menu: ["Bouillie", "Repas de route", "Atiéké poisson"] },
    { j: 8, date: "12.08", titre: "Quartier libre", lieu: "Camp", resp: "Chefs d'unité", unites: "Toutes", h: [["09:00", "Grasse matinée accordée"], ["11:00", "Activités libres"], ["18:00", "Rassemblement"]], materiel: ["Ballons, jeux de société"], menu: ["Jour sans cuisine", "Jour sans cuisine", "Jour sans cuisine"], sansCuisine: true },
    { j: 9, date: "13.08", titre: "Secourisme & techniques", lieu: "Ateliers tournants", resp: "Dr Enyonam Atayi", unites: "Toutes", h: [["08:00", "Atelier premiers secours"], ["10:30", "Nœuds & brelages"], ["15:00", "Orientation"], ["20:30", "Veillée contes"]], materiel: ["Mannequin de secourisme", "Bandes, attelles", "Cordelettes"], menu: ["Bouillie & beignets", "Pâte de maïs sauce gombo", "Riz sauce tomate"] },
    { j: 10, date: "14.08", titre: "Journée des délégations", lieu: "Grand terrain", resp: "Fifamè Hounkpatin", unites: "Toutes + invités", h: [["09:00", "Accueil des délégations"], ["11:00", "Expositions"], ["13:00", "Repas de spécialités"], ["16:00", "Échanges culturels"]], materiel: ["Tables (12)", "Sonorisation", "Cadeaux protocolaires"], menu: ["Thé & pain", "Spécialités : amiwo, koklo mémé", "Gboma dessi"], specialite: true },
    { j: 11, date: "15.08", titre: "Olympiades scoutes", lieu: "Grand terrain", resp: "Elom Fiagbé", unites: "Toutes", h: [["08:00", "Cérémonie d'ouverture"], ["09:00", "Épreuves par patrouille"], ["15:00", "Finales"], ["18:00", "Remise des médailles"]], materiel: ["Chronomètres", "Cordes de tir", "Médailles (24)"], menu: ["Bouillie", "Riz gras", "Fufu sauce arachide"] },
    { j: 12, date: "16.08", titre: "Veillée des talents", lieu: "Amphithéâtre naturel", resp: "Ahouefa Zinsou", unites: "Toutes", h: [["09:00", "Répétitions"], ["15:00", "Préparation du décor"], ["20:00", "Veillée des talents"]], materiel: ["Djembés (6)", "Sonorisation", "Projecteurs"], menu: ["Bouillie & beignets", "Ayimolou", "Riz sauce arachide"] },
    { j: 13, date: "17.08", titre: "Feu de camp & promesses", lieu: "Cercle du feu", resp: "Codjo Agossou", unites: "Toutes", h: [["10:00", "Préparation du feu"], ["16:00", "Cérémonie des promesses"], ["20:00", "Grand feu de camp"]], materiel: ["Bois (2 stères)", "Seaux d'eau (sécurité)", "Foulards (14)"], menu: ["Bouillie", "Repas de fête", "Koklo mémé & frites d'igname"] },
    { j: 14, date: "18.08", titre: "Remise en état & départ", lieu: "Attikoumé → Lomé", resp: "Akouvi Gbadoé", unites: "Toutes", h: [["06:30", "Démontage"], ["10:00", "Pointage de retour"], ["12:00", "Levée des couleurs de clôture"], ["14:00", "Départ en convoi"]], materiel: ["Sacs poubelles", "Inventaire de retour"], menu: ["Thé & pain", "Repas de route", "—"] }
  ];

  var PLATS = [
    { id: "p1", nom: "Akoumé sauce gombo", service: "midi", ing: ["farine de maïs", "gombo", "poisson fumé", "piment"], prop: 34, sel: 61 },
    { id: "p2", nom: "Riz sauce arachide", service: "midi", ing: ["riz", "pâte d'arachide", "poulet", "tomate"], prop: 22, sel: 74 },
    { id: "p3", nom: "Ayimolou", service: "midi", ing: ["riz", "haricots", "huile rouge", "gari"], prop: 41, sel: 58 },
    { id: "p4", nom: "Fufu sauce graine", service: "soir", ing: ["igname", "noix de palme", "viande de bœuf"], prop: 18, sel: 49 },
    { id: "p5", nom: "Spaghetti sauce tomate", service: "soir", ing: ["spaghetti", "tomate", "oignon", "sardine"], prop: 47, sel: 66 },
    { id: "p6", nom: "Atiéké poisson", service: "soir", ing: ["atiéké", "poisson braisé", "oignon", "piment"], prop: 29, sel: 52 },
    { id: "p7", nom: "Bouillie de mil & beignets", service: "matin", ing: ["mil", "sucre", "farine", "huile"], prop: 12, sel: 70 },
    { id: "p8", nom: "Amiwo", service: "midi", ing: ["farine de maïs", "tomate", "poulet", "épices"], prop: 26, sel: 37 },
    { id: "p9", nom: "Gboma dessi", service: "soir", ing: ["épinards gboma", "poisson", "tomate", "pâte"], prop: 9, sel: 28 }
  ];

  var DEPENSES = [
    { t: "Sacs de riz 50 kg × 6", poste: "ALI", act: "J.02 — Cuisine", m: 192000, h: "09:12", ico: "utensils", par: "Abla D." },
    { t: "Carburant convoi", poste: "TRA", act: "J.04 — Sortie Togoville", m: 86500, h: "06:41", ico: "truck", par: "Yawo T." },
    { t: "Location pirogues", poste: "ACT", act: "J.04 — Sortie Togoville", m: 60000, h: "09:20", ico: "map-pin", par: "Elom F." },
    { t: "Sachets d'eau × 480", poste: "ALI", act: "J.04 — Intendance", m: 12000, h: "11:05", ico: "droplet", par: "Abla D." },
    { t: "Pharmacie — antiseptiques", poste: "SAN", act: "J.03 — Jeu de piste", m: 14500, h: "15:48", ico: "heart-pulse", par: "Enyonam A." }
  ];

  /* Dépense cumulée par jour (milliers de F CFA) — prévu vs réel */
  var COURBE = {
    prevu: [520, 860, 1180, 1560, 1840, 2160, 2480, 2700, 3010, 3380, 3720, 4080, 4460, 4850],
    reel: [610, 910, 1210, 1690, 1930, 2290, 2620, 2780, 3090, 3470, 3790, 4150, 4520, 4619]
  };

  window.GST_DATA = { CAMP: CAMP, UNITES: UNITES, GROUPES: GROUPES, POSTES: POSTES, PARTICIPANTS: PARTICIPANTS, PROGRAMME: PROGRAMME, PLATS: PLATS, DEPENSES: DEPENSES, COURBE: COURBE, PRENOMS: PRENOMS, NOMS: NOMS };
})();
