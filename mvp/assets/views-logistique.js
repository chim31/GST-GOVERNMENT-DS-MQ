/* GST GOVERNMENT — MVP · Logistique (P1) : groupes, recensement, consolidation, transport, santé,
   retours, inventaire, fournisseurs & devis, documents. */
(function () {
  "use strict";
  var G = window.GST, APP = window.APP, S = window.GST_SEED;
  var ico = APP.ico, esc = APP.esc, f = APP.f, cfa = APP.cfa;
  var MODES = { fixe: "Quantité fixe", pers: "Par personne", persjour: "Par personne et par jour", ratio: "1 pour N personnes", jour: "Par jour" };

  function canEdit(c, L) {
    var g = c.groupes[L];
    if (c.statut === "clos") return false;
    if (!APP.canGroup(L, true)) return false;
    if (g.statut === "validé" && APP.role() !== "commissaire" && APP.role() !== "chef") return false;
    return true;
  }

  /* ══ Vue d'ensemble ════════════════════════════════════════════════════ */
  APP.route("/app/logistique", { title: "Logistique", perm: "logistique|logistique.B|logistique.eco", crumb: function () { return esc(APP.camp().court.toUpperCase()) + " / .01 LOGISTIQUE"; }, render: function () {
    var c = APP.camp(), R = APP.calc(c);
    var chain = '<div class="mv-chain">' + ["B", "G", "A", "C", "D", "E", "I", "J"].map(function (L) {
      var g = c.groupes[L], cg = R.groupes[L];
      return '<a class="mv-chain__n' + (g.open ? "" : " is-off") + '" href="#/app/logistique/' + L + '" data-node="' + L + '"><b>' + L + "</b><span>" + S.GROUPES[L].nom + "</span><i>" + (g.open ? f(cg.cost) : "—") + "</i></a>";
    }).join("") + '</div><div class="mv-chain__arrow">' + ico("arrow-right") + '</div><a class="mv-chain__f" href="#/app/logistique/F" data-node="F"><span class="gst-tag">F · ÉCONOMIQUE</span><b>' + APP.num("lg-tot", R.totalLive) + "<small> F CFA</small></b><span>" + R.eff + " personnes · " + R.jours + " jours</span></a>" +
      '<div class="mv-chain__arrow">' + ico("arrow-right") + '</div><a class="mv-chain__f mv-chain__f--c" href="#/app/budget"><span class="gst-tag">COMPTABILITÉ</span><b>' + (R.versionA ? "Version A" : "Prévisionnel") + "</b><span>" + (R.versionA ? f(R.total) + " F gelés" : "en construction") + "</span></a>";
    var pendings = [];
    "ABCDEGIJ".split("").forEach(function (L) { (c.groupes[L].lignes || []).forEach(function (l) { if (l.terrain && !l.valide) pendings.push({ L: L, l: l }); }); });
    var file = pendings.length ? '<div class="mv-list">' + pendings.map(function (x) { var a = APP.article(x.l.art); return '<div class="mv-li"><span class="mv-grp__l" style="width:36px;height:36px;font-size:1.2rem">' + x.L + '</span><div class="mv-li__m"><b>' + esc(x.l.cat) + "</b><small>" + esc(a.nom) + " × " + x.l.q + " · proposé par " + esc(APP.pname(x.l.by || "", true)) + "</small></div>" +
      ((APP.role() === "commissaire" || APP.role() === "chef") ? '<div class="mv-row"><button class="gst-btn gst-btn--brand gst-btn--sm" data-val="' + x.L + "|" + x.l.id + '">Valider</button><button class="gst-btn gst-btn--ghost gst-btn--sm" data-rej="' + x.L + "|" + x.l.id + '">Rejeter</button></div>' : '<span class="gst-badge gst-badge--warning">en attente</span>') + "</div>"; }).join("") + "</div>"
      : APP.empty("File vide", "Aucune catégorie ajoutée sur le terrain n'attend de validation.");
    var cards = "ABCDEFGHIJ".split("").map(function (L) {
      var g = c.groupes[L], m = S.GROUPES[L], cg = R.groupes[L], mine = APP.canGroup(L) || APP.can("logistique.all") || APP.role() === "chef";
      var bar = cg && cg.need ? '<div class="mv-bar"><i style="width:' + Math.min(100, (cg.dispo / cg.need) * 100) + '%"></i></div><span class="mv-mono mv-muted" style="font-size:10.5px">Disponible ' + Math.round((cg.dispo / cg.need) * 100) + " % · " + cg.lignes + " lignes" + (cg.perimes ? " · " + cg.perimes + " prix périmé(s)" : "") + "</span>" : "";
      return '<a class="mv-grp' + (g.open ? "" : " is-off") + (m.pivot ? " is-pivot" : "") + '" href="#/app/logistique/' + L + '"' + (mine ? "" : ' aria-disabled="true"') + '><div class="mv-grp__top"><span class="mv-grp__l">' + L + "</span><div><h4>" + m.nom + (m.renforce ? ' <span class="gst-badge gst-badge--renforce" title="Renforcé">⚡</span>' : "") + "</h4><small>" + (g.resp ? esc(APP.pname(g.resp)) : "Sans responsable") + "</small></div>" + (mine ? "" : '<span style="margin-left:auto" title="Lecture seule">' + ico("lock", "gst-icon--sm") + "</span>") + "</div>" +
        '<p class="mv-muted mv-small" style="margin:0">' + esc(m.desc) + "</p>" + (g.open ? '<div class="mv-row mv-row--sb"><span class="mv-grp__v">' + (L === "F" ? f(R.totalLive) : L === "H" ? "—" : f(cg.cost)) + "<small> F</small></span>" + APP.badge(g.statut) + "</div>" + bar : '<span class="gst-badge">fermé pour ce type de camp</span>') + "</a>";
    }).join("");
    return APP.head(".01 / LOGISTIQUE · " + esc(c.court.toUpperCase()), "Les dix groupes de gestion", "Recenser, chiffrer, comparer : chaque groupe produit ce dont on a besoin, ce que ça coûte et ce dont on dispose déjà. Le groupe Économique consolide tout, en continu.") +
      APP.card("Chaîne de chiffrage", '<div class="mv-chainwrap">' + chain + "</div>", { ico: "route", tag: "UN CHIFFRE NAÎT EN UN SEUL ENDROIT ET CIRCULE" }) +
      '<div class="mv-grid">' + cards + "</div>" +
      APP.card("File de validation · ajouts terrain", file, { ico: "list", tag: pendings.length + " EN ATTENTE", tone: pendings.length ? "yel" : "" });
  }, mount: function (el) {
    var c = APP.camp();
    function find(v) { var p = v.split("|"); return { L: p[0], l: c.groupes[p[0]].lignes.filter(function (x) { return x.id === p[1]; })[0] }; }
    el.querySelectorAll("[data-val]").forEach(function (b) { b.onclick = function () { var x = find(b.dataset.val); APP.commit("val", function () { x.l.valide = true; x.l.terrain = true; x.l.cat = x.l.cat.replace(" (ajout terrain)", ""); }, { log: ["Recensement " + x.L, "Ajout terrain validé", "en attente", x.l.cat] }); G.toast("Catégorie validée — elle entre dans le chiffrage", { tag: ".01 / VALIDATION", tone: "success" }); }; });
    el.querySelectorAll("[data-rej]").forEach(function (b) { b.onclick = function () { var x = find(b.dataset.rej); APP.commit("rej", function () { c.groupes[x.L].lignes = c.groupes[x.L].lignes.filter(function (l) { return l !== x.l; }); }, { log: ["Recensement " + x.L, "Ajout terrain rejeté", x.l.cat, ""] }); G.toast("Ajout rejeté", { tag: ".01 / VALIDATION" }); }; });
  } });

  /* ══ Recensement d'un groupe (moteur commun M1.1) ═══════════════════════ */
  function recTable(c, L, rows, editable, o) {
    o = o || {};
    var R = APP.calc(c), byCat = {}, order = [];
    rows.forEach(function (r) { var k = r.l.cat || "Divers"; if (!byCat[k]) { byCat[k] = []; order.push(k); } byCat[k].push(r); });
    var tot = 0;
    var body = order.map(function (k) {
      return '<tr class="cat"><td colspan="' + (o.seuil ? 10 : 9) + '">' + esc(k) + "</td></tr>" + byCat[k].map(function (r) {
        if (!r.pending) tot += r.cost;
        var l = r.l, ro = !editable || l.fromMenu || l.eau || l.id === "eaut";
        var qcell = ro ? '<span class="mv-mono">' + f(l.q) + "</span>" : '<input class="mv-cell" id="q-' + l.id + '" data-q="' + l.id + '" value="' + l.q + '" inputmode="decimal" aria-label="Quantité ' + esc(r.a.nom) + '">';
        var dcell = l.inv ? '<span title="Depuis l\'inventaire permanent">' + f(r.dispo) + ' <span class="gst-badge gst-badge--info" style="font-size:9px">inv.</span></span>' : (ro ? f(r.dispo) : '<input class="mv-cell" id="d-' + l.id + '" data-d="' + l.id + '" value="' + (l.dispo || 0) + '" inputmode="decimal" aria-label="Disponible ' + esc(r.a.nom) + '">');
        var mode = l.fromMenu ? "menu" : l.eau ? "6 / pers. / jour" : l.id === "eaut" ? "par pers. / jour" : (MODES[l.mode] || l.mode) + (l.mode === "ratio" ? " (" + l.q + ")" : "");
        return '<tr class="' + (r.pending ? "is-pending" : "") + '"><td><a href="#/app/prix/' + l.art + '">' + esc(r.a.nom) + "</a>" + (r.pending ? ' <span class="gst-badge gst-badge--warning">ajout terrain · en attente</span>' : "") + (l.jour ? ' <a class="gst-badge gst-badge--brand" href="#/app/roadmap?j=' + l.jour + '">' + APP.jj(l.jour) + "</a>" : "") + '</td><td class="mv-muted" style="font-size:11px">' + esc(mode) + '</td><td class="n">' + qcell + "</td><td>" + esc(r.a.unite) + '</td><td class="n">' + f(r.need) + '</td><td class="n">' + dcell + "</td>" +
          (o.seuil ? '<td class="n' + (l.seuil && r.dispo < l.seuil ? " is-miss" : "") + '">' + (l.seuil || "—") + "</td>" : "") +
          '<td class="n' + (r.miss ? " is-miss" : " is-ok") + '">' + f(r.miss) + '</td><td class="n">' + f(r.cu) + (r.perime ? ' <span class="mv-perime" title="Prix de plus de 6 mois">' + ico("history", "gst-icon--sm") + "</span>" : "") + '</td><td class="n"><b>' + f(r.cost) + "</b>" + (editable && !ro ? ' <button class="gst-icon-btn gst-icon-btn--ghost" style="width:30px;height:30px" data-del="' + l.id + '" aria-label="Supprimer la ligne">' + ico("x", "gst-icon--sm") + "</button>" : "") + "</td></tr>";
      }).join("");
    }).join("");
    return '<div class="mv-tw"><table class="mv-t mv-rec"><thead><tr><th>Article</th><th>Mode</th><th class="n">Qté</th><th>Unité</th><th class="n">Besoin</th><th class="n">Disponible</th>' + (o.seuil ? '<th class="n">Seuil</th>' : "") + '<th class="n">Manquant</th><th class="n">C.U.</th><th class="n">Coût</th></tr></thead><tbody>' + body + '</tbody><tfoot><tr><td colspan="' + (o.seuil ? 9 : 8) + '">Coût du manquant · ' + R.eff + " personnes × " + R.jours + ' jours</td><td class="n">' + APP.num("rec-" + L, tot) + "</td></tr></tfoot></table></div>";
  }

  function groupHead(c, L, R) {
    var g = c.groupes[L], m = S.GROUPES[L], cg = R.groupes[L], ed = canEdit(c, L), r = APP.role();
    var acts = "";
    if (g.open && L !== "F" && L !== "H" && c.statut !== "clos") {
      if (ed && g.statut === "en cours") acts += '<button class="gst-btn gst-btn--primary" data-status="soumis">' + ico("arrow-up-right", "gst-icon--sm") + "Soumettre au commissaire</button>";
      if ((r === "commissaire" || r === "chef") && g.statut === "soumis") acts += '<button class="gst-btn gst-btn--brand" data-status="validé">' + ico("check", "gst-icon--sm") + 'Valider le recensement</button><button class="gst-btn gst-btn--ghost" data-status="en cours">Renvoyer</button>';
      if ((r === "commissaire" || r === "chef") && g.statut === "validé") acts += '<button class="gst-btn gst-btn--ghost" data-status="en cours">' + ico("rotate-ccw", "gst-icon--sm") + "Rouvrir</button>";
      if (ed) acts += '<button class="gst-btn gst-btn--secondary" data-add>' + ico("plus", "gst-icon--sm") + "Ajouter une ligne</button>";
    }
    acts += '<button class="gst-btn gst-btn--ghost" data-export="' + L + '">' + ico("download", "gst-icon--sm") + "Exporter</button>";
    return '<div class="mv-ph"><div class="mv-ph__t"><span class="gst-tag gst-tag--accent" data-decode>.01 / GROUPE ' + L + (m.renforce ? " · RENFORCÉ" : "") + (m.critique ? " · SEUIL CRITIQUE" : "") + "</span><h2>" + L + " — " + m.nom + "</h2><p>" + esc(m.desc) + " Responsable : <b>" + (g.resp ? esc(APP.pname(g.resp)) : "non désigné") + "</b> · " + APP.badge(g.statut) + (ed ? "" : ' · <span class="mv-muted">' + ico("lock", "gst-icon--sm") + " lecture seule</span>") + '</p></div><div class="mv-ph__a">' + acts + "</div></div>";
  }

  APP.route("/app/logistique/:g", { title: function (p) { return "Groupe " + p.g + " — " + (S.GROUPES[p.g] || {}).nom; }, perm: "logistique|logistique.B|logistique.eco|retours", crumb: function (p) { return esc(APP.camp().court.toUpperCase()) + " / .01 LOGISTIQUE / " + p.g; }, render: function (p) {
    var c = APP.camp(), L = p.g, g = c.groupes[L], R = APP.calc(c);
    if (!g) return APP.empty("Groupe inconnu", "");
    var r = APP.role();
    var readable = APP.canGroup(L) || APP.can("logistique.all") || r === "chef" || (r === "tresorier" && L === "F") || (r === "cuisine" && L === "B") || (r === "commissaire") || (L === "H" && APP.can("retours"));
    if (!readable) return APP.views.denied({ title: "Groupe " + L + " — " + S.GROUPES[L].nom });
    if (!g.open) return groupHead(c, L, R) + APP.empty("Groupe fermé pour ce camp", "Le type « " + S.TYPES[c.type].court + " » n'ouvre pas ce groupe. Le chef de groupe peut l'ouvrir depuis la fiche du camp.");
    if (L === "F") return eco(c, R);
    if (L === "H") return retours(c, R);
    var cg = R.groupes[L], ed = canEdit(c, L), extra = "";
    var k = '<div class="mv-g4">' + APP.kpi("Coût du manquant", APP.num("g-cost-" + L, cg.cost), { unit: "F CFA", cls: "mv-kpi--brand", ico: S.GROUPES[L].ico }) + APP.kpi("Lignes", cg.lignes, { sub: cg.perimes ? cg.perimes + " prix périmé(s)" : "Prix à jour", subTone: cg.perimes ? "bad" : "good" }) +
      APP.kpi("Couverture par le stock", Math.round(cg.need ? (cg.dispo / cg.need) * 100 : 0) + "<small>%</small>", { sub: "Le coût ne compte que le manquant" }) + APP.kpi("Effectif de calcul", APP.num("g-eff", R.eff), { sub: R.jours + " jours" }) + "</div>";
    if (L === "B") extra = alimentaire(c, R, ed);
    if (L === "D") extra = sante(c, R, ed);
    if (L === "E") extra = APP.card("Plan de remise en état du terrain", '<textarea class="mv-ta" id="e-remise"' + (ed ? "" : " readonly") + ">" + esc(g.remise || "") + '</textarea><div class="mv-row"><button class="gst-btn gst-btn--secondary gst-btn--sm" data-print-remise>' + ico("printer", "gst-icon--sm") + "Exporter pour le propriétaire</button></div>", { ico: "leaf" });
    if (L === "G") extra = transport(c, R, ed);
    if (L === "J") extra = APP.card("Équipement individuel demandé aux familles", '<ol class="mv-equip">' + S.EQUIPEMENT.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + '</ol><button class="gst-btn gst-btn--secondary gst-btn--sm" data-print-equip>' + ico("printer", "gst-icon--sm") + "Imprimer la liste pour les familles</button>", { ico: "list" });
    if (L === "I") extra = APP.card("Lien avec la roadmap", '<p class="mv-muted" style="margin:0">Chaque ligne rattachée à une journée apparaît sur l\'étape correspondante de la roadmap (badge J.xx).</p><div class="mv-row">' + c.programme.filter(function (d) { return (g.lignes || []).some(function (l) { return l.jour === d.j; }); }).map(function (d) { return '<a class="gst-chip" href="#/app/roadmap?j=' + d.j + '">' + APP.jj(d.j) + " · " + esc(d.titre) + "</a>"; }).join("") + "</div>", { ico: "route" });
    var rows = L === "B" ? cg.rows : cg.rows;
    var planB = g.planB != null || L === "G" || L === "D" || L === "B" ? APP.card("Plan B", '<textarea class="mv-ta" id="g-planb" placeholder="Que fait-on si… (le bus ne vient pas, il pleut, le fournisseur fait défaut)"' + (ed ? "" : " readonly") + ">" + esc(g.planB || "") + "</textarea>", { ico: "shield-check", tag: "POSTE CRITIQUE · À ÉCRIRE AVANT, PAS PENDANT" }) : "";
    return groupHead(c, L, R) + k + extra + APP.card("Recensement", recTable(c, L, rows, ed, { seuil: L === "D" }) + (ed ? '<div class="mv-row"><button class="gst-btn gst-btn--secondary gst-btn--sm" data-add>' + ico("plus", "gst-icon--sm") + 'Ajouter une ligne</button><button class="gst-btn gst-btn--ghost gst-btn--sm" data-addcat>' + ico("sparkles", "gst-icon--sm") + "Ajouter une catégorie manquante (ajout terrain)</button></div>" : ""), { ico: "list", tag: "TAPEZ UNE QUANTITÉ · TOUT SE RECALCULE" }) + planB;
  }, mount: function (el, p) {
    var c = APP.camp(), L = p.g, g = c.groupes[L];
    if (!g) return;
    function line(id) { return (g.lignes || []).concat(g.manuel || []).filter(function (l) { return l.id === id; })[0]; }
    APP.bind(el, "change", "[data-q]", function (i) { var l = line(i.dataset.q), v = +String(i.value).replace(",", "."); if (!l || isNaN(v) || v < 0) return; var old = l.q; APP.commit("q", function () { l.q = v; }, { log: ["Recensement " + L + " — " + S.GROUPES[L].nom, "Quantité · " + APP.article(l.art).nom, old, v] }); });
    APP.bind(el, "change", "[data-d]", function (i) { var l = line(i.dataset.d), v = +String(i.value).replace(",", "."); if (!l || isNaN(v) || v < 0) return; var old = l.dispo; APP.commit("d", function () { l.dispo = v; }, { log: ["Recensement " + L, "Disponible · " + APP.article(l.art).nom, old, v] }); });
    APP.bind(el, "keydown", "[data-q],[data-d]", function (i, e) { if (e.key === "Enter") { e.preventDefault(); i.blur(); } });
    APP.bind(el, "click", "[data-del]", function (b) { var id = b.dataset.del, l = line(id); APP.confirm("Supprimer la ligne ?", esc(APP.article(l.art).nom) + " sera retiré du recensement.", "Supprimer", { danger: true }).then(function (ok) { if (!ok) return; APP.commit("del", function () { if (g.lignes) g.lignes = g.lignes.filter(function (x) { return x.id !== id; }); if (g.manuel) g.manuel = g.manuel.filter(function (x) { return x.id !== id; }); }, { log: ["Recensement " + L, "Ligne supprimée", APP.article(l.art).nom, ""] }); }); });
    el.querySelectorAll("[data-add]").forEach(function (b) { b.onclick = function () { addLine(c, L, false); }; });
    var ac = el.querySelector("[data-addcat]"); if (ac) ac.onclick = function () { addLine(c, L, true); };
    el.querySelectorAll("[data-status]").forEach(function (b) { b.onclick = function () { var old = g.statut, nv = b.dataset.status; APP.commit("statut", function () { g.statut = nv; }, { log: ["Recensement " + L + " — " + S.GROUPES[L].nom, "Statut", old, nv] }); if (nv === "validé") { var h = el.querySelector(".mv-ph"); h && G.stamp(h, { big: "VALIDÉ", small: "GROUPE " + L, left: "70%", top: "40%" }); } G.toast("Recensement " + L + " : " + nv, { tag: ".01 / STATUT", tone: nv === "validé" ? "success" : null }); }; });
    var ex = el.querySelector("[data-export]"); if (ex) ex.onclick = function () { var R = APP.calc(c); var rows = L === "F" ? [] : (R.groupes[L] ? R.groupes[L].rows : []); APP.csv("recensement-" + c.id + "-" + L, [["catégorie", "article", "unité", "besoin", "disponible", "manquant", "coût unitaire", "coût"]].concat(rows.map(function (r) { return [r.l.cat, r.a.nom, r.a.unite, r.need, r.dispo, r.miss, r.cu, r.cost]; }))); };
    var pb = el.querySelector("#g-planb"); if (pb) pb.onchange = function () { APP.commit("planb", function () { g.planB = pb.value; }, { log: ["Groupe " + L, "Plan B", "", "mis à jour"] }); G.toast("Plan B enregistré", { tag: ".01 / PLAN B" }); };
    var er = el.querySelector("#e-remise"); if (er) er.onchange = function () { APP.commit("remise", function () { g.remise = er.value; }, { log: ["Groupe E", "Plan de remise en état", "", "mis à jour"] }); };
    var prm = el.querySelector("[data-print-remise]"); if (prm) prm.onclick = function () { APP.print("Plan de remise en état — " + c.nom, "<h2>Plan de remise en état du terrain</h2><p><b>" + esc(c.lieu) + "</b> · " + APP.dshort(c.du) + " → " + APP.dshort(c.au) + "</p><p>" + esc(g.remise || "") + "</p><p>Responsable salubrité : " + esc(APP.pname(g.resp)) + "</p>"); };
    var pe = el.querySelector("[data-print-equip]"); if (pe) pe.onclick = function () { APP.print("Équipement individuel — " + c.nom, "<h2>Équipement individuel à apporter</h2><p>" + esc(c.nom) + " · " + APP.dlong(c.du) + " → " + APP.dlong(c.au) + "</p><ol>" + S.EQUIPEMENT.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ol><p>Merci de marquer chaque affaire au nom du jeune.</p>"); };
    if (L === "B") mountAli(el, c);
    if (L === "D") mountSante(el, c);
    if (L === "G") mountTransport(el, c);
    if (L === "F") mountEco(el, c);
    if (L === "H") mountRetours(el, c);
  } });

  function addLine(c, L, terrain) {
    var g = c.groupes[L], cats = {}; (g.lignes || []).concat(g.manuel || []).forEach(function (l) { cats[l.cat] = 1; });
    var arts = APP.state.articles.slice().sort(function (a, b) { return (a.cat === S.GROUPES[L].poste ? 0 : 1) - (b.cat === S.GROUPES[L].poste ? 0 : 1) || a.nom.localeCompare(b.nom); });
    var m = APP.modal('<span class="gst-tag">' + (terrain ? "AJOUT TERRAIN · VALIDATION DU COMMISSAIRE" : "RECENSEMENT · GROUPE " + L) + '</span><h4 class="gst-display-md" style="margin:10px 0">' + (terrain ? "Catégorie manquante" : "Nouvelle ligne") + '</h4><form class="mv-form mv-form--2" data-al>' +
      (terrain ? APP.field("Nouvelle catégorie", APP.input("al-cat", "", { ph: "ex. Atelier vannerie" }), { req: true, cls: "is-full", help: "Marquée « ajout terrain » : elle n'entre dans le chiffrage qu'après validation." }) : APP.field("Catégorie", APP.select("al-cat", Object.keys(cats).map(function (k) { return [k, k]; }), Object.keys(cats)[0] || ""), { cls: "is-full" })) +
      APP.field("Article (base de prix)", '<div class="gst-control">' + ico("search", "gst-icon--sm") + '<input id="al-q" list="al-list" placeholder="Rechercher…" autocomplete="off"></div><datalist id="al-list">' + arts.map(function (a) { return '<option value="' + esc(a.nom) + '">'; }).join("") + "</datalist>", { req: true, cls: "is-full", help: '<span data-al-px>Le prix le plus récent et validé sera pré-rempli.</span> <a href="#" data-al-new>Article absent ? Le créer</a>' }) +
      APP.field("Mode de calcul", APP.select("al-mode", Object.keys(MODES).map(function (k) { return [k, MODES[k]]; }), "fixe")) + APP.field("Quantité", APP.input("al-q2", "1", { type: "number", attrs: ' step="any" min="0"' })) +
      APP.field("Disponible", APP.input("al-d", "0", { type: "number", attrs: ' step="any" min="0"' })) + (L === "D" ? APP.field("Seuil critique", APP.input("al-s", "0", { type: "number" })) : "<div></div>") +
      '<div class="mv-row is-full"><button class="gst-btn gst-btn--primary" type="submit">Ajouter</button><button class="gst-btn gst-btn--ghost" type="button" data-close>Annuler</button></div></form>', { wide: true });
    var q = m.querySelector("#al-q"), px = m.querySelector("[data-al-px]");
    function art() { var v = q.value.trim().toLowerCase(); return APP.state.articles.filter(function (a) { return a.nom.toLowerCase() === v; })[0]; }
    q.oninput = function () { var a = art(); if (a) { var pr = APP.prix(a.id); px.innerHTML = "Prix pré-rempli : <b>" + f(pr.montant) + " F / " + esc(a.unite) + "</b> · " + esc(pr.marche || "") + (pr.perime ? ' <span class="mv-perime">périmé</span>' : ""); } };
    m.querySelector("[data-al-new]").onclick = function (e) { e.preventDefault(); var keep = q.value; APP.closeDrawer(true); APP.articleForm(function (id) { addLine(c, L, terrain); setTimeout(function () { var qq = document.querySelector("#al-q"); if (qq) { qq.value = APP.article(id).nom; qq.oninput(); } }, 50); }, { nom: keep, cat: S.GROUPES[L].poste }); };
    m.querySelector("[data-al]").onsubmit = function (e) {
      e.preventDefault(); var a = art(), cat = m.querySelector("#al-cat").value.trim();
      if (!a) { G.toast("Choisissez un article de la base (ou créez-le)", { tag: ".01 / RECENSEMENT", tone: "danger" }); return; }
      if (!cat) { G.toast("Catégorie requise", { tag: ".01 / RECENSEMENT", tone: "danger" }); return; }
      var l = { id: APP.uid("l"), cat: terrain ? cat + " (ajout terrain)" : cat, art: a.id, mode: m.querySelector("#al-mode").value, q: +m.querySelector("#al-q2").value || 0, dispo: +m.querySelector("#al-d").value || 0, inv: APP.invDispo(a.id) > 0, seuil: L === "D" ? +m.querySelector("#al-s").value || 0 : 0 };
      if (terrain) { l.terrain = true; l.valide = false; l.by = APP.state.session.person; }
      APP.closeDrawer();
      APP.commit("add", function () { if (L === "B") g.manuel.push(l); else g.lignes.push(l); }, { log: ["Recensement " + L, terrain ? "Ajout terrain" : "Nouvelle ligne", "", a.nom + " × " + l.q] });
      G.toast(terrain ? "Envoyé dans la file de validation du commissaire" : "Ligne ajoutée — " + (l.inv ? "disponible lu dans l'inventaire" : "prix pré-rempli"), { tag: ".01 / RECENSEMENT", tone: "success" });
    };
  }

  /* ── B · Alimentaire ─────────────────────────────────────────────────── */
  function alimentaire(c, R, ed) {
    var g = c.groupes.B, menuOk = c.menu && c.menu.transmis && g.source === "menu";
    var src = menuOk ? '<div class="gst-alert gst-alert--success"><svg class="gst-icon gst-alert__ico"><use href="#i-chef-hat"/></svg><div><div class="gst-alert__title">Menu validé reçu du module Cuisine</div><div class="gst-alert__text">' + R.vivres.portions + " portions · " + R.vivres.lignes.length + " articles chiffrés automatiquement. Arrêté le " + APP.dshort(c.menu.dateArret || APP.state.today) + '. <a href="#/app/cuisine/vivres">Voir le calcul des vivres</a></div></div><span></span></div>'
      : '<div class="gst-alert gst-alert--warning"><svg class="gst-icon gst-alert__ico"><use href="#i-chef-hat"/></svg><div><div class="gst-alert__title">Saisie manuelle — menu pas encore arrêté</div><div class="gst-alert__text">Le groupe reste utilisable : les lignes ci-dessous sont une estimation. Dès que la cuisine arrêtera le menu, les vivres seront remplis automatiquement. <a href="#/app/cuisine/menu">Aller à l\'arrêt du menu</a></div></div><span></span></div>';
    return src + '<div class="mv-g2">' + APP.card("Eau potable", '<div class="mv-eau"><b>' + APP.num("eau", R.sachets) + '</b><span>sachets</span></div><p class="mv-mono" style="margin:0">' + R.eff + " personnes × " + R.jours + " jours × 6 sachets</p>" +
      '<div class="mv-g3" style="gap:8px">' + ["Matin", "Midi", "Soir"].map(function (s) { return '<div class="mv-card mv-card--tint" style="padding:10px;gap:2px"><span class="gst-tag">' + s.toUpperCase() + '</span><b class="mv-mono">2 / pers.</b><span class="mv-mono mv-muted">' + f(R.eff * 2) + " / jour</span></div>"; }).join("") + "</div>" +
      '<p class="mv-muted mv-small" style="margin:0">Coût : <b>' + cfa(R.sachets * APP.prix("eau").montant) + "</b> à " + APP.prix("eau").montant + " F le sachet.</p>", { ico: "droplet", tag: "CALCUL AUTOMATIQUE" }) +
      APP.card("Paramètres", APP.field("Marge de sécurité sur les vivres", '<div class="mv-row"><input type="range" id="b-marge" min="0" max="20" step="1" value="' + (g.marge || 0) + '"' + (ed ? "" : " disabled") + ' style="flex:1"><b class="mv-mono" data-marge>' + (g.marge || 0) + " %</b></div>") +
        APP.field("Eau technique (bidons de 25 L / personne / jour)", APP.input("b-tech", g.eauTech || 1.5, { type: "number", attrs: ' step="0.1" min="0"' + (ed ? "" : " disabled") })) +
        APP.field("Source des vivres", APP.seg("b-src", [["menu", "Module Cuisine"], ["manuel", "Saisie manuelle"]], g.source, { sm: true })) +
        '<p class="mv-muted mv-small" style="margin:0">Conditionnement : vivres secs en sacs, frais achetés tous les 2 jours au marché le plus proche ; poisson fumé et huile stockés à l\'ombre.</p>', { ico: "sliders" }) + "</div>";
  }
  function mountAli(el, c) {
    var g = c.groupes.B, mg = el.querySelector("#b-marge");
    if (mg) { mg.oninput = function () { el.querySelector("[data-marge]").textContent = mg.value + " %"; }; mg.onchange = function () { var old = g.marge; APP.commit("marge", function () { g.marge = +mg.value; }, { log: ["Recensement B", "Marge de sécurité", old + " %", mg.value + " %"] }); }; }
    var t = el.querySelector("#b-tech"); if (t) t.onchange = function () { var old = g.eauTech; APP.commit("tech", function () { g.eauTech = +t.value || 0; }, { log: ["Recensement B", "Eau technique", old, t.value] }); };
    var sg = el.querySelector("[data-seg=b-src]"); if (sg) sg.addEventListener("gst-change", function (e) { if (!canEdit(c, "B")) return; APP.commit("src", function () { g.source = e.detail.value; }, { log: ["Recensement B", "Source des vivres", g.source, e.detail.value] }); });
  }

  /* ── D · Santé ───────────────────────────────────────────────────────── */
  function sante(c, R, ed) {
    var g = c.groupes.D, staff = APP.state.personnes.filter(function (p) { return p.encadrant; });
    var fiches = c.inscriptions.map(function (i) { return APP.person(i.person); }).filter(Boolean);
    var al = fiches.filter(function (p) { return p.sanitaire.allergies.length; }), tr = fiches.filter(function (p) { return p.sanitaire.traitements; }), an = fiches.filter(function (p) { return p.sanitaire.antecedents; });
    var san = APP.canSanitaire();
    var bloc = !g.respSante ? '<div class="gst-alert gst-alert--critical mv-shake"><svg class="gst-icon gst-alert__ico"><use href="#i-triangle-alert"/></svg><div><div class="gst-alert__title">Blocage : aucun responsable santé désigné</div><div class="gst-alert__text">Le camp ne peut pas partir. Ce blocage est affiché sur le tableau de bord du chef de groupe.</div></div><span></span></div>' : "";
    var sous = (R.sousSeuil || []).length;
    return bloc + (sous && c.statut === "préparation" ? '<div class="gst-alert gst-alert--critical"><svg class="gst-icon gst-alert__ico"><use href="#i-heart-pulse"/></svg><div><div class="gst-alert__title">' + sous + ' article(s) sous le seuil critique</div><div class="gst-alert__text">Alerte envoyée au chef de groupe. Le départ est conditionné à ces minimums.</div></div><span></span></div>' : "") +
      '<div class="mv-g2">' + APP.card("Responsable santé & urgences", APP.field("Responsable santé (obligatoire)", APP.select("d-resp", staff.map(function (p) { return [p.id, p.prenom + " " + p.nom]; }), g.respSante || "", { ph: "— Non désigné —", attrs: ed ? "" : " disabled" })) +
        APP.field("Structure de santé la plus proche", APP.input("d-struct", g.structure || "", { attrs: ed ? "" : " readonly" })) +
        '<div class="mv-list">' + (g.contacts || []).map(function (x) { return '<div class="mv-li"><span class="mv-ico mv-ico--red">' + ico("heart-pulse") + '</span><div class="mv-li__m"><b>' + esc(x[0]) + '</b></div><a class="mv-li__v" href="tel:' + esc(x[1]) + '">' + esc(x[1]) + "</a></div>"; }).join("") + "</div>", { ico: "shield-check", tone: "red" }) +
      APP.card("Récapitulatif des fiches sanitaires", '<div class="mv-g3" style="gap:8px">' + APP.kpi("Allergies", al.length) + APP.kpi("Traitements", tr.length) + APP.kpi("Antécédents", an.length) + "</div>" +
        (san ? '<div class="mv-list">' + al.concat(tr).slice(0, 8).map(function (p) { return '<a class="mv-li" href="#/app/personne/' + p.id + '"><span class="gst-avatar">' + APP.initials(p) + '</span><div class="mv-li__m"><b>' + esc(p.prenom + " " + p.nom) + "</b><small>" + esc(p.sanitaire.allergies.join(", ") || p.sanitaire.traitements) + "</small></div></a>"; }).join("") + "</div>" : '<p class="mv-muted" style="margin:0">' + ico("lock", "gst-icon--sm") + " Noms et détails réservés à la responsable santé et au chef de groupe.</p>"), { ico: "users", tag: "ACCÈS RESTREINT" }) + "</div>" +
      APP.card("Protocole d'évacuation", '<textarea class="mv-ta" id="d-evac"' + (ed ? "" : " readonly") + ">" + esc(g.evacuation || "") + "</textarea>", { ico: "route" });
  }
  function mountSante(el, c) {
    var g = c.groupes.D;
    var r = el.querySelector("#d-resp"); if (r) r.onchange = function () { var old = g.respSante; APP.commit("respsante", function () { g.respSante = r.value || null; }, { log: ["Groupe D — Santé", "Responsable santé", old ? APP.pname(old) : "", r.value ? APP.pname(r.value) : ""] }); G.toast(r.value ? "Responsable santé désigné — blocage levé" : "Responsable retiré — blocage actif", { tag: ".01 / SANTÉ", tone: r.value ? "success" : "danger" }); };
    var s = el.querySelector("#d-struct"); if (s) s.onchange = function () { APP.commit("struct", function () { g.structure = s.value; }); };
    var e = el.querySelector("#d-evac"); if (e) e.onchange = function () { APP.commit("evac", function () { g.evacuation = e.value; }, { log: ["Groupe D — Santé", "Protocole d'évacuation", "", "mis à jour"] }); };
  }

  /* ── G · Transport ───────────────────────────────────────────────────── */
  function transport(c, R, ed) {
    var g = c.groupes.G, eff = R.eff, cap = R.capacite;
    var veh = (g.lignes || []).filter(function (l) { return ["bus70", "bus30", "camion", "pickup"].indexOf(l.art) > -1; });
    var vehOpts = [["", "—"]].concat(veh.map(function (l) { return [l.id, APP.article(l.art).nom.replace("Location ", "").replace(" — aller-retour", "")]; }));
    var load = [];
    "ACDEI".split("").forEach(function (L) { if (!c.groupes[L].open) return; R.groupes[L].rows.forEach(function (r) { if (r.need > 0 && r.a.cat !== "ALI") load.push({ L: L, r: r }); }); });
    var assigned = load.filter(function (x) { return g.chargement[x.r.l.id]; }).length;
    var it = (g.itineraires || []).map(function (x) { return '<div class="mv-li"><span class="mv-ico">' + ico(x.type.indexOf("Retour") > -1 ? "rotate-ccw" : x.type.indexOf("matériel") > -1 ? "truck" : "bus") + '</span><div class="mv-li__m"><b>' + esc(x.de) + " → " + esc(x.a) + "</b><small>" + esc(x.type) + " · " + APP.dshort(x.date) + " " + esc(x.h) + " · " + x.km + " km · " + esc(x.duree) + " · RDV " + esc(x.rdv) + " · " + esc(APP.pname(x.resp, true)) + "</small></div></div>"; }).join("");
    return '<div class="mv-g2">' + APP.card("Capacité des véhicules", '<div class="mv-row" style="gap:18px">' + APP.ring(Math.min(1, cap / Math.max(1, eff)), cap) + '<div style="flex:1;min-width:180px"><b class="gst-display-md" style="font-size:1.8rem">' + cap + " places pour " + eff + " personnes</b>" + (cap < eff ? '<p class="gst-accent" style="margin:4px 0 0">Capacité insuffisante : ajoutez un véhicule ou une rotation.</p>' : '<p class="mv-muted" style="margin:4px 0 0">Capacité suffisante. Le coût transport remonte automatiquement au groupe Économique.</p>') + "</div></div>", { ico: "bus", tone: cap < eff ? "red" : "" }) +
      APP.card("Itinéraires", '<div class="mv-list">' + (it || '<p class="mv-muted">Aucun itinéraire.</p>') + "</div>" + (ed ? '<button class="gst-btn gst-btn--secondary gst-btn--sm" data-add-it>' + ico("plus", "gst-icon--sm") + "Ajouter un trajet</button>" : ""), { ico: "route" }) + "</div>" +
      APP.card("Plan de chargement", '<p class="mv-muted" style="margin:0">Tout le matériel des autres groupes, sans oubli : ' + assigned + " / " + load.length + ' lignes affectées à un véhicule.</p><div class="mv-bar"><i style="width:' + (load.length ? (assigned / load.length) * 100 : 0) + '%"></i></div>' +
        '<div class="mv-tw" style="max-height:360px;overflow:auto"><table class="mv-t"><thead><tr><th>Groupe</th><th>Article</th><th class="n">Qté</th><th>Véhicule</th></tr></thead><tbody>' + load.map(function (x) { return "<tr><td>" + x.L + "</td><td>" + esc(x.r.a.nom) + '</td><td class="n">' + f(x.r.need) + "</td><td>" + (ed ? '<select class="mv-cell" data-load="' + x.r.l.id + '">' + vehOpts.map(function (o) { return '<option value="' + o[0] + '"' + (g.chargement[x.r.l.id] === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>" : esc((vehOpts.filter(function (o) { return o[0] === g.chargement[x.r.l.id]; })[0] || ["", "—"])[1])) + "</td></tr>"; }).join("") + "</tbody></table></div>" +
        (ed ? '<div class="mv-row"><button class="gst-btn gst-btn--secondary gst-btn--sm" data-autoload>' + ico("sparkles", "gst-icon--sm") + "Répartir automatiquement</button></div>" : ""), { ico: "truck", tag: "QUOI DANS QUEL VÉHICULE" });
  }
  function mountTransport(el, c) {
    var g = c.groupes.G;
    APP.bind(el, "change", "[data-load]", function (s) { APP.commit("load", function () { g.chargement[s.dataset.load] = s.value; }); });
    var au = el.querySelector("[data-autoload]"); if (au) au.onclick = function () {
      var R = APP.calc(c), truck = (g.lignes || []).filter(function (l) { return l.art === "camion"; })[0] || (g.lignes || []).filter(function (l) { return l.art === "bus70" || l.art === "bus30"; })[0];
      if (!truck) { G.toast("Aucun véhicule dans le recensement", { tag: ".01 / TRANSPORT", tone: "danger" }); return; }
      APP.commit("autoload", function () { "ACDEI".split("").forEach(function (L) { if (c.groupes[L].open) R.groupes[L].rows.forEach(function (r) { if (!g.chargement[r.l.id]) g.chargement[r.l.id] = truck.id; }); }); }, { log: ["Groupe G — Transport", "Plan de chargement", "", "réparti automatiquement"] });
      G.toast("Matériel affecté au " + APP.article(truck.art).nom.replace("Location ", ""), { tag: ".01 / CHARGEMENT", tone: "success" });
    };
    var ai = el.querySelector("[data-add-it]"); if (ai) ai.onclick = function () {
      var staff = APP.state.personnes.filter(function (p) { return p.encadrant; }).map(function (p) { return [p.id, p.prenom + " " + p.nom]; });
      var m = APP.modal('<span class="gst-tag">TRANSPORT · NOUVEAU TRAJET</span><form class="mv-form mv-form--2" data-it style="margin-top:12px">' + APP.field("Départ", APP.input("it-de", c.lieu)) + APP.field("Arrivée", APP.input("it-a", "")) + APP.field("Type", APP.select("it-t", ["Sortie intermédiaire", "Rotation", "Expédition matériel (camion)", "Retour"].map(function (x) { return [x, x]; }), "Sortie intermédiaire")) + APP.field("Date", APP.input("it-d", c.du, { type: "date" })) + APP.field("Heure", APP.input("it-h", "08:00", { type: "time" })) + APP.field("Distance (km)", APP.input("it-km", "20", { type: "number" })) + APP.field("Point de rendez-vous", APP.input("it-rdv", "Entrée du camp")) + APP.field("Responsable de convoi", APP.select("it-r", staff, "p-yawo")) + '<div class="mv-row is-full"><button class="gst-btn gst-btn--primary" type="submit">Ajouter</button><button class="gst-btn gst-btn--ghost" type="button" data-close>Annuler</button></div></form>', { wide: true });
      m.querySelector("[data-it]").onsubmit = function (e) { e.preventDefault(); var v = function (i) { return m.querySelector("#" + i).value; }; if (!v("it-a")) { G.toast("Arrivée requise", { tag: ".01 / TRANSPORT", tone: "danger" }); return; } var km = +v("it-km") || 0; APP.closeDrawer(); APP.commit("it", function () { g.itineraires.push({ id: APP.uid("it"), de: v("it-de"), a: v("it-a"), etapes: "—", km: km, duree: Math.max(1, Math.round(km / 40 * 60)) + " min", date: v("it-d"), h: v("it-h"), rdv: v("it-rdv"), resp: v("it-r"), type: v("it-t") }); }, { log: ["Groupe G — Transport", "Itinéraire", "", v("it-de") + " → " + v("it-a")] }); };
    };
  }

  /* ── F · Économique (M1.5) ───────────────────────────────────────────── */
  function eco(c, R) {
    var rows = S.POSTES.map(function (p) { return { p: p, v: R.postesLive[p.id] || 0 }; }).sort(function (a, b) { return b.v - a.v; });
    var colors = ["#0C7873", "#C42621", "#E5A823", "#2E8F89", "#063F3E", "#E58F5E", "#8DB65E", "#5FAAA5"];
    var split = '<div class="mv-split-bar">' + rows.map(function (r, i) { return '<i style="width:' + (R.totalLive ? (r.v / R.totalLive) * 100 : 0) + "%;background:" + colors[i] + '" title="' + esc(r.p.nom) + '"></i>'; }).join("") + '</div><div class="mv-legend">' + rows.map(function (r, i) { return '<span><i style="background:' + colors[i] + '"></i>' + r.p.nom + " " + APP.pct(r.v, R.totalLive) + "</span>"; }).join("") + "</div>";
    var tbl = '<div class="mv-tw"><table class="mv-t"><thead><tr><th>Groupe</th><th>Poste</th><th class="n">Montant</th><th class="n">Part</th><th style="width:30%"></th></tr></thead><tbody>' + rows.map(function (r, i) { return '<tr data-node="' + r.p.g + '"><td><a href="#/app/logistique/' + r.p.g + '">' + r.p.g + " — " + S.GROUPES[r.p.g].nom + "</a></td><td>" + r.p.nom + '</td><td class="n">' + APP.num("eco-" + r.p.id, r.v) + '</td><td class="n">' + APP.pct(r.v, R.totalLive) + '</td><td><div class="mv-bar"><i style="width:' + (R.totalLive ? (r.v / rows[0].v) * 100 : 0) + "%;background:" + colors[i] + '"></i></div></td></tr>'; }).join("") +
      ((c.budget.ajust || []).length ? (c.budget.ajust || []).map(function (a) { return '<tr><td colspan="2" class="mv-muted">Ajustement · ' + esc(a.just) + '</td><td class="n">' + (a.delta > 0 ? "+" : "") + f(a.delta) + "</td><td></td><td></td></tr>"; }).join("") : "") +
      '</tbody><tfoot><tr><td colspan="2">Budget consolidé</td><td class="n">' + APP.num("eco-tot", R.totalLive) + '</td><td class="n">100 %</td><td></td></tr></tfoot></table></div>';
    var sims = [60, 80, 100].map(function (n) { var X = APP.calc(c, n - c.encadrement.length > 0 ? n : n); return '<div class="mv-card' + (n === R.eff ? " mv-card--brand" : " mv-card--tint") + '"><span class="gst-tag">' + n + ' PARTICIPANTS</span><b class="gst-display-md" style="font-size:2.2rem">' + f(X.totalLive) + '<small class="mv-mono" style="font-size:11px"> F</small></b><span class="mv-mono' + (n === R.eff ? "" : " mv-muted") + '" style="font-size:11px">' + f(Math.round(X.totalLive / n)) + " F / personne · eau " + f(X.sachets) + " sachets</span></div>"; }).join("");
    var transmis = !!R.versionA;
    return '<div class="mv-ph"><div class="mv-ph__t"><span class="gst-tag gst-tag--accent" data-decode>.01 / GROUPE F · PIVOT</span><h2>F — Économique</h2><p>Il ne recense rien : il agrège tous les groupes ouverts et produit l\'évaluation budgétaire du camp. Recalcul en continu à chaque modification.</p></div><div class="mv-ph__a">' + (APP.role() === "chef" || APP.role() === "commissaire" || APP.role() === "tresorier" ? '<a class="gst-btn gst-btn--eclair" href="#/app/budget">' + ico("zap", "gst-icon--sm") + (transmis ? "Voir le prévisionnel transmis" : "Transmettre à la comptabilité") + "</a>" : "") + "</div></div>" +
      '<div class="mv-g4">' + APP.kpi("Budget consolidé", APP.num("eco-k", R.totalLive), { unit: "F CFA", cls: "mv-kpi--brand", ico: "calculator" }) + APP.kpi("Autres financements", APP.num("eco-aut", R.autres), { unit: "F CFA", sub: "Subventions, dons, cotisations" }) + APP.kpi("Reste à financer", APP.num("eco-rest", R.resteFinancer), { unit: "F CFA" }) + APP.kpi("Participation / personne", APP.num("eco-pp", R.parPersonne), { unit: "F CFA", sub: "sur " + c.inscriptions.length + " jeunes inscrits · actuelle " + f(c.inscription) + " F" }) + "</div>" +
      '<div class="mv-split">' + APP.card("Consolidation par groupe", split + tbl, { ico: "layers", tag: "EN VALEUR ET EN POURCENTAGE" }) +
      APP.card("Simulation d'effectif", '<div class="mv-stack">' + sims + '</div><div class="mv-row"><input id="eco-n" type="number" min="1" value="' + (R.eff + 10) + '" class="mv-cell" style="width:90px;height:40px;border-radius:12px;border:0;background:var(--gst-bg-sunken);padding:0 10px;font-family:var(--gst-font-mono)"><button class="gst-btn gst-btn--secondary gst-btn--sm" data-sim>Simuler</button><span class="mv-mono" data-simres></span></div>', { ico: "users", tag: "TROIS BUDGETS COMPARABLES" }) + "</div>";
  }
  function mountEco(el, c) {
    var b = el.querySelector("[data-sim]"); if (b) b.onclick = function () { var n = +el.querySelector("#eco-n").value || 1, X = APP.calc(c, n); el.querySelector("[data-simres]").innerHTML = "<b>" + cfa(X.totalLive) + "</b> · " + f(Math.round(X.totalLive / n)) + " F / pers."; };
  }

  /* ── H · Retours (M1.10) ─────────────────────────────────────────────── */
  var ETATS = ["intact", "usé", "endommagé", "perdu", "consommé"];
  function retoursRows(c) {
    var R = APP.calc(c), out = [];
    "ACDEIJ".split("").forEach(function (L) { if (!c.groupes[L].open) return; R.groupes[L].rows.forEach(function (r) { if (r.need > 0 && !r.pending) out.push({ L: L, r: r, p: c.groupes.H.pointage[r.l.id] }); }); });
    return out;
  }
  APP.retoursRows = retoursRows;
  function retours(c, R) {
    var g = c.groupes.H, rows = retoursRows(c), done = rows.filter(function (x) { return x.p; }).length;
    var perdus = rows.filter(function (x) { return x.p && x.p.etat === "perdu"; }), abimes = rows.filter(function (x) { return x.p && (x.p.etat === "endommagé" || x.p.etat === "usé"); }), conso = rows.filter(function (x) { return x.p && x.p.etat === "consommé"; });
    var ecartVal = perdus.reduce(function (s, x) { return s + x.r.cu * (x.p.perdu || x.r.need); }, 0);
    var canPoint = (APP.canGroup("H", true) || APP.role() === "commissaire" || APP.role() === "chef") && !g.publie;
    var tb = rows.map(function (x) {
      var p = x.p || {};
      return "<tr" + (p.etat === "perdu" ? ' class="is-pending"' : "") + "><td>" + x.L + "</td><td>" + esc(x.r.a.nom) + '</td><td class="n">' + f(x.r.need) + "</td><td>" + (canPoint ? '<select class="mv-cell" data-pt="' + x.r.l.id + '"><option value="">— à pointer —</option>' + ETATS.map(function (e) { return '<option value="' + e + '"' + (p.etat === e ? " selected" : "") + ">" + e + "</option>"; }).join("") + "</select>" : (p.etat ? APP.badge(p.etat) : "—")) + '</td><td class="n">' + (p.etat === "perdu" ? '<span class="is-miss">−' + f(p.perdu || x.r.need) + "</span>" : p.etat ? "0" : "") + "</td></tr>";
    }).join("");
    return '<div class="mv-ph"><div class="mv-ph__t"><span class="gst-tag gst-tag--accent" data-decode>.01 / GROUPE H · LOGISTIQUE INVERSÉE</span><h2>H — Retours</h2><p>Pointage ligne par ligne, sur téléphone, même sans réseau. Les écarts se calculent seuls ; le bilan est rendu public, sans aucune donnée nominative.</p></div><div class="mv-ph__a">' +
      (canPoint ? '<button class="gst-btn gst-btn--secondary" data-allok>' + ico("check", "gst-icon--sm") + 'Tout intact (pré-remplir)</button><button class="gst-btn gst-btn--primary" data-sync-inv>' + ico("box", "gst-icon--sm") + "Mettre à jour l'inventaire</button>" : "") +
      ((APP.role() === "chef" || APP.role() === "commissaire") && !g.publie ? '<button class="gst-btn gst-btn--eclair" data-publish>' + ico("arrow-up-right", "gst-icon--sm") + "Publier le bilan de retour</button>" : g.publie ? '<a class="gst-btn gst-btn--brand" href="#/site/bilans/' + c.id + '">' + ico("eye", "gst-icon--sm") + "Bilan publié — voir</a>" : "") + "</div></div>" +
      (!APP.state.online ? '<div class="gst-alert gst-alert--warning"><svg class="gst-icon gst-alert__ico"><use href="#i-wifi-off"/></svg><div><div class="gst-alert__title">Pointage hors ligne</div><div class="gst-alert__text">Chaque ligne pointée est gardée sur l\'appareil et partira au retour du réseau.</div></div><span></span></div>' : "") +
      '<div class="mv-g4">' + APP.kpi("Lignes pointées", done + "<small>/ " + rows.length + "</small>", { ico: "check", cls: "mv-kpi--brand" }) + APP.kpi("Perdu", perdus.length, { ico: "triangle-alert", tone: perdus.length ? "red" : "", sub: "Valeur " + f(ecartVal) + " F" }) + APP.kpi("Usé / endommagé", abimes.length, { ico: "wrench", sub: "À réparer ou réformer" }) + APP.kpi("Consommé", conso.length, { ico: "leaf" }) + "</div>" +
      APP.card("Pointage de retour", '<div class="mv-bar"><i style="width:' + (rows.length ? (done / rows.length) * 100 : 0) + '%"></i></div><div class="mv-tw"><table class="mv-t"><thead><tr><th>Gr.</th><th>Article</th><th class="n">Parti</th><th>État constaté</th><th class="n">Écart</th></tr></thead><tbody>' + tb + "</tbody></table></div>", { ico: "rotate-ccw", tag: "PARTI CONTRE REVENU" }) +
      (abimes.length ? APP.card("À réparer, remplacer, réformer", '<div class="mv-list">' + abimes.map(function (x) { return '<div class="mv-li"><span class="mv-ico mv-ico--yel">' + ico("wrench") + '</span><div class="mv-li__m"><b>' + esc(x.r.a.nom) + "</b><small>" + x.p.etat + " · groupe " + x.L + "</small></div></div>"; }).join("") + "</div>", { ico: "wrench" }) : "");
  }
  function mountRetours(el, c) {
    var g = c.groupes.H;
    APP.bind(el, "change", "[data-pt]", function (s) { var id = s.dataset.pt, v = s.value; APP.commit("pt", function () { if (v) g.pointage[id] = { etat: v }; else delete g.pointage[id]; if (g.statut === "à venir") g.statut = "en cours"; }, { log: ["Retours — pointage", "État", "", v] }); });
    var ok = el.querySelector("[data-allok]"); if (ok) ok.onclick = function () { APP.commit("allok", function () { retoursRows(c).forEach(function (x) { if (!g.pointage[x.r.l.id]) g.pointage[x.r.l.id] = { etat: x.r.a.cat === "SAN" || x.r.a.cat === "SAL" ? "consommé" : "intact" }; }); if (g.statut === "à venir") g.statut = "en cours"; }, { log: ["Retours — pointage", "Pré-remplissage", "", "intact / consommé"] }); };
    var si = el.querySelector("[data-sync-inv]"); if (si) si.onclick = function () {
      var n = 0;
      APP.commit("inv", function (st) {
        retoursRows(c).forEach(function (x) {
          if (!x.p || !x.r.l.inv) return;
          var items = st.inventaire.filter(function (it) { return it.art === x.r.l.art && it.etat !== "hors service"; });
          if (!items.length) return;
          var it = items[0], map = { "usé": "usé", "endommagé": "à réparer", "perdu": null };
          if (x.p.etat === "perdu") { it.qte = Math.max(0, it.qte - 1); it.hist.push({ d: st.today, t: "Retour " + c.court + " — 1 unité perdue" }); n++; }
          else if (map[x.p.etat]) { it.etat = map[x.p.etat]; it.hist.push({ d: st.today, t: "Retour " + c.court + " — état : " + map[x.p.etat] }); n++; }
          else it.hist.push({ d: st.today, t: "Retour " + c.court + " — intact" });
        });
      }, { log: ["Inventaire permanent", "Mise à jour depuis le retour", "", c.court] });
      G.toast("Inventaire mis à jour (" + n + " changement(s))", { tag: ".01 / INVENTAIRE", tone: "success" });
    };
    var pb = el.querySelector("[data-publish]"); if (pb) pb.onclick = function () {
      APP.confirm("Publier le bilan de retour ?", "Le bilan sera visible sur le site public : quantités, états et écarts, sans aucun nom ni donnée sensible.", "Publier", { eclair: true }).then(function (y) { if (!y) return; APP.commit("pub", function () { g.publie = true; g.statut = "publié"; }, { log: ["Retours", "Bilan de retour", "brouillon", "publié"] }); G.toast("Bilan publié sur le site", { tag: ".01 / TRANSPARENCE", tone: "success" }); });
    };
  }

  /* ══ Inventaire permanent (M1.8) ════════════════════════════════════════ */
  APP.route("/app/inventaire", { title: "Inventaire permanent", perm: "inventaire", crumb: "LOGISTIQUE / INVENTAIRE", render: function (p) {
    var fe = p.q.e || "", fd = p.q.d || "", c = APP.camp();
    var L = APP.state.inventaire.filter(function (it) { return (!fe || it.etat === fe) && (!fd || it.det === fd); });
    var dets = {}; APP.state.inventaire.forEach(function (it) { dets[it.det] = 1; });
    var tot = APP.state.inventaire.reduce(function (s, it) { return s + it.qte; }, 0), hs = APP.state.inventaire.filter(function (it) { return it.etat === "hors service"; }).reduce(function (s, it) { return s + it.qte; }, 0);
    var canW = APP.role() === "chef" || APP.role() === "commissaire";
    var rows = L.map(function (it) { var a = APP.article(it.art); return '<tr class="' + (it.etat === "hors service" ? "is-hs" : "") + '"><td><a href="#/app/inventaire/' + it.id + '">' + esc(a.nom) + '</a></td><td class="n">' + it.qte + "</td><td>" + (canW ? '<select class="mv-cell" data-etat="' + it.id + '">' + ["neuf", "bon", "usé", "à réparer", "hors service"].map(function (e) { return "<option" + (it.etat === e ? " selected" : "") + ">" + e + "</option>"; }).join("") + "</select>" : esc(it.etat)) + "</td><td>" + esc(it.loc) + "</td><td>" + esc(APP.pname(it.det, true)) + "</td><td>" + (it.sortie ? '<span class="gst-badge gst-badge--warning">sorti · ' + esc(APP.camp(it.sortie).court) + "</span>" : '<span class="gst-badge gst-badge--success">au local</span>') + "</td><td>" + (canW ? '<button class="gst-btn gst-btn--ghost gst-btn--sm" data-out="' + it.id + '">' + (it.sortie ? "Retour" : "Sortie") + "</button>" : "") + "</td></tr>"; }).join("");
    return APP.head(".01 / INVENTAIRE PERMANENT", "Le patrimoine du GST", "Il vit entre les camps et alimente le champ « disponible » de tous les recensements. Un article hors service n'est jamais compté comme disponible.", canW ? '<button class="gst-btn gst-btn--primary" data-new-inv>' + ico("plus", "gst-icon--sm") + "Nouvel article d'inventaire</button>" : "") +
      '<div class="mv-g4">' + APP.kpi("Unités en stock", tot, { ico: "box", cls: "mv-kpi--brand" }) + APP.kpi("Hors service", hs, { ico: "triangle-alert", tone: "red", sub: "Jamais comptées disponibles" }) + APP.kpi("À réparer", APP.state.inventaire.filter(function (it) { return it.etat === "à réparer"; }).length + " lots", { ico: "wrench" }) + APP.kpi("Sortis pour un camp", APP.state.inventaire.filter(function (it) { return it.sortie; }).length + " lots", { ico: "truck" }) + "</div>" +
      '<div class="mv-card"><div class="mv-row">' + APP.select("iv-e", ["neuf", "bon", "usé", "à réparer", "hors service"].map(function (e) { return [e, e]; }), fe, { ph: "Tous les états" }) + APP.select("iv-d", Object.keys(dets).map(function (d) { return [d, APP.pname(d)]; }), fd, { ph: "Tous les détenteurs" }) + '</div><div class="mv-tw"><table class="mv-t"><thead><tr><th>Article</th><th class="n">Qté</th><th>État</th><th>Localisation</th><th>Détenteur</th><th>Affectation</th><th></th></tr></thead><tbody>' + rows + "</tbody></table></div></div>";
  }, mount: function (el) {
    el.querySelector("#iv-e").onchange = el.querySelector("#iv-d").onchange = function () { APP.go("#/app/inventaire?e=" + el.querySelector("#iv-e").value + "&d=" + el.querySelector("#iv-d").value); };
    APP.bind(el, "change", "[data-etat]", function (s) { var it = APP.state.inventaire.filter(function (x) { return x.id === s.dataset.etat; })[0], old = it.etat; APP.commit("etat", function (st) { it.etat = s.value; it.hist.push({ d: st.today, t: "État : " + old + " → " + s.value }); }, { log: ["Inventaire · " + APP.article(it.art).nom, "État", old, s.value] }); });
    APP.bind(el, "click", "[data-out]", function (b) {
      var it = APP.state.inventaire.filter(function (x) { return x.id === b.dataset.out; })[0], c = APP.camp();
      if (it.sortie) { APP.commit("ret", function (st) { it.hist.push({ d: st.today, t: "Retour de " + APP.camp(it.sortie).court }); it.sortie = null; }, { log: ["Inventaire · " + APP.article(it.art).nom, "Affectation", "sorti", "au local"] }); return; }
      var staff = APP.state.personnes.filter(function (p) { return p.encadrant; }).map(function (p) { return [p.id, p.prenom + " " + p.nom]; });
      var m = APP.modal('<span class="gst-tag">SORTIE DE MATÉRIEL</span><h4 class="gst-display-md" style="margin:10px 0">' + esc(APP.article(it.art).nom) + " × " + it.qte + "</h4>" + APP.field("Camp", APP.select("o-c", APP.state.camps.filter(function (x) { return x.statut !== "clos"; }).map(function (x) { return [x.id, x.court]; }), c.id)) + APP.field("Détenteur (obligatoire)", APP.select("o-d", staff, it.det)) + '<div class="mv-row" style="margin-top:14px"><button class="gst-btn gst-btn--primary" data-ok>Sortir</button><button class="gst-btn gst-btn--ghost" data-close>Annuler</button></div>');
      m.querySelector("[data-ok]").onclick = function () { var cid = m.querySelector("#o-c").value, d = m.querySelector("#o-d").value; APP.closeDrawer(); APP.commit("out", function (st) { it.sortie = cid; it.det = d; it.hist.push({ d: st.today, t: "Sortie pour " + APP.camp(cid).court + " — détenteur " + APP.pname(d) }); }, { log: ["Inventaire · " + APP.article(it.art).nom, "Sortie", "au local", APP.camp(cid).court + " · " + APP.pname(d, true)] }); };
    });
    var ni = el.querySelector("[data-new-inv]"); if (ni) ni.onclick = function () {
      var staff = APP.state.personnes.filter(function (p) { return p.encadrant; }).map(function (p) { return [p.id, p.prenom + " " + p.nom]; });
      var m = APP.modal('<span class="gst-tag">INVENTAIRE · NOUVEL ARTICLE</span><form class="mv-form mv-form--2" data-ni style="margin-top:12px">' + APP.field("Article (base de prix)", APP.select("ni-a", APP.state.articles.filter(function (a) { return a.cat !== "ALI"; }).map(function (a) { return [a.id, a.nom]; }), "tente6"), { cls: "is-full" }) + APP.field("Quantité", APP.input("ni-q", "1", { type: "number" })) + APP.field("État", APP.select("ni-e", ["neuf", "bon", "usé", "à réparer", "hors service"].map(function (e) { return [e, e]; }), "neuf")) + APP.field("Localisation", APP.input("ni-l", "Local GST — Bè")) + APP.field("Détenteur", APP.select("ni-d", staff, "p-komi")) + '<div class="mv-row is-full"><button class="gst-btn gst-btn--primary" type="submit">Ajouter</button><button class="gst-btn gst-btn--ghost" type="button" data-close>Annuler</button></div></form>', { wide: true });
      m.querySelector("[data-ni]").onsubmit = function (e) { e.preventDefault(); var v = function (i) { return m.querySelector("#" + i).value; }; APP.closeDrawer(); APP.commit("ni", function (st) { st.inventaire.push({ id: APP.uid("inv"), art: v("ni-a"), qte: +v("ni-q") || 1, etat: v("ni-e"), loc: v("ni-l"), det: v("ni-d"), sortie: null, hist: [{ d: st.today, t: "Achat / entrée en inventaire" }] }); }, { log: ["Inventaire", "Nouvel article", "", APP.article(v("ni-a")).nom + " × " + v("ni-q")] }); G.toast("Ajouté — les recensements lisent la nouvelle quantité", { tag: ".01 / INVENTAIRE", tone: "success" }); };
    };
  } });
  APP.route("/app/inventaire/:id", { title: "Fiche d'inventaire", perm: "inventaire", crumb: "LOGISTIQUE / INVENTAIRE / FICHE", render: function (p) {
    var it = APP.state.inventaire.filter(function (x) { return x.id === p.id; })[0]; if (!it) return APP.empty("Introuvable", "");
    var a = APP.article(it.art);
    return APP.head(".01 / FICHE D'INVENTAIRE", esc(a.nom), it.qte + " unité(s) · " + esc(it.etat) + " · " + esc(it.loc)) + '<div class="mv-g2">' + APP.card("Affectation", '<dl class="gst-spec gst-spec--rules"><dt>Détenteur</dt><dd>' + esc(APP.pname(it.det)) + "</dd><dt>Localisation</dt><dd>" + esc(it.loc) + "</dd><dt>Affectation</dt><dd>" + (it.sortie ? "Sorti pour " + esc(APP.camp(it.sortie).court) : "Au local") + "</dd><dt>Valeur de remplacement</dt><dd>" + cfa(APP.prix(a.id).montant * it.qte) + "</dd></dl>", { ico: "user" }) +
      APP.card("Historique de vie", '<div class="mv-tl">' + it.hist.slice().reverse().map(function (h) { return '<div class="mv-tl__i"><span class="gst-tag">' + APP.dshort(h.d) + "</span><div>" + esc(h.t) + "</div></div>"; }).join("") + "</div>", { ico: "history" }) + "</div>";
  } });

  /* ══ Fournisseurs & devis (M1.9) ═══════════════════════════════════════ */
  APP.route("/app/fournisseurs", { title: "Fournisseurs & devis", perm: "fournisseurs", crumb: "LOGISTIQUE / FOURNISSEURS & DEVIS", render: function () {
    var c = APP.camp();
    var devis = (c.devis || []).map(function (d) {
      var min = Math.min.apply(null, d.offres.map(function (o) { return o.m; })), max = Math.max.apply(null, d.offres.map(function (o) { return o.m; }));
      return APP.card(esc(d.poste), '<div class="mv-g3">' + d.offres.map(function (o, i) { var F = APP.fournisseur(o.f), best = o.m === min, ret = d.retenu === o.f && (d.retenuIdx == null || d.retenuIdx === i); return '<div class="mv-card ' + (ret ? "mv-card--brand" : best ? "mv-card--tint" : "") + '" style="gap:8px"><span class="gst-tag">' + esc(F.nom.toUpperCase()) + "</span><b class=\"gst-display-md\" style=\"font-size:2rem\">" + f(o.m) + '<small class="mv-mono" style="font-size:11px"> F</small></b><span class="mv-mono" style="font-size:11px">' + (best ? "Le moins cher" : "+" + f(o.m - min) + " F (" + APP.pct(o.m - min, min) + ")") + (o.note ? " · " + esc(o.note) : "") + " · fiabilité " + "★".repeat(F.fiab) + "</span>" + (ret ? '<span class="gst-badge">retenu · ' + esc(d.commande || "à commander") + "</span>" : !d.retenu ? '<button class="gst-btn gst-btn--secondary gst-btn--sm" data-ret="' + d.id + "|" + i + '">Retenir ce devis</button>' : "") + "</div>"; }).join("") + "</div>" +
        '<div class="gst-alert gst-alert--success"><svg class="gst-icon gst-alert__ico"><use href="#i-coins"/></svg><div><div class="gst-alert__title">Économie potentielle : ' + cfa(max - min) + " (" + APP.pct(max - min, max) + ')</div><div class="gst-alert__text">Entre le devis le plus cher et le moins cher.</div></div><span></span></div>' +
        (d.retenu ? '<div class="mv-row"><span class="gst-label">Suivi de commande</span>' + APP.seg("cmd-" + d.id, [["à commander", "À commander"], ["commandé", "Commandé"], ["livré", "Livré"]], d.commande || "à commander", { sm: true }) + "</div>" : ""), { ico: "file-text", tag: "GROUPE " + d.g + " · " + d.offres.length + " DEVIS" });
    }).join("");
    var carnet = APP.state.fournisseurs.map(function (F) { return '<div class="mv-li"><span class="mv-ico">' + ico("truck") + '</span><div class="mv-li__m"><b>' + esc(F.nom) + "</b><small>" + esc(F.spe) + " · " + esc(F.contact) + '</small></div><span class="mv-li__v" title="Fiabilité">' + "★".repeat(F.fiab) + "☆".repeat(5 - F.fiab) + "</span></div>"; }).join("");
    return APP.head(".01 / FOURNISSEURS & DEVIS", "Comparer avant d'acheter", "Deux devis comparés, c'est souvent 10 à 20 % d'un poste économisés.", '<button class="gst-btn gst-btn--primary" data-new-dv>' + ico("plus", "gst-icon--sm") + "Nouveau devis</button>") +
      '<div class="mv-split"><div class="mv-stack">' + (devis || APP.card("Devis", APP.empty("Aucun devis pour ce camp", "Enregistrez des devis concurrents sur un même poste pour les comparer côte à côte."))) + "</div>" + APP.card("Carnet de fournisseurs", '<div class="mv-list">' + carnet + "</div>", { ico: "users" }) + "</div>";
  }, mount: function (el) {
    var c = APP.camp();
    APP.bind(el, "click", "[data-ret]", function (b) { var p = b.dataset.ret.split("|"), d = c.devis.filter(function (x) { return x.id === p[0]; })[0], o = d.offres[+p[1]]; APP.commit("ret", function () { d.retenu = o.f; d.retenuIdx = +p[1]; d.commande = "à commander"; }, { log: ["Devis · " + d.poste, "Devis retenu", "", APP.fournisseur(o.f).nom + " · " + f(o.m)] }); G.toast("Devis retenu", { tag: ".01 / DEVIS", tone: "success" }); });
    el.querySelectorAll("[data-seg^=cmd-]").forEach(function (s) { s.addEventListener("gst-change", function (e) { var id = s.dataset.seg.slice(4), d = c.devis.filter(function (x) { return x.id === id; })[0]; APP.commit("cmd", function () { d.commande = e.detail.value; }, { log: ["Devis · " + d.poste, "Commande", "", e.detail.value] }); }); });
    el.querySelector("[data-new-dv]").onclick = function () {
      var m = APP.modal('<span class="gst-tag">NOUVEAU DEVIS</span><form class="mv-form mv-form--2" data-dv style="margin-top:12px">' + APP.field("Poste", APP.input("dv-p", "Location sonorisation — 4 jours"), { cls: "is-full" }) + APP.field("Groupe", APP.select("dv-g", "ABCDEGIJ".split("").map(function (L) { return [L, L + " — " + S.GROUPES[L].nom]; }), "A")) + APP.field("Fournisseur", APP.select("dv-f", APP.state.fournisseurs.map(function (F) { return [F.id, F.nom]; }), "f8")) + APP.field("Montant", APP.input("dv-m", "60000", { money: true })) + "<div></div>" + APP.field("Second fournisseur", APP.select("dv-f2", APP.state.fournisseurs.map(function (F) { return [F.id, F.nom]; }), "f6")) + APP.field("Montant", APP.input("dv-m2", "52000", { money: true })) + '<div class="mv-row is-full"><button class="gst-btn gst-btn--primary" type="submit">Comparer</button><button class="gst-btn gst-btn--ghost" type="button" data-close>Annuler</button></div></form>', { wide: true });
      m.querySelector("[data-dv]").onsubmit = function (e) { e.preventDefault(); var v = function (i) { return m.querySelector("#" + i).value; }; APP.closeDrawer(); APP.commit("dv", function () { c.devis.push({ id: APP.uid("dv"), poste: v("dv-p"), g: v("dv-g"), offres: [{ f: v("dv-f"), m: APP.money(v("dv-m")) }, { f: v("dv-f2"), m: APP.money(v("dv-m2")) }], retenu: null, commande: null }); }, { log: ["Devis", "Nouveau devis", "", v("dv-p")] }); };
    };
  } });

  /* ══ Documents administratifs (M1.9) ═══════════════════════════════════ */
  APP.route("/app/documents", { title: "Documents administratifs", perm: "documents", crumb: "LOGISTIQUE / DOCUMENTS", render: function (p) {
    var c = APP.camp(), R = APP.calc(c), T = S.TYPES[c.type], only = p.q.m === "1";
    var dj = APP.diffDays(APP.state.today, c.du);
    var list = [["auto", "Autorisation parentale"], ["sanitaire", "Fiche sanitaire signée"], ["assurance", "Attestation d'assurance"]];
    var checklist = list.map(function (x) { return x[1]; }).concat(["Liste nominative des participants", "Déclaration du camp au district"]).concat(T.international ? ["Passeports en cours de validité", "Autorisations de sortie du territoire", "Visas / lettres d'invitation"] : []);
    var ins = c.inscriptions.filter(function (i) { return !only || !i.docs.auto || !i.docs.sanitaire || !i.docs.assurance; });
    var sansAuto = c.inscriptions.filter(function (i) { return !i.docs.auto; });
    var canW = APP.role() === "chef" || APP.role() === "commissaire";
    var rows = ins.map(function (i) { var pp = APP.person(i.person); return "<tr><td>" + esc(pp.prenom + " " + pp.nom) + "</td><td>" + esc(APP.unite(pp.unite) ? APP.unite(pp.unite).nom : "") + "</td>" + list.map(function (x) { return '<td style="text-align:center">' + (canW ? '<button class="mv-doc ' + (i.docs[x[0]] ? "is-ok" : "") + '" data-doc="' + i.id + "|" + x[0] + '" aria-label="' + x[1] + '">' + ico(i.docs[x[0]] ? "check" : "x", "gst-icon--sm") + "</button>" : (i.docs[x[0]] ? "✓" : "✗")) + "</td>"; }).join("") + "</td></tr>"; }).join("");
    var bloc = R.docsManquants.length && dj <= 7 && c.statut === "préparation";
    return APP.head(".01 / DOCUMENTS ADMINISTRATIFS", "Pièces obligatoires", "Checklist par type de camp, suivi des pièces manquantes par personne. Un camp avec des documents manquants est bloqué à J-7.", '<a class="gst-btn gst-btn--secondary" href="#/app/documents?m=' + (only ? "0" : "1") + '">' + ico("filter", "gst-icon--sm") + (only ? "Tous les participants" : "Dossiers incomplets") + "</a>") +
      (bloc ? '<div class="gst-alert gst-alert--critical"><svg class="gst-icon gst-alert__ico"><use href="#i-triangle-alert"/></svg><div><div class="gst-alert__title">Départ bloqué — J-' + dj + '</div><div class="gst-alert__text">' + R.docsManquants.length + " dossier(s) incomplet(s).</div></div><span></span></div>" : "") +
      '<div class="mv-g4">' + APP.kpi("Dossiers complets", (c.inscriptions.length - R.docsManquants.length) + "<small>/ " + c.inscriptions.length + "</small>", { ico: "shield-check", cls: "mv-kpi--brand" }) + APP.kpi("Sans autorisation parentale", sansAuto.length, { ico: "file-text", tone: sansAuto.length ? "red" : "", sub: '<a href="#/app/documents?m=1">Voir la liste en un écran</a>' }) + APP.kpi("Fiches sanitaires manquantes", c.inscriptions.filter(function (i) { return !i.docs.sanitaire; }).length, { ico: "heart-pulse" }) + APP.kpi("Échéance de blocage", dj > 7 ? "J-7" : "Atteinte", { ico: "clock", sub: APP.dlong(APP.addDays(c.du, -7)) }) + "</div>" +
      '<div class="mv-split">' + APP.card("Participants", '<div class="mv-tw" style="max-height:560px;overflow:auto"><table class="mv-t"><thead><tr><th>Participant</th><th>Unité</th>' + list.map(function (x) { return '<th style="text-align:center">' + x[1].split(" ")[0] + (x[1].split(" ")[1] ? " " + x[1].split(" ")[1] : "") + "</th>"; }).join("") + "</tr></thead><tbody>" + rows + "</tbody></table></div>", { ico: "users", tag: ins.length + " LIGNE(S)" }) +
      APP.card("Checklist · " + T.court, '<div class="mv-stack">' + checklist.map(function (x, k) { return APP.check("ck" + k, k >= 3 ? k === 3 : !R.docsManquants.length, x); }).join("") + "</div>" + '<button class="gst-btn gst-btn--secondary gst-btn--sm" data-upl>' + ico("cloud-upload", "gst-icon--sm") + "Déposer un fichier</button>", { ico: "list" }) + "</div>";
  }, mount: function (el) {
    var c = APP.camp();
    APP.bind(el, "click", "[data-doc]", function (b) { var p = b.dataset.doc.split("|"), i = c.inscriptions.filter(function (x) { return x.id === p[0]; })[0]; APP.commit("doc", function () { i.docs[p[1]] = !i.docs[p[1]]; }, { log: ["Documents · " + APP.pname(i.person), p[1], i.docs[p[1]] ? "manquant" : "reçu", i.docs[p[1]] ? "reçu" : "manquant"] }); });
    var u = el.querySelector("[data-upl]"); if (u) u.onclick = function () { var inp = document.createElement("input"); inp.type = "file"; inp.onchange = function () { if (inp.files[0]) G.toast("« " + inp.files[0].name + " » déposé — stocké hors ligne", { tag: ".01 / DOCUMENTS", tone: "success" }); }; inp.click(); };
  } });
})();
