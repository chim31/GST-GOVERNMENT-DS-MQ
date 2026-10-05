/* GST GOVERNMENT — MVP · Cœur
   État, calcul continu (chaîne de chiffrage), droits, journal, hors ligne, routeur.
   « Un chiffre naît en un seul endroit et circule » (ENF-12) : tous les totaux
   sont dérivés à la lecture, jamais recopiés. */
(function () {
  "use strict";
  var G = window.GST, S = window.GST_SEED, D = window.GST_DATA;
  var APP = (window.APP = { views: {}, routes: [] });
  var KEY = "gst-mvp-v1";

  /* ══ Utilitaires ═══════════════════════════════════════════════════════ */
  var esc = (APP.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); });
  APP.ico = function (n, cls) { return '<svg class="gst-icon ' + (cls || "") + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; };
  APP.f = function (n) { return G.fmt(n || 0); };
  APP.cfa = function (n) { return G.fmt(n || 0) + " F CFA"; };
  APP.pct = function (n, d) { return (d ? Math.round((n / d) * 1000) / 10 : 0).toString().replace(".", ",") + " %"; };
  APP.uid = function (p) { return (p || "x") + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  APP.clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  APP.initials = function (p) { return p ? (p.prenom[0] + p.nom[0]).toUpperCase() : "?"; };

  /* Dates (chaînes ISO AAAA-MM-JJ, sans fuseau) */
  var MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  var JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  function pd(s) { var a = s.split("-"); return new Date(Date.UTC(+a[0], +a[1] - 1, +a[2])); }
  function iso(d) { return d.toISOString().slice(0, 10); }
  APP.addDays = function (s, n) { var d = pd(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  APP.diffDays = function (a, b) { return Math.round((pd(b) - pd(a)) / 864e5); };
  APP.dshort = function (s) { var a = s.split("-"); return a[2] + "." + a[1] + "." + a[0].slice(2); };
  APP.ddm = function (s) { var a = s.split("-"); return a[2] + "." + a[1]; };
  APP.dlong = function (s) { var d = pd(s); return d.getUTCDate() + " " + MOIS[d.getUTCMonth()] + " " + d.getUTCFullYear(); };
  APP.dday = function (s) { var d = pd(s); return JOURS[d.getUTCDay()] + " " + d.getUTCDate() + " " + MOIS[d.getUTCMonth()]; };
  APP.jj = function (n) { return "J." + String(n).padStart(2, "0"); };

  /* Générateur déterministe */
  var seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function pick(a) { return a[(rnd() * a.length) | 0]; }

  /* ══ Construction de l'état initial ════════════════════════════════════ */
  function build() {
    seed = 11;
    var st = { v: 1, today: S.today, online: true, queue: [], session: null, camp: "r26", journal: [], notifs: [], hook: [], seq: 1 };

    /* Base de prix */
    st.articles = S.ARTICLES.map(function (a) {
      var hist = [];
      var old = Math.round(a[4] * (0.9 + rnd() * 0.06) / 5) * 5;
      hist.push({ id: APP.uid("px"), montant: old, marche: a[6], date: APP.addDays(a[7], -380), source: "Carnet camp précédent", statut: "validé" });
      hist.push({ id: APP.uid("px"), montant: a[4], marche: a[6], date: a[7], source: "Relevé terrain", statut: "validé" });
      return { id: a[0], nom: a[1], cat: a[2], unite: a[3], perissable: !!a[5], prix: hist };
    });

    /* Personnes */
    st.personnes = S.STAFF.map(function (s) {
      return { id: s[0], prenom: s[1], nom: s[2], unite: s[4], naissance: s[5], encadrant: true, fonction: s[3],
        tel: "+228 9" + ((rnd() * 9) | 0) + " " + (10 + ((rnd() * 89) | 0)) + " " + (10 + ((rnd() * 89) | 0)) + " " + (10 + ((rnd() * 89) | 0)),
        urgence: pick(S.PRENOMS) + " " + s[2] + " · +228 9" + ((rnd() * 9) | 0) + " 4" + ((rnd() * 9) | 0) + " 22 1" + ((rnd() * 9) | 0),
        sanitaire: { allergies: rnd() < 0.15 ? ["Pénicilline"] : [], traitements: "", antecedents: "" }, camps: [] };
    });
    var unitIds = S.UNITES.map(function (u) { return u.id; });
    var ages = { LOU: [2015, 2018], JEA: [2015, 2018], ECL: [2011, 2014], GUI: [2011, 2014], PIO: [2008, 2011], ROU: [2001, 2008] };
    var allergenes = ["arachide", "poisson", "lait", "gluten", "oeuf"];
    for (var i = 0; i < 104; i++) {
      var u = unitIds[i % 6], y = ages[u][0] + ((rnd() * (ages[u][1] - ages[u][0] + 1)) | 0);
      var nom = pick(S.NOMS), al = rnd() < 0.12 ? [pick(allergenes)] : [];
      st.personnes.push({ id: "p-j" + i, prenom: pick(S.PRENOMS), nom: nom, unite: u,
        naissance: y + "-" + String(1 + ((rnd() * 12) | 0)).padStart(2, "0") + "-" + String(1 + ((rnd() * 28) | 0)).padStart(2, "0"),
        tel: "", urgence: pick(S.PRENOMS) + " " + nom + " (parent) · +228 9" + ((rnd() * 9) | 0) + " " + (10 + ((rnd() * 89) | 0)) + " 3" + ((rnd() * 9) | 0) + " 0" + ((rnd() * 9) | 0),
        sanitaire: { allergies: al, traitements: rnd() < 0.06 ? "Ventoline (asthme)" : "", antecedents: rnd() < 0.05 ? "Drépanocytose AS" : "", regime: rnd() < 0.08 ? "Sans porc" : "" }, camps: [] });
    }
    st.personnes.push({ id: "p-selom", prenom: "Sélom", nom: "Akakpo", unite: "ECL", naissance: "2012-04-09", tel: "", urgence: "Mawuena Akakpo (mère) · +228 90 45 12 78",
      sanitaire: { allergies: ["arachide"], traitements: "", antecedents: "", regime: "" }, camps: [] });
    st.personnes.push({ id: "p-mawuena", prenom: "Mawuena", nom: "Akakpo", unite: null, naissance: "1981-09-02", tel: "+228 90 45 12 78", urgence: "", parentDe: ["p-selom"], externe: true,
      sanitaire: { allergies: [], traitements: "", antecedents: "" }, camps: [] });
    st.unites = APP.clone(S.UNITES);

    /* Inventaire permanent */
    st.inventaire = S.INVENTAIRE.map(function (r, k) {
      return { id: "inv" + (k + 1), art: r[0], qte: r[1], etat: r[2], loc: r[3], det: r[4], sortie: null,
        hist: [{ d: "2024-03-10", t: "Achat — " + r[1] + " unité(s)" }, { d: "2025-08-20", t: "Retour du camp Réjouissance 2025 — " + r[2] }] };
    });
    st.fournisseurs = APP.clone(S.FOURNISSEURS);
    st.references = APP.clone(S.REFERENCES);
    st.plats = APP.clone(S.PLATS).map(function (p) { p.statut = "validé"; return p; });
    st.hook = S.HOOK.map(function (h) { return Object.assign({ statut: "suggestion" }, h); });
    st.comptes = APP.clone(S.COMPTES);
    st.roles = {}; // attribution des rôles par camp : st.roles[camp][personId] = [rôles]

    /* Camps */
    st.camps = [campR26(st), campK26(st), campS26(st)];
    st.camps.forEach(function (c) {
      st.roles[c.id] = {};
      S.STAFF.forEach(function (s) { st.roles[c.id][s[0]] = [s[3]]; });
      (c.inscriptions || []).forEach(function (ins) { var p = person(st, ins.person); if (p && p.camps.indexOf(c.id) < 0) p.camps.push(c.id); });
    });
    // Un même individu, deux rôles selon le camp (M0.1)
    st.roles.k26["p-kafui"] = ["respgroupe:E", "participant"];
    st.roles.s26["p-yawo"] = ["participant"];

    /* Journal d'activité initial */
    var J = [
      ["2026-07-15T18:20", "p-codjo", "r26", "Budget", "Version A gelée", "", "4 812 600 F CFA"],
      ["2026-07-28T09:02", "p-komi", "r26", "Recensement A — Matériel", "Statut", "soumis", "validé"],
      ["2026-08-05T09:12", "p-abla", "r26", "Dépense", "Sacs de riz 50 kg × 6", "", "192 000"],
      ["2026-08-07T15:48", "p-essi", "r26", "Dépense", "Montant · Pharmacie — antiseptiques", "15 400", "14 500"],
      ["2026-08-09T21:30", "p-essi", "r26", "Comptes du jour", "Arrêt de journée J.05", "ouverte", "close"],
      ["2026-08-09T10:15", "p-yawo", "k26", "Recensement G — Transport", "Ligne · Location bus 70 places", "1", "2"],
      ["2026-08-10T07:40", "p-ama", "r26", "Cuisine live", "Stock · Riz local (kg)", "164", "142"]
    ];
    st.journal = J.map(function (j, k) { return { id: "jr" + k, t: j[0], auteur: j[1], camp: j[2], objet: j[3], champ: j[4], avant: j[5], apres: j[6] }; }).reverse();
    return st;
  }

  function person(st, id) { for (var i = 0; i < st.personnes.length; i++) if (st.personnes[i].id === id) return st.personnes[i]; return null; }

  /* Lignes de recensement depuis un gabarit */
  function linesFrom(gab, dispoFn) {
    return (gab || []).map(function (r, k) {
      return { id: APP.uid("l"), cat: r[0], art: r[1], mode: r[2], q: r[3], inv: !!r[4], seuil: r[5] || 0, jour: r[6] || 0, dispo: dispoFn ? dispoFn(r, k) : 0 };
    });
  }
  function groupes(type, opts) {
    var T = S.TYPES[type], out = {};
    "ABCDEFGHIJ".split("").forEach(function (L) {
      var open = T.groupes.indexOf(L) > -1;
      var g = { open: open, resp: null, statut: open ? "en cours" : "fermé", lignes: [] };
      if (S.GABARITS[L]) g.lignes = linesFrom(S.GABARITS[L], opts && opts.dispo);
      out[L] = g;
    });
    out.B.manuel = []; out.B.marge = 5; out.B.eauTech = 1.5; out.B.source = "menu";
    out.G.lignes = []; out.G.itineraires = []; out.G.chargement = {};
    out.D.respSante = null; out.D.structure = ""; out.D.evacuation = ""; out.D.contacts = [];
    out.E.remise = "";
    out.H.pointage = {}; out.H.publie = false;
    out.F.statut = "consolidé";
    return out;
  }
  var RESP = { A: "p-komi", B: "p-abla", C: "p-edem", D: "p-enyonam", E: "p-kafui", F: "p-codjo", G: "p-yawo", H: "p-akouvi", I: "p-elom", J: "p-fifame" };

  /* Inscriptions : versements → état du siège (dérivé) */
  function inscrire(st, camp, n, du, mix) {
    var jeunes = st.personnes.filter(function (p) { return !p.encadrant && !p.externe && p.id !== "p-selom"; });
    var offset = camp.id === "k26" ? 30 : 0, list = [];
    if (camp.id !== "s26") list.push("p-selom");
    for (var i = 0; list.length < n; i++) list.push(jeunes[(i + offset) % jeunes.length].id);
    var seats = []; for (var s = 1; s <= camp.places; s++) seats.push(s);
    for (s = seats.length - 1; s > 0; s--) { var r = (rnd() * (s + 1)) | 0, tmp = seats[s]; seats[s] = seats[r]; seats[r] = tmp; }
    return list.map(function (pid, k) {
      var e = k < mix[0] ? 3 : k < mix[0] + mix[1] ? 2 : 1, v = [];
      var d0 = APP.addDays(camp.du, -40 + ((rnd() * 25) | 0));
      if (pid === "p-selom" && camp.id === "k26") e = 2;
      if (e === 3) v.push({ id: APP.uid("v"), date: d0, montant: du, mode: rnd() < 0.7 ? "Espèces" : "Mobile money" });
      if (e === 2) v.push({ id: APP.uid("v"), date: d0, montant: 10000 + ((rnd() * 3) | 0) * 2500, mode: "Espèces" });
      v.forEach(function (x, j) { x.recu = "R-" + camp.id.toUpperCase() + "-" + String(k + 1).padStart(3, "0") + (j ? "-" + j : ""); });
      return { id: APP.uid("ins"), person: pid, siege: seats[k], date: d0, versements: v, docs: { auto: rnd() < (camp.id === "k26" ? 0.78 : 1), sanitaire: rnd() < (camp.id === "k26" ? 0.85 : 1), assurance: rnd() < (camp.id === "k26" ? 0.9 : 1) } };
    });
  }

  function programmeR26() {
    return D.PROGRAMME.map(function (p) {
      return { j: p.j, titre: p.titre, lieu: p.lieu, resp: p.resp, unites: p.unites, sansCuisine: !!p.sansCuisine,
        acts: p.h.map(function (h, k) { return { id: "a" + p.j + "-" + k, h: h[0], titre: h[1], lieu: p.lieu, resp: p.resp, unites: p.unites, desc: "" }; }),
        cr: p.j < 6 ? ["Journée réussie, toutes les unités présentes. ", "Météo clémente, beaucoup d'entrain. ", "Une petite pluie en fin d'après-midi, rien de grave. ", "Les jeunes ont adoré la pirogue — un seul gilet oublié au retour. ", "L'école a été entièrement repeinte. Le directeur a remercié le groupe."][p.j - 1] : "",
        photos: p.j < 6 ? 3 + (p.j % 3) : 0 };
    });
  }

  function campR26(st) {
    var c = { id: "r26", nom: "Camp de Réjouissance 2026", court: "Réjouissance 2026", type: "rejouissance", du: "2026-08-05", au: "2026-08-18", lieu: "Attikoumé",
      enveloppe: 5800000, inscription: 25000, places: 80, statut: "en cours", unites: ["LOU", "JEA", "ECL", "GUI", "PIO", "ROU"],
      encadrement: ["p-codjo", "p-komi", "p-abla", "p-essi", "p-ama", "p-yao", "p-enyonam", "p-kossi", "p-afi", "p-delali", "p-sena", "p-mawuli", "p-kodjo", "p-adjoa"],
      modules: { roadmap: true, inscription: true, bus: true }, seuilDouble: 100000, delaiAvance: 2, devise: "XOF" };
    c.groupes = groupes("rejouissance", { dispo: function (r) { return r[4] ? 0 : (rnd() < 0.3 ? Math.round(r[3] * 0.3) : 0); } });
    "ABCDEGHIJ".split("").forEach(function (L) { c.groupes[L].resp = RESP[L]; c.groupes[L].statut = "validé"; });
    c.groupes.F.resp = RESP.F; c.groupes.H.statut = "à venir";
    c.groupes.D.respSante = "p-enyonam"; c.groupes.D.structure = "CMS d'Attikoumé — 4 km · ambulance du district : +228 23 30 11 15";
    c.groupes.D.evacuation = "1. Premiers soins par l'infirmière du camp. 2. Appel au CMS d'Attikoumé. 3. Évacuation en pick-up du camp (clé chez Yawo T.), accompagnée d'un chef. 4. Prévenir le chef de groupe et la famille.";
    c.groupes.D.contacts = [["CMS d'Attikoumé", "+228 23 30 11 15"], ["Pompiers", "118"], ["Dr Enyonam Atayi", "+228 90 77 21 04"]];
    c.groupes.E.remise = "Démontage J.14 matin · trous de latrines rebouchés et chaulés · tri des déchets (plastiques ramenés à Lomé) · feux éteints et cendres enterrées · état des lieux avec le propriétaire, M. Adjovi, à 11 h.";
    c.groupes.G.lignes = linesFrom([["Véhicules", "bus70", "fixe", 1, 0], ["Véhicules", "bus30", "fixe", 1, 0], ["Véhicules", "camion", "fixe", 1, 0], ["Véhicules", "pickup", "jour", 1, 0],
      ["Carburant", "gasoil", "fixe", 160, 0], ["Chauffeurs", "chauffeur", "jour", 1, 0], ["Péages & stationnement", "peage", "fixe", 8, 0], ["Péages & stationnement", "parking", "jour", 1, 0]]);
    c.groupes.G.itineraires = [
      { id: "it1", de: "Local GST — Bè, Lomé", a: "Attikoumé", etapes: "Tsévié (pause)", km: 88, duree: "2 h 15", date: "2026-08-05", h: "07:30", rdv: "Parking de l'église de Bè", resp: "p-yawo", type: "Aller — convoi principal" },
      { id: "it2", de: "Local GST — Bè, Lomé", a: "Attikoumé", etapes: "—", km: 88, duree: "2 h 30", date: "2026-08-04", h: "14:00", rdv: "Local GST", resp: "p-koffi", type: "Expédition matériel (camion)" },
      { id: "it3", de: "Attikoumé", a: "Togoville", etapes: "Embarcadère du lac", km: 46, duree: "1 h 10", date: "2026-08-08", h: "06:30", rdv: "Entrée du camp", resp: "p-yawo", type: "Sortie intermédiaire" },
      { id: "it4", de: "Attikoumé", a: "Local GST — Bè, Lomé", etapes: "Tsévié", km: 88, duree: "2 h 15", date: "2026-08-18", h: "14:00", rdv: "Cercle du feu", resp: "p-yawo", type: "Retour" }
    ];
    c.groupes.G.planB = "Si le bus ne vient pas : Rakieta Transport (+228 99 40 51 77) peut fournir un 70 places sous 3 h ; sinon rotations du minibus (3 trajets).";
    c.groupes.D.planB = "Rupture de pharmacie : Pharmacie de Tsévié (25 km), commande par téléphone, livraison par taxi-moto.";
    c.groupes.B.planB = "Fournisseur de vivres défaillant : achat direct au marché d'Attikoumé (mercredi et samedi).";
    c.groupes.I.lignes.forEach(function (l) { l.dispo = l.inv ? 0 : 0; });

    c.inscriptions = inscrire(st, c, 66, 25000, [58, 6, 2]);
    c.programme = programmeR26();
    c.menu = { arrete: true, transmis: true, dateArret: "2026-07-08", cloture: "2026-07-06",
      jours: [["m3", "d5", "s2"], ["m1", "d1", "s5"], ["m2", "r1", "s3"], ["m3", "r1", "s2"], ["m1", "d2", "s1"], ["m6", "r1", "s7"], ["m7", "r1", "s3"],
        ["off", "off", "off"], ["m1", "d6", "s4"], ["m3", "d4", "s8"], ["m2", "d5", "s1"], ["m1", "d3", "s2"], ["m2", "f1", "s6"], ["m3", "r1", "off"]],
      choix: null };
    c.live = {
      stock: { riz: 142, mais: 96, mil: 18, gari: 40, igname: 120, spag: 22, haricot: 30, haricotr: 6, arachide: 0, arachg: 9, palme: 20, gombo: 8, gboma: 12, tomate: 25, tomconc: 140, oignon: 18, piment: 3, huile: 34, huiler: 12,
        poulet: 0, boeuf: 9, poissonf: 6, poisson: 14, sardine: 120, oeuf: 60, lait: 4, sucre: 26, the: 18, cafe: 4, pain: 0, beurre: 2, atieke: 0, plantain: 14, akassa: 0, epices: 2, farine: 9, fruits: 0 },
      votes: { matin: { m1: 21, m7: 9, m3: 0 }, midi: { d6: 18, d10: 14, d3: 11 }, soir: { s7: 24, s9: 9, s4: 12 } },
      monVote: {},
      servis: [
        { j: 1, s: "midi", plat: "d5", prevues: 80, servies: 78 }, { j: 1, s: "soir", plat: "s2", prevues: 80, servies: 74 },
        { j: 2, s: "matin", plat: "m1", prevues: 80, servies: 77 }, { j: 2, s: "midi", plat: "d1", prevues: 80, servies: 69 }, { j: 2, s: "soir", plat: "s5", prevues: 80, servies: 79 },
        { j: 3, s: "matin", plat: "m2", prevues: 80, servies: 75 }, { j: 3, s: "midi", plat: "r1", prevues: 80, servies: 80 }, { j: 3, s: "soir", plat: "s3", prevues: 80, servies: 76 },
        { j: 4, s: "matin", plat: "m3", prevues: 80, servies: 80 }, { j: 4, s: "midi", plat: "r1", prevues: 80, servies: 80 }, { j: 4, s: "soir", plat: "s2", prevues: 80, servies: 71 },
        { j: 5, s: "matin", plat: "m1", prevues: 80, servies: 78 }, { j: 5, s: "midi", plat: "d2", prevues: 80, servies: 73 }, { j: 5, s: "soir", plat: "s1", prevues: 80, servies: 64 },
        { j: 6, s: "matin", plat: "m6", prevues: 80, servies: 79 }
      ] };
    c.budget = { validation: "approuvé", circuit: [
      { d: "2026-07-12", who: "p-codjo", t: "Soumis par le groupe Économique" }, { d: "2026-07-14", who: "p-essi", t: "Avis favorable de la trésorière" }, { d: "2026-07-15", who: "p-codjo", t: "Approuvé par le chef de groupe" }],
      ajust: [{ id: "aj1", poste: "TRA", delta: 60000, just: "Hausse du gasoil annoncée début juillet", by: "p-yawo", d: "2026-07-10" }],
      versions: [] };
    c.depenses = depensesR26();
    c.entrees = [
      { id: "e1", type: "Subvention", libelle: "Subvention du District Golfe", montant: 600000, date: "2026-07-20", mode: "Virement", recu: "R-R26-S01" },
      { id: "e2", type: "Don", libelle: "Don de l'Association des parents", montant: 150000, date: "2026-07-25", mode: "Espèces", recu: "R-R26-D01" },
      { id: "e3", type: "Cotisation", libelle: "Cotisations des chefs (14 × 5 000)", montant: 70000, date: "2026-07-30", mode: "Espèces", recu: "R-R26-C01" },
      { id: "e4", type: "Recette d'activité", libelle: "Vente de t-shirts du camp", montant: 45000, date: "2026-08-07", mode: "Espèces", recu: "R-R26-A01" },
      { id: "e5", type: "Subvention", libelle: "Ministère de la Jeunesse — appui aux camps de vacances", montant: 1500000, date: "2026-07-18", mode: "Virement", recu: "R-R26-S02" },
      { id: "e6", type: "Don", libelle: "Partenaire — Brasserie du Bénin, vivres et eau (valorisés)", montant: 900000, date: "2026-07-28", mode: "Virement", recu: "R-R26-D02" },
      { id: "e7", type: "Cotisation", libelle: "Fonds propres du groupe (réserves 2025)", montant: 700000, date: "2026-07-01", mode: "Virement", recu: "R-R26-C02" }
    ];
    c.avances = [
      { id: "av1", benef: "p-yawo", montant: 120000, motif: "Carburant & péages — sortie Togoville", date: "2026-08-08", justif: [{ dep: "d-tra4", montant: 86500 }], rendu: 33500, statut: "justifiée" },
      { id: "av2", benef: "p-elom", montant: 80000, motif: "Lots et fournitures — grand jeu de piste", date: "2026-08-07", justif: [], rendu: 0, statut: "ouverte" },
      { id: "av3", benef: "p-abla", montant: 150000, motif: "Vivres frais du marché d'Attikoumé", date: "2026-08-10", justif: [], rendu: 0, statut: "ouverte" }
    ];
    c.fondsCaisse = 900000;
    c.caisse = [{ j: 1, e: 0, comment: "" }, { j: 2, e: 0, comment: "" }, { j: 3, e: -500, comment: "Pièce de 500 introuvable — écart accepté au conseil" }, { j: 4, e: 0, comment: "" }, { j: 5, e: 0, comment: "" }];
    c.arrets = { 0: { d: "2026-08-04T20:00", by: "p-essi" }, 1: { d: "2026-08-05T21:10", by: "p-essi" }, 2: { d: "2026-08-06T21:30", by: "p-essi" }, 3: { d: "2026-08-07T21:05", by: "p-essi" }, 4: { d: "2026-08-08T21:40", by: "p-essi" }, 5: { d: "2026-08-09T21:30", by: "p-essi" } };
    c.devis = [
      { id: "dv1", poste: "Location bus 70 places — aller-retour", g: "G", offres: [{ f: "f1", m: 380000 }, { f: "f2", m: 410000 }, { f: "f3", m: 395000 }], retenu: "f1", commande: "livré" },
      { id: "dv2", poste: "Riz local — 12 sacs de 50 kg", g: "B", offres: [{ f: "f4", m: 384000 }, { f: "f5", m: 372000 }], retenu: "f5", commande: "livré" }
    ];
    c.retours = null;
    return c;
  }

  function depensesR26() {
    var L = [
      // [jour, poste, activité, libellé, montant, bénéficiaire, mode, heure, par, ico]
      [0, "ALI", "int", "Riz local — 12 sacs de 50 kg", 372000, "Mama Ablavi (Adakpamé)", "Espèces", "10:05", "p-abla", "utensils"],
      [0, "ALI", "int", "Vivres secs (huile, sucre, concentré, sardines)", 418000, "Ets Dzidzo", "Virement", "11:40", "p-abla", "utensils"],
      [0, "TRA", "a1-0", "Acompte location bus 70 places", 190000, "Transports Kpalimé Express", "Virement", "09:00", "p-yawo", "bus"],
      [0, "TRA", "a1-0", "Location camion — expédition matériel", 160000, "Transports Kpalimé Express", "Virement", "14:00", "p-yawo", "truck"],
      [0, "MAT", "int", "Tentes 6 places × 4", 340000, "Quincaillerie Assivito", "Virement", "15:20", "p-komi", "tent"],
      [0, "MAT", "int", "Bâches, cordes, clous", 64500, "Quincaillerie Assivito", "Espèces", "15:40", "p-komi", "hammer"],
      [0, "SAN", "int", "Pharmacie de camp — commande", 168000, "Pharmacie du Golfe", "Virement", "10:30", "p-enyonam", "heart-pulse"],
      [0, "SOC", "int", "T-shirts du camp × 80", 280000, "Atelier GST", "Espèces", "16:00", "p-fifame", "users"],
      [0, "SAL", "int", "Produits d'hygiène et de nettoyage", 78400, "Grossiste Bè", "Espèces", "12:10", "p-kafui", "droplet"],
      [0, "TEC", "int", "Essence groupe électrogène (140 L)", 95200, "Station Total Agoè", "Espèces", "17:30", "p-edem", "zap"],
      [1, "TRA", "a1-0", "Solde location bus 70 places", 190000, "Transports Kpalimé Express", "Espèces", "07:20", "p-yawo", "bus"],
      [1, "TRA", "a1-0", "Minibus 30 places — aller", 95000, "STM Voyages", "Espèces", "07:25", "p-yawo", "bus"],
      [1, "ALI", "int", "Sachets d'eau × 960", 24000, "Grossiste Bè", "Espèces", "11:10", "p-abla", "droplet"],
      [1, "ALI", "a1-1", "Vivres frais — arrivée", 46500, "Marché d'Attikoumé", "Espèces", "12:30", "p-abla", "utensils"],
      [1, "TEC", "int", "Location groupe électrogène (14 j)", 168000, "Station Total Agoè", "Virement", "13:00", "p-edem", "zap"],
      [1, "MAT", "a1-2", "Sonorisation — cérémonie d'ouverture", 15000, "Sono Évasion", "Espèces", "15:30", "p-komi", "zap"],
      [2, "ALI", "int", "Sachets d'eau × 480", 12000, "Grossiste Bè", "Espèces", "08:40", "p-abla", "droplet"],
      [2, "ALI", "a2-1", "Poisson fumé & gombo", 38500, "Marché d'Attikoumé", "Espèces", "09:20", "p-abla", "utensils"],
      [2, "MAT", "a2-1", "Cordes 8 mm — complément 60 m", 9000, "Quincaillerie d'Attikoumé", "Espèces", "10:00", "p-komi", "hammer"],
      [2, "ACT", "a2-2", "Lots du concours de portails", 22000, "Boutique Dodji", "Espèces", "14:30", "p-elom", "star"],
      [3, "ALI", "int", "Sachets d'eau × 480", 12000, "Grossiste Bè", "Espèces", "08:10", "p-abla", "droplet"],
      [3, "ALI", "a3-1", "Repas de route — gari, arachides", 33600, "Marché d'Attikoumé", "Espèces", "07:30", "p-abla", "utensils"],
      [3, "ACT", "a3-1", "Cartes IGN & boussoles", 36000, "Institut géographique", "Espèces", "08:00", "p-elom", "compass"],
      [3, "SAN", "a3-2", "Pharmacie — antiseptiques", 14500, "Pharmacie de Tsévié", "Espèces", "15:48", "p-enyonam", "heart-pulse"],
      [3, "SOC", "a3-3", "Fanions de patrouille", 30000, "Atelier GST", "Espèces", "17:40", "p-fifame", "flag"],
      [4, "TRA", "a4-0", "Carburant convoi Togoville", 86500, "Station d'Attikoumé", "Espèces", "06:41", "p-yawo", "truck", "d-tra4"],
      [4, "ACT", "a4-1", "Location pirogues", 60000, "Embarcadère de Togoville", "Espèces", "09:20", "p-elom", "map-pin"],
      [4, "ACT", "a4-1", "Gilets de sauvetage × 80", 40000, "Embarcadère de Togoville", "Espèces", "09:25", "p-elom", "map-pin"],
      [4, "ACT", "a4-1", "Droits d'entrée — sanctuaire", 80000, "Office du tourisme", "Espèces", "10:15", "p-elom", "ticket"],
      [4, "ALI", "int", "Sachets d'eau × 480", 12000, "Grossiste Bè", "Espèces", "11:05", "p-abla", "droplet"],
      [4, "ALI", "a4-2", "Pique-nique — pain, sardines", 42000, "Boulangerie de Togoville", "Espèces", "12:00", "p-abla", "utensils"],
      [5, "ACT", "a5-1", "Peinture 20 L × 2 + pinceaux", 59500, "Quincaillerie Assivito", "Espèces", "07:50", "p-elom", "hammer"],
      [5, "ALI", "int", "Sachets d'eau × 480", 12000, "Grossiste Bè", "Espèces", "08:30", "p-abla", "droplet"],
      [5, "ALI", "a5-2", "Viande de bœuf & noix de palme", 64000, "Marché d'Attikoumé", "Espèces", "09:10", "p-abla", "utensils"],
      [5, "SAL", "a5-1", "Gants & sacs poubelle", 18500, "Grossiste Bè", "Espèces", "16:20", "p-kafui", "droplet"],
      [6, "ALI", "int", "Sachets d'eau × 480", 12000, "Grossiste Bè", "Espèces", "07:45", "p-abla", "droplet"],
      [6, "ALI", "a6-1", "Repas de route — hike", 44800, "Marché d'Attikoumé", "Espèces", "06:20", "p-abla", "utensils"],
      [6, "TEC", "a6-0", "Piles & lampes frontales (hike)", 21000, "Boutique Dodji", "Espèces", "05:50", "p-edem", "zap"]
    ];
    var r26du = "2026-08-05";
    return L.map(function (r, k) {
      var d = { id: r[10] || "d" + (k + 1), jour: r[0], poste: r[1], act: r[2], libelle: r[3], montant: r[4], benef: r[5], mode: r[6], h: r[7], par: r[8], ico: r[9],
        date: APP.addDays(r26du, r[0] - 1), photo: k % 5 !== 3, sig: [r[8]] };
      if (d.montant > 100000) d.sig = k === 14 ? [r[8]] : [r[8], "p-essi"];
      if (d.id === "d-tra4") d.avance = "av1";
      return d;
    });
  }

  function campK26(st) {
    var c = { id: "k26", nom: "Jamboree national — Kara 2026", court: "Jamboree Kara 2026", type: "jamboree", du: "2026-10-15", au: "2026-10-27", lieu: "Kara — site scout de Landa",
      enveloppe: 6500000, inscription: 35000, places: 80, statut: "préparation", unites: ["ECL", "GUI", "PIO", "ROU"],
      encadrement: ["p-codjo", "p-komi", "p-abla", "p-essi", "p-ama", "p-yao", "p-enyonam", "p-edem", "p-kafui", "p-yawo", "p-akouvi", "p-elom", "p-fifame", "p-delali", "p-sena", "p-mawuli", "p-kodjo", "p-adjoa", "p-ahouefa", "p-gbeto", "p-koffi", "p-kossi", "p-afi"],
      modules: { roadmap: true, inscription: true, bus: true }, seuilDouble: 100000, delaiAvance: 2, devise: "XOF" };
    c.groupes = groupes("jamboree", { dispo: function (r) { return r[4] ? 0 : 0; } });
    var st8 = { A: "soumis", B: "en cours", C: "validé", D: "en cours", E: "en cours", G: "soumis", H: "à venir", I: "en cours", J: "en cours" };
    "ABCDEGHIJ".split("").forEach(function (L) { c.groupes[L].resp = RESP[L]; c.groupes[L].statut = st8[L]; });
    c.groupes.F.resp = RESP.F;
    c.groupes.D.respSante = null; // blocage visible (M1.6)
    c.groupes.D.structure = "Hôpital régional de Kara — 6 km";
    c.groupes.B.source = "manuel";
    c.groupes.B.manuel = [
      { id: "bm1", cat: "Estimation (base de références)", art: "riz", mode: "persjour", q: 0.3, dispo: 0 },
      { id: "bm2", cat: "Estimation (base de références)", art: "mais", mode: "persjour", q: 0.25, dispo: 0 },
      { id: "bm3", cat: "Estimation (base de références)", art: "poulet", mode: "persjour", q: 0.08, dispo: 0 },
      { id: "bm4", cat: "Estimation (base de références)", art: "huile", mode: "persjour", q: 0.05, dispo: 0 },
      { id: "bm5", cat: "Estimation (base de références)", art: "tomconc", mode: "persjour", q: 0.2, dispo: 0 }
    ];
    // Une catégorie ajoutée sur le terrain, en attente de validation (M1.1)
    c.groupes.A.lignes.push({ id: "lt1", cat: "Atelier vannerie (ajout terrain)", art: "ficelle", mode: "fixe", q: 30, dispo: 0, terrain: true, valide: false, by: "p-delali" });
    c.groupes.G.lignes = linesFrom([["Véhicules", "bus70", "fixe", 1, 0], ["Carburant", "gasoil", "fixe", 420, 0], ["Chauffeurs", "chauffeur", "jour", 1, 0], ["Péages & stationnement", "peage", "fixe", 12, 0]]);
    c.groupes.G.itineraires = [{ id: "it1", de: "Local GST — Bè, Lomé", a: "Kara — site de Landa", etapes: "Atakpamé · Sokodé", km: 420, duree: "7 h 30", date: "2026-10-15", h: "05:00", rdv: "Parking de l'église de Bè", resp: "p-yawo", type: "Aller — convoi principal" }];
    c.inscriptions = inscrire(st, c, 57, 35000, [38, 11, 8]);
    c.programme = [];
    for (var j = 1; j <= 13; j++) {
      var acts = j <= 3 ? [{ id: "k" + j + "-0", h: "07:00", titre: j === 1 ? "Départ en convoi" : "Rassemblement & levée des couleurs", lieu: j === 1 ? "Lomé → Kara" : "Site de Landa", resp: "Codjo Agossou", unites: "Toutes", desc: "" },
        { id: "k" + j + "-1", h: "09:00", titre: j === 1 ? "Route & haltes" : j === 2 ? "Cérémonie d'ouverture du jamboree" : "Ateliers inter-groupes", lieu: "Site de Landa", resp: "Mawuli Lawson", unites: "Toutes", desc: "" }] : [];
      c.programme.push({ j: j, titre: j === 1 ? "Voyage vers Kara" : j === 2 ? "Ouverture du jamboree" : j === 3 ? "Ateliers inter-groupes" : "", lieu: "Site de Landa", resp: "", unites: "Toutes", acts: acts, cr: "", photos: 0, sansCuisine: false });
    }
    c.menu = { arrete: false, transmis: false, cloture: "2026-09-15", jours: null,
      choix: { votants: 41, selections: { m1: 33, m2: 18, m3: 29, m4: 25, m5: 12, m6: 9, m7: 15, m8: 21, m9: 10, m10: 14, d1: 22, d2: 31, d3: 27, d4: 19, d5: 35, d6: 12, d7: 16, d8: 24, d9: 20, d10: 9, s1: 23, s2: 34, s3: 28, s4: 11, s5: 26, s6: 30, s7: 17, s8: 14, s9: 10, s10: 13, f1: 22, r1: 8 },
        propositions: [{ texte: "Riz gras", plat: "d5", n: 14 }, { texte: "Spaghetti", plat: "s2", n: 11 }, { texte: "Koklo mémé", plat: "s6", n: 9 }, { texte: "Ayimolou", plat: "d3", n: 7 }, { texte: "Pain omelette", plat: "m4", n: 6 },
          { texte: "Attiéké poisson", plat: "s3", n: 5 }, { texte: "Fufu sauce graine", plat: "s1", n: 4 }, { texte: "Watché (riz-haricot)", plat: null, n: 6, statut: "en attente" }, { texte: "Yassa poulet", plat: null, n: 3, statut: "en attente" }],
        mes: {} } };
    c.live = null;
    c.budget = { validation: "brouillon", circuit: [], ajust: [], versions: [] };
    c.depenses = []; c.entrees = [{ id: "e1", type: "Subvention", libelle: "Subvention nationale AST — jamboree", montant: 900000, date: "2026-08-01", mode: "Virement", recu: "R-K26-S01" }];
    c.avances = []; c.caisse = []; c.arrets = {};
    c.devis = [
      { id: "dv1", poste: "Location bus 70 places — Lomé ↔ Kara", g: "G", offres: [{ f: "f1", m: 780000 }, { f: "f2", m: 845000 }, { f: "f3", m: 720000 }], retenu: null, commande: null },
      { id: "dv2", poste: "Riz local — 20 sacs de 50 kg", g: "B", offres: [{ f: "f4", m: 640000 }, { f: "f5", m: 618000 }, { f: "f4", m: 655000, note: "livraison incluse" }], retenu: null, commande: null }
    ];
    return c;
  }

  function campS26(st) {
    var c = { id: "s26", nom: "Camp de survie — Agou 2026", court: "Survie Agou 2026", type: "survie", du: "2026-03-20", au: "2026-03-22", lieu: "Mont Agou",
      enveloppe: 350000, inscription: 7500, places: 30, statut: "clos", unites: ["PIO", "ROU"], encadrement: ["p-mawuli", "p-sena", "p-yawo", "p-enyonam"],
      modules: { roadmap: false, inscription: false, bus: false }, seuilDouble: 50000, delaiAvance: 1, devise: "XOF" };
    c.groupes = groupes("survie", { dispo: function (r) { return r[4] ? 0 : 0; } });
    ["A", "B", "D", "G", "H"].forEach(function (L) { c.groupes[L].resp = RESP[L]; c.groupes[L].statut = "validé"; });
    c.groupes.A.lignes = linesFrom([["Abris", "bache", "fixe", 4, 1], ["Abris", "tente4", "ratio", 4, 1], ["Cordes & froissartage", "corde8", "fixe", 80, 1], ["Cuisine collective", "marmite", "fixe", 1, 1]]);
    c.groupes.D.lignes = linesFrom([["Pharmacie de camp", "trousse", "fixe", 2, 1, 2], ["Pharmacie de camp", "sro", "fixe", 20, 0, 10], ["Pharmacie de camp", "antipal", "fixe", 3, 0, 2]]);
    c.groupes.D.respSante = "p-enyonam";
    c.groupes.B.source = "manuel";
    c.groupes.B.manuel = [{ id: "bm1", cat: "Vivres de survie", art: "gari", mode: "persjour", q: 0.3, dispo: 0 }, { id: "bm2", cat: "Vivres de survie", art: "sardine", mode: "persjour", q: 1, dispo: 0 }, { id: "bm3", cat: "Vivres de survie", art: "arachg", mode: "persjour", q: 0.08, dispo: 0 }];
    c.groupes.G.lignes = linesFrom([["Véhicules", "bus30", "fixe", 1, 0], ["Carburant", "gasoil", "fixe", 40, 0]]);
    c.groupes.H.statut = "publié"; c.groupes.H.publie = true;
    c.inscriptions = inscrire(st, c, 24, 7500, [24, 0, 0]);
    c.programme = []; c.menu = { arrete: false, transmis: false, jours: null, choix: null }; c.live = null;
    c.budget = { validation: "approuvé", circuit: [{ d: "2026-03-10", who: "p-codjo", t: "Approuvé par le chef de groupe" }], ajust: [], versions: [] };
    c.depenses = [
      { id: "s1", jour: 0, poste: "ALI", act: "int", libelle: "Vivres de survie", montant: 61800, benef: "Marché d'Adakpamé", mode: "Espèces", h: "10:00", par: "p-yawo", ico: "utensils", date: "2026-03-18", photo: true, sig: ["p-yawo"] },
      { id: "s2", jour: 1, poste: "TRA", act: "int", libelle: "Minibus aller-retour Agou", montant: 175000, benef: "STM Voyages", mode: "Espèces", h: "06:30", par: "p-yawo", ico: "bus", date: "2026-03-20", photo: true, sig: ["p-yawo", "p-essi"] },
      { id: "s3", jour: 1, poste: "TRA", act: "int", libelle: "Gasoil", montant: 26000, benef: "Station Agou", mode: "Espèces", h: "07:10", par: "p-yawo", ico: "truck", date: "2026-03-20", photo: true, sig: ["p-yawo"] },
      { id: "s4", jour: 1, poste: "SAN", act: "int", libelle: "SRO & antipaludéens", montant: 11500, benef: "Pharmacie d'Agou", mode: "Espèces", h: "09:00", par: "p-enyonam", ico: "heart-pulse", date: "2026-03-20", photo: true, sig: ["p-enyonam"] },
      { id: "s5", jour: 2, poste: "MAT", act: "int", libelle: "Cordes & ficelles", montant: 14500, benef: "Quincaillerie d'Agou", mode: "Espèces", h: "08:00", par: "p-mawuli", ico: "hammer", date: "2026-03-21", photo: true, sig: ["p-mawuli"] }
    ];
    c.entrees = [{ id: "e1", type: "Subvention", libelle: "Fonds de groupe GST", montant: 120000, date: "2026-03-01", mode: "Espèces", recu: "R-S26-S01" }];
    c.avances = []; c.caisse = []; c.arrets = { 0: { d: "2026-03-19T20:00", by: "p-essi" }, 1: { d: "2026-03-20T21:00", by: "p-essi" }, 2: { d: "2026-03-21T21:00", by: "p-essi" }, 3: { d: "2026-03-22T20:00", by: "p-essi" } };
    c.devis = [];
    c.retours = { ok: true };
    // Pointage de retour complet
    c.groupes.A.lignes.forEach(function (l, k) { c.groupes.H.pointage[l.id] = { etat: k === 2 ? "usé" : "intact", rev: null, perdu: k === 2 ? 6 : 0 }; });
    c.groupes.D.lignes.forEach(function (l) { c.groupes.H.pointage[l.id] = { etat: "consommé", rev: null }; });
    c.cloture = { d: "2026-03-30", by: "p-codjo", comments: { TRA: "Minibus loué au dernier moment, plus cher que prévu.", ALI: "Gari en trop : réduire de 20 % la prochaine fois." } };
    c.budget.versions.push({ id: "A", label: "Version A — validée", date: "2026-03-10", frozen: true, effectif: 28, postes: { ALI: 72000, TRA: 160000, MAT: 26000, SAN: 14000, ACT: 0, TEC: 0, SOC: 0, SAL: 0 }, total: 272000 });
    return c;
  }

  /* ══ Store ═════════════════════════════════════════════════════════════ */
  var listeners = [];
  APP.on = function (fn) { listeners.push(fn); };
  function emit(why) { APP._v = (APP._v || 0) + 1; memo = {}; listeners.forEach(function (fn) { fn(why); }); }
  APP.load = function () {
    try { var s = localStorage.getItem(KEY); if (s) { var o = JSON.parse(s); if (o && o.v === 1) return o; } } catch (e) {}
    return null;
  };
  APP.save = function () { try { localStorage.setItem(KEY, JSON.stringify(APP.state)); } catch (e) {} };
  APP.reset = function () { APP.state = build(); finishBuild(APP.state); APP.save(); emit("reset"); };
  function finishBuild(st) {
    // Version A de R26 = consolidation au jour du gel (calculée une fois puis figée)
    var r = st.camps[0];
    if (!r.budget.versions.length) {
      APP.state = st; memo = {};
      var cons = APP.calc(r).postesLive;
      r.budget.versions.push({ id: "A", label: "Version A — validée", date: "2026-07-15", frozen: true, effectif: 80, postes: APP.clone(cons), total: sumObj(cons) });
    }
    memo = {};
  }
  function sumObj(o) { var t = 0; for (var k in o) t += o[k] || 0; return t; }
  APP.sumObj = sumObj;

  APP.init = function () {
    var st = APP.load();
    if (!st) { st = build(); finishBuild(st); }
    APP.state = st; APP.save();
  };

  /* Camp courant & raccourcis */
  APP.camp = function (id) { var st = APP.state; id = id || st.camp; for (var i = 0; i < st.camps.length; i++) if (st.camps[i].id === id) return st.camps[i]; return st.camps[0]; };
  APP.person = function (id) { return person(APP.state, id); };
  APP.pname = function (id, short) { var p = APP.person(id); if (!p) return id || "—"; return short ? p.prenom + " " + p.nom[0] + "." : p.prenom + " " + p.nom; };
  APP.article = function (id) { var a = APP.state.articles; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; };
  APP.plat = function (id) { var a = APP.state.plats; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; };
  APP.unite = function (id) { var a = APP.state.unites; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; };
  APP.fournisseur = function (id) { var a = APP.state.fournisseurs; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; };

  /* Prix : le plus récent et validé (un prix « suggestion » n'entre dans aucun calcul — M6.2) */
  APP.prix = function (artId) {
    var a = APP.article(artId); if (!a) return { montant: 0, date: null, perime: false };
    var v = a.prix.filter(function (p) { return p.statut === "validé"; }).sort(function (x, y) { return x.date < y.date ? 1 : -1; })[0];
    if (!v) return { montant: 0, date: null, perime: false };
    return { montant: v.montant, date: v.date, marche: v.marche, perime: APP.diffDays(v.date, APP.state.today) > 182, id: v.id };
  };

  /* ══ Journal, commit, hors ligne ═══════════════════════════════════════ */
  APP.me = function () { var s = APP.state.session; return s ? APP.person(s.person) : null; };
  APP.log = function (objet, champ, avant, apres, campId) {
    var s = APP.state.session, now = APP.state.today + "T" + new Date().toTimeString().slice(0, 5);
    APP.state.journal.unshift({ id: APP.uid("jr"), t: now, auteur: s ? s.person : "public", camp: campId || APP.state.camp, objet: objet, champ: champ, avant: avant == null ? "" : String(avant), apres: apres == null ? "" : String(apres) });
  };
  /* commit(label, mutation, {log:[objet,champ,avant,apres], offline:true}) */
  APP.commit = function (label, fn, o) {
    o = o || {};
    fn(APP.state);
    if (o.log) APP.log.apply(null, o.log);
    if (o.offline !== false && !APP.state.online) APP.state.queue.push({ id: APP.uid("q"), label: label, t: new Date().toTimeString().slice(0, 5) });
    APP.save();
    if (o.silent) { APP._v = (APP._v || 0) + 1; memo = {}; } else emit(label);
  };
  APP.setOnline = function (on) {
    APP.state.online = on; APP.save(); emit("network");
  };

  /* ══ Droits (M0.1) ═════════════════════════════════════════════════════ */
  var PERMS = {
    chef: "*",
    commissaire: ["dash", "camps", "camp.view", "logistique", "logistique.all", "inventaire", "fournisseurs", "documents", "retours", "prix", "prix.edit", "annuaire", "journal", "programme.view", "references", "hook", "roadmap", "agenda", "notifs"],
    respgroupe: ["dash", "camp.view", "logistique", "inventaire", "prix", "notifs", "roadmap", "agenda"],
    tresorier: ["dash", "camps", "camp.view", "compta", "budget", "depenses", "entrees", "courbes", "jour", "avances", "bilan", "prix", "annuaire", "journal", "references", "notifs", "logistique.eco", "roadmap", "agenda"],
    cuisine: ["dash", "camp.view", "cuisine", "prix", "logistique.B", "notifs", "roadmap", "agenda", "inventaire"],
    chefunite: ["dash", "camp.view", "annuaire.unite", "programme.view", "roadmap", "agenda", "inventaire", "notifs"],
    sante: ["dash", "camp.view", "logistique", "sanitaire", "annuaire", "documents", "notifs", "roadmap", "agenda"],
    scout: ["jeune", "roadmap", "agenda", "notifs"],
    parent: ["famille", "roadmap", "agenda", "notifs"]
  };
  APP.role = function () { var s = APP.state.session; return s ? s.role : "public"; };
  APP.can = function (p) {
    var r = APP.role(), L = PERMS[r];
    if (!L) return false;
    if (L === "*") return true;
    if (!p) return true;
    return L.indexOf(p) > -1;
  };
  /* Droit sur un groupe logistique précis */
  APP.canGroup = function (L, write) {
    var r = APP.role(), s = APP.state.session;
    if (r === "chef" || r === "commissaire") return true;
    if (r === "respgroupe") return s.groupe === L;
    if (r === "sante") return L === "D";
    if (r === "tresorier") return !write && (L === "F");
    if (r === "cuisine") return !write ? L === "B" : false;
    return false;
  };
  APP.canSanitaire = function () { var r = APP.role(); return r === "chef" || r === "sante"; };

  /* ══ Calcul continu ════════════════════════════════════════════════════ */
  var memo = {};
  APP.effectif = function (c) { return Math.max(c.inscriptions.length, c.prevision || 0) + c.encadrement.length; };
  APP.jours = function (c) { return APP.diffDays(c.du, c.au) + 1; };
  APP.campDay = function (c) { var d = APP.diffDays(c.du, APP.state.today) + 1; return d; }; // J.n (négatif = avant)
  APP.versements = function (ins) { return ins.versements.reduce(function (s, v) { return s + v.montant; }, 0); };
  APP.seatState = function (c, ins) { var p = APP.versements(ins); return p >= c.inscription ? 3 : p > 0 ? 2 : 1; };

  /* Disponible en inventaire (hors « hors service ») */
  APP.invDispo = function (artId) {
    return APP.state.inventaire.reduce(function (s, it) { return it.art === artId && it.etat !== "hors service" ? s + it.qte : s; }, 0);
  };
  function qtyOf(l, eff, jours) {
    switch (l.mode) {
      case "pers": return l.q * eff;
      case "persjour": return Math.ceil(l.q * eff * jours * 100) / 100;
      case "ratio": return Math.ceil(eff / l.q);
      case "jour": return l.q * jours;
      default: return l.q;
    }
  }
  APP.qtyOf = qtyOf;
  /* Évalue une ligne : besoin, disponible, manquant, coût unitaire, coût total */
  APP.evalLine = function (l, eff, jours) {
    var a = APP.article(l.art) || { nom: l.lab || "Article", unite: "u" };
    var need = l.fixedNeed != null ? l.fixedNeed : qtyOf(l, eff, jours);
    var dispo = l.inv ? APP.invDispo(l.art) : (l.dispo || 0);
    var miss = Math.max(0, Math.round((need - dispo) * 100) / 100);
    var p = l.cu != null ? { montant: l.cu, perime: false } : APP.prix(l.art);
    return { l: l, a: a, need: need, dispo: dispo, miss: miss, cu: p.montant, perime: p.perime, cost: Math.round(miss * p.montant), pending: l.terrain && !l.valide };
  };

  /* Menu → vivres (M3.4) */
  APP.vivres = function (c, eff) {
    eff = eff || APP.effectif(c);
    var out = {}, portions = 0, m = c.menu;
    if (!m || !m.jours) return { lignes: [], portions: 0, total: 0 };
    var marge = (c.groupes.B.marge || 0) / 100;
    m.jours.forEach(function (row) {
      row.forEach(function (pid) {
        if (!pid || pid === "off") return;
        var p = APP.plat(pid); if (!p) return;
        portions += eff;
        p.ing.forEach(function (ig) { out[ig[0]] = (out[ig[0]] || 0) + ig[1] * eff; });
      });
    });
    var lignes = Object.keys(out).map(function (art) {
      var q = Math.ceil(out[art] * (1 + marge) * 10) / 10, pr = APP.prix(art);
      return { art: art, q: q, cu: pr.montant, cost: Math.round(q * pr.montant), perime: pr.perime };
    }).sort(function (a, b) { return b.cost - a.cost; });
    return { lignes: lignes, portions: portions, total: lignes.reduce(function (s, l) { return s + l.cost; }, 0) };
  };

  /* Calcul complet d'un camp (memo par version d'état) */
  APP.calc = function (c, effOverride) {
    var key = c.id + "|" + (effOverride || "") + "|" + (APP._v || 0);
    if (memo[key]) return memo[key];
    var eff = effOverride || APP.effectif(c), jours = APP.jours(c), R = { eff: eff, jours: jours, groupes: {}, alerts: [] };
    var V = APP.vivres(c, eff);
    R.vivres = V;
    "ABCDEGIJ".split("").forEach(function (L) {
      var g = c.groupes[L]; if (!g) return;
      var rows = (g.lignes || []).map(function (l) { return APP.evalLine(l, eff, jours); });
      if (L === "B") {
        rows = [];
        if (c.menu && c.menu.transmis && g.source === "menu") V.lignes.forEach(function (v) {
          rows.push(APP.evalLine({ id: "v-" + v.art, cat: "Vivres du menu (module Cuisine)", art: v.art, mode: "fixe", q: v.q, fromMenu: true, dispo: 0 }, eff, jours));
        });
        (g.manuel || []).forEach(function (l) { rows.push(APP.evalLine(l, eff, jours)); });
        var sachets = eff * jours * 6; // 6 sachets / personne / jour (2 matin, 2 midi, 2 soir)
        rows.push(APP.evalLine({ id: "eau", cat: "Eau potable", art: "eau", mode: "fixe", q: sachets, eau: true, dispo: 0 }, eff, jours));
        rows.push(APP.evalLine({ id: "eaut", cat: "Eau technique (cuisine, vaisselle, toilette)", art: "bidon", mode: "fixe", q: Math.ceil(eff * jours * (g.eauTech || 1.5)), dispo: 0 }, eff, jours));
        R.sachets = sachets;
      }
      var cost = rows.reduce(function (s, r) { return r.pending ? s : s + r.cost; }, 0);
      var need = rows.reduce(function (s, r) { return s + r.need; }, 0), dispo = rows.reduce(function (s, r) { return s + Math.min(r.dispo, r.need); }, 0);
      R.groupes[L] = { rows: rows, cost: g.open ? cost : 0, need: need, dispo: dispo, lignes: rows.length, open: g.open, perimes: rows.filter(function (r) { return r.perime; }).length };
    });
    // Transport : capacité vs effectif (M1.4)
    var cap = 0; (c.groupes.G.lignes || []).forEach(function (l) { var a = { bus70: 70, bus30: 30 }[l.art]; if (a) cap += a * qtyOf(l, eff, jours); });
    R.capacite = cap;
    if (c.groupes.G.open && cap < eff) R.alerts.push({ niv: "warning", t: "Capacité de transport insuffisante", x: cap + " places pour " + eff + " personnes.", href: "#/app/logistique/G" });
    // Santé : seuils critiques et responsable désigné (M1.6)
    if (c.groupes.D.open) {
      if (!c.groupes.D.respSante) R.alerts.push({ niv: "critical", t: "Aucun responsable santé désigné", x: "Blocage : le camp ne peut pas partir sans responsable santé.", href: "#/app/logistique/D", bloc: true });
      var sous = R.groupes.D.rows.filter(function (r) { return r.l.seuil && r.dispo + (r.l.achete || 0) < r.l.seuil; });
      R.sousSeuil = sous;
      if (sous.length && c.statut === "préparation") R.alerts.push({ niv: "critical", t: sous.length + " article(s) de pharmacie sous le seuil critique", x: sous.slice(0, 3).map(function (r) { return r.a.nom; }).join(" · ") + (sous.length > 3 ? "…" : "") + " — à acheter avant le départ.", href: "#/app/logistique/D", seuil: true });
    }
    // Consolidation (groupe F, M1.5)
    var postes = {};
    S.POSTES.forEach(function (p) { postes[p.id] = R.groupes[p.g] ? R.groupes[p.g].cost : 0; });
    (c.budget.ajust || []).forEach(function (a) { postes[a.poste] = (postes[a.poste] || 0) + a.delta; });
    R.postesLive = postes;
    R.totalLive = sumObj(postes);
    var vA = (c.budget.versions || []).filter(function (v) { return v.frozen; }).slice(-1)[0];
    R.versionA = vA || null;
    R.postes = vA ? vA.postes : postes; // référence de comparaison
    R.total = sumObj(R.postes);
    // Entrées
    R.participations = c.inscriptions.reduce(function (s, i) { return s + APP.versements(i); }, 0);
    R.autres = (c.entrees || []).reduce(function (s, e) { return s + e.montant; }, 0);
    R.encaisse = R.participations + R.autres;
    R.du = c.inscriptions.length * c.inscription;
    R.impayes = c.inscriptions.filter(function (i) { return APP.versements(i) < c.inscription; });
    R.resteFinancer = Math.max(0, R.totalLive - R.autres);
    R.parPersonne = c.inscriptions.length ? Math.ceil(R.resteFinancer / c.inscriptions.length / 500) * 500 : 0;
    // Dépenses réelles
    var reel = {}; S.POSTES.forEach(function (p) { reel[p.id] = 0; });
    (c.depenses || []).forEach(function (d) { if (d.sig.length >= (d.montant > c.seuilDouble ? 2 : 1)) reel[d.poste] = (reel[d.poste] || 0) + d.montant; });
    R.reel = reel; R.totalReel = sumObj(reel);
    R.attente = (c.depenses || []).filter(function (d) { return d.montant > c.seuilDouble && d.sig.length < 2; });
    S.POSTES.forEach(function (p) {
      var pv = R.postes[p.id] || 0, rv = reel[p.id];
      if (pv && rv > pv) R.alerts.push({ niv: "warning", t: "Dépassement · " + p.nom, x: APP.cfa(rv) + " dépensés pour " + APP.cfa(pv) + " prévus (" + APP.pct(rv - pv, pv) + ").", href: "#/app/courbes" });
    });
    // Courbe cumulée (Avant, J.01 → J.n)
    var n = jours + 1, prevu = [], cum = [], weights = [0.34, 0.06, 0.05, 0.05, 0.07, 0.05, 0.05, 0.05, 0.03, 0.05, 0.05, 0.04, 0.04, 0.05, 0.02];
    while (weights.length < n) weights.push(0.04);
    weights = weights.slice(0, n); var ws = weights.reduce(function (s, w) { return s + w; }, 0);
    var acc = 0, accR = 0, today = APP.campDay(c);
    for (var k = 0; k < n; k++) {
      acc += R.total * weights[k] / ws; prevu.push(Math.round(acc));
      accR += (c.depenses || []).filter(function (d) { return d.jour === k; }).reduce(function (s, d) { return s + d.montant; }, 0);
      cum.push(k <= Math.max(0, Math.min(today, jours)) || c.statut === "clos" ? accR : null);
    }
    R.courbe = { labels: ["AV."].concat(Array.from({ length: jours }, function (_, i) { return APP.jj(i + 1); })), prevu: prevu, reel: cum };
    // Documents manquants (M1.9)
    R.docsManquants = c.inscriptions.filter(function (i) { return !i.docs.auto || !i.docs.sanitaire || !i.docs.assurance; });
    var dj = APP.diffDays(APP.state.today, c.du);
    if (c.statut === "préparation" && R.docsManquants.length && dj <= 7) R.alerts.push({ niv: "critical", t: "Documents manquants à J-" + dj, x: R.docsManquants.length + " participant(s) incomplet(s) : départ bloqué.", href: "#/app/documents", bloc: true });
    else if (c.statut === "préparation" && R.docsManquants.length) R.alerts.push({ niv: "warning", t: R.docsManquants.length + " dossiers incomplets", x: "Autorisations parentales, fiches sanitaires ou assurances manquantes.", href: "#/app/documents" });
    // Avances non justifiées (M2.6)
    (c.avances || []).forEach(function (a) { if (a.statut === "ouverte" && APP.diffDays(a.date, APP.state.today) > c.delaiAvance) R.alerts.push({ niv: "warning", t: "Avance non justifiée · " + APP.pname(a.benef, true), x: APP.cfa(a.montant) + " confiés le " + APP.dshort(a.date) + ".", href: "#/app/avances" }); });
    // Validations en attente
    var pend = 0; "ABCDEGIJ".split("").forEach(function (L) { (c.groupes[L].lignes || []).forEach(function (l) { if (l.terrain && !l.valide) pend++; }); });
    R.terrain = pend;
    if (pend) R.alerts.push({ niv: "info", t: pend + " ajout(s) terrain à valider", x: "Catégories proposées par les responsables de groupe.", href: "#/app/logistique" });
    if (R.attente.length) R.alerts.push({ niv: "warning", t: R.attente.length + " dépense(s) en attente de seconde signature", x: "Au-delà de " + APP.cfa(c.seuilDouble) + ".", href: "#/app/depenses" });
    // Jalons dépassés
    R.jalons = S.JALONS.filter(function (j) { return c.type !== "mission" || ["J-7", "J-1", "J+3"].indexOf(j.k) > -1; }).map(function (j) {
      var T = S.TYPES[c.type], d = j.fin ? APP.addDays(c.au, j.d) : APP.addDays(c.du, Math.max(j.d, -T.prep));
      var done = APP.diffDays(d, APP.state.today) >= 0;
      return { k: j.k, t: j.t, date: d, done: done };
    });
    memo[key] = R;
    return R;
  };

  /* Activités de rattachement (une dépense n'existe pas sans activité) */
  APP.activites = function (c) {
    var out = [{ id: "int", jour: null, label: "Intendance générale (transversal)" }];
    (c.programme || []).forEach(function (d) { (d.acts || []).forEach(function (a) { out.push({ id: a.id, jour: d.j, label: APP.jj(d.j) + " · " + a.h + " · " + a.titre }); }); });
    return out;
  };
  APP.actLabel = function (c, id) { var a = APP.activites(c).filter(function (x) { return x.id === id; })[0]; return a ? a.label : "—"; };
  /* Caisse : solde théorique en fin de journée j */
  APP.caisseTheo = function (c, j) {
    var t = c.fondsCaisse || 0, dj = APP.addDays(c.du, j - 1);
    (c.entrees || []).forEach(function (e) { if (e.mode === "Espèces" && e.date >= c.du && e.date <= dj) t += e.montant; });
    (c.depenses || []).forEach(function (d) { if (d.mode === "Espèces" && !d.avance && d.jour >= 1 && d.jour <= j) t -= d.montant; });
    (c.avances || []).forEach(function (a) { if (a.date <= dj) { t -= a.montant; if (a.statut === "justifiée" && a.dateJ ? a.dateJ <= dj : a.statut === "justifiée") t += a.rendu || 0; } });
    return t;
  };

  /* Notifications calculées (alertes) — par rôle */
  APP.alertsFor = function (c) {
    var R = APP.calc(c), r = APP.role();
    return R.alerts.filter(function (a) {
      if (r === "chef") return true;
      if (r === "commissaire") return /logistique|documents/.test(a.href);
      if (r === "tresorier") return /courbes|avances|depenses/.test(a.href);
      if (r === "sante") return /logistique\/D|documents/.test(a.href);
      if (r === "respgroupe") return a.href.indexOf("/" + APP.state.session.groupe) > -1;
      return false;
    });
  };

  /* ══ Routeur ═══════════════════════════════════════════════════════════ */
  /* APP.route(pattern, {perm, title, render(params) → html, mount(el, params), shell:"app"|"site"|"bare"}) */
  APP.route = function (pattern, def) {
    var keys = [], rx = new RegExp("^" + pattern.replace(/:(\w+)/g, function (_, k) { keys.push(k); return "([^/]+)"; }) + "$");
    APP.routes.push({ pattern: pattern, rx: rx, keys: keys, def: def });
  };
  APP.match = function (path) {
    // Les routes exactes passent avant les routes à paramètres (/app/camps/nouveau avant /app/camps/:id)
    var ordered = APP.routes.filter(function (r) { return !r.keys.length; }).concat(APP.routes.filter(function (r) { return r.keys.length; }));
    for (var i = 0; i < ordered.length; i++) {
      var m = ordered[i].rx.exec(path);
      if (m) { var p = {}; ordered[i].keys.forEach(function (k, j) { p[k] = decodeURIComponent(m[j + 1]); }); return { r: ordered[i], params: p }; }
    }
    return null;
  };
  APP.go = function (h) { if (location.hash === h) APP.render(); else location.hash = h; };
})();
