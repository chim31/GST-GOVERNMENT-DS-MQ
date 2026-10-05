/* GST GOVERNMENT — MVP · Données & intelligence (P6) : base de références, hook des prix */
(function () {
  "use strict";
  var G = window.GST, APP = window.APP, S = window.GST_SEED;
  var ico = APP.ico, esc = APP.esc, f = APP.f, cfa = APP.cfa;

  /* ══ Mémoire du GST & base de références (M6.1) ═════════════════════════ */
  function ratio(r) { return Math.round((r.ali + r.tra + r.mat + r.autres) / r.effectif / r.jours); }
  APP.route("/app/references", { title: "Base de références", perm: "references", crumb: "MÉMOIRE / BASE DE RÉFÉRENCES", render: function (p) {
    var refs = APP.state.references, lvl = p.q.l || "total";
    var types = {}; refs.forEach(function (r) { (types[r.type] = types[r.type] || []).push(r); });
    var ratios = Object.keys(types).map(function (t) { var L = types[t]; return { t: t, n: L.length, v: Math.round(L.reduce(function (s, r) { return s + ratio(r); }, 0) / L.length), ali: Math.round(L.reduce(function (s, r) { return s + r.ali / r.effectif / r.jours; }, 0) / L.length) }; });
    var rows = refs.slice().sort(function (a, b) { return b.annee - a.annee; }).map(function (r) { return "<tr><td>" + esc(r.nom) + (r.camp ? ' <span class="gst-badge gst-badge--success">versé à la clôture</span>' : r.modele ? ' <span class="gst-badge gst-badge--brand">modèle</span>' : "") + "</td><td>" + esc(S.TYPES[r.type].court) + '</td><td class="n">' + r.effectif + '</td><td class="n">' + r.jours + '</td><td class="n">' + f(r.ali) + '</td><td class="n">' + f(r.tra) + '</td><td class="n">' + f(r.mat) + '</td><td class="n">' + f(r.autres) + '</td><td class="n"><b>' + f(ratio(r)) + "</b></td><td>" + (APP.role() === "chef" ? '<button class="gst-btn gst-btn--ghost gst-btn--sm" data-tpl="' + r.id + '">' + ico("layers", "gst-icon--sm") + "Modèle</button>" : "") + "</td></tr>"; }).join("");
    return APP.head(".06 / MÉMOIRE DU GST", "Base de références", "Les chiffres réels de nos camps passés — même ceux d'avant la plateforme — à trois niveaux : alimentaire, transport, matériel. Chaque camp clôturé s'y verse tout seul.", '<button class="gst-btn gst-btn--primary" data-new-ref>' + ico("plus", "gst-icon--sm") + "Saisir un camp antérieur</button>") +
      '<div class="mv-g4">' + ratios.map(function (r) { return APP.kpi(S.TYPES[r.t].court, f(r.v), { unit: "F / pers. / jour", ico: "layers", sub: r.n + " camp(s) · dont alimentaire " + f(r.ali) + " F" }); }).join("") + "</div>" +
      APP.card("Camps de référence", '<div class="mv-tw"><table class="mv-t"><thead><tr><th>Camp</th><th>Type</th><th class="n">Eff.</th><th class="n">Jours</th><th class="n">Alimentaire</th><th class="n">Transport</th><th class="n">Matériel</th><th class="n">Autres</th><th class="n">F / pers. / j</th><th></th></tr></thead><tbody>' + rows + "</tbody></table></div>", { ico: "layers", tag: refs.length + " CAMPS" }) +
      APP.card("Estimation automatique à l'ouverture", '<p class="mv-muted" style="margin:0">Le formulaire d\'ouverture propose une enveloppe à partir du ratio du type de camp. Exemple pour un camp de réjouissance de 80 personnes sur 14 jours :</p><b class="gst-display-md" style="font-size:2.4rem">' + cfa(((ratios.filter(function (r) { return r.t === "rejouissance"; })[0] || { v: 0 }).v) * 80 * 14) + '</b><a class="gst-btn gst-btn--secondary gst-btn--sm" href="#/app/camps/nouveau">Ouvrir un camp</a>', { ico: "sparkles", tone: "yel" });
  }, mount: function (el) {
    el.querySelector("[data-new-ref]").onclick = function () {
      var m = APP.modal('<span class="gst-tag">MÉMOIRE · CAMP ANTÉRIEUR</span><form class="mv-form mv-form--2" data-nr style="margin-top:12px">' + APP.field("Nom", APP.input("nr-n", "Réjouissance 2022 — Vogan"), { cls: "is-full", req: true }) + APP.field("Type", APP.select("nr-t", Object.keys(S.TYPES).map(function (k) { return [k, S.TYPES[k].court]; }), "rejouissance")) + APP.field("Année", APP.input("nr-a", "2022", { type: "number" })) + APP.field("Effectif", APP.input("nr-e", "58", { type: "number" })) + APP.field("Jours", APP.input("nr-j", "12", { type: "number" })) + APP.field("Alimentaire réel", APP.input("nr-ali", "1180000", { money: true })) + APP.field("Transport réel", APP.input("nr-tra", "760000", { money: true })) + APP.field("Matériel réel", APP.input("nr-mat", "390000", { money: true })) + APP.field("Autres postes", APP.input("nr-aut", "560000", { money: true })) + '<div class="mv-row is-full"><button class="gst-btn gst-btn--primary" type="submit">Verser dans la base</button><button class="gst-btn gst-btn--ghost" type="button" data-close>Annuler</button></div></form>', { wide: true });
      m.querySelector("[data-nr]").onsubmit = function (e) { e.preventDefault(); var v = function (i) { return m.querySelector("#" + i).value; }; APP.closeDrawer(); APP.commit("ref", function (st) { st.references.push({ id: APP.uid("ref"), nom: v("nr-n"), type: v("nr-t"), annee: +v("nr-a"), effectif: +v("nr-e") || 1, jours: +v("nr-j") || 1, ali: APP.money(v("nr-ali")), tra: APP.money(v("nr-tra")), mat: APP.money(v("nr-mat")), autres: APP.money(v("nr-aut")), source: "Saisie manuelle (archives)" }); }, { log: ["Base de références", "Camp antérieur", "", v("nr-n")] }); G.toast("Versé — les ratios se recalculent", { tag: ".06 / MÉMOIRE", tone: "success" }); };
    };
    APP.bind(el, "click", "[data-tpl]", function (b) {
      var r = APP.state.references.filter(function (x) { return x.id === b.dataset.tpl; })[0];
      APP.confirm("Créer un camp à partir de « " + r.nom + " » ?", "Le formulaire d'ouverture sera pré-rempli avec ce type de camp et ses groupes : plus de 80 % du recensement est déjà là, il reste à ajuster l'effectif.", "Partir de ce modèle").then(function (ok) { if (ok) APP.go("#/app/camps/nouveau"); });
    });
  } });

  /* ══ Hook intelligent des prix (M6.2) ═══════════════════════════════════ */
  function flags(h) {
    var a = APP.article(h.art), cur = APP.prix(h.art), d = cur.montant ? (h.prix - cur.montant) / cur.montant : 0, out = [];
    if (Math.abs(d) > 0.3) out.push({ k: "abnormal", t: "Écart anormal : " + (d > 0 ? "+" : "") + Math.round(d * 100) + " % vs la base — à contrôler" });
    if (cur.perime) out.push({ k: "old", t: "Prix en base périmé (" + APP.dshort(cur.date) + ")" });
    if (["tomate", "poisson", "igname"].indexOf(h.art) > -1) out.push({ k: "season", t: "Saisonnalité : plus cher à la même période l'an dernier" });
    return { a: a, cur: cur, d: d, out: out };
  }
  function impact(artId, nv) {
    var c = APP.camp("k26"), before = APP.calc(c).totalLive, a = APP.article(artId), saved = a.prix;
    a.prix = saved.concat([{ id: "tmp", montant: nv, marche: "", date: APP.state.today, source: "", statut: "validé" }]);
    APP._v = (APP._v || 0) + 1; var after = APP.calc(c).totalLive;
    a.prix = saved; APP._v++;
    return after - before;
  }
  APP.route("/app/hook", { title: "Hook des prix", perm: "hook|references", crumb: "MÉMOIRE / HOOK DES PRIX", render: function () {
    var q = APP.state.hook, sug = q.filter(function (h) { return h.statut === "suggestion"; }), done = q.filter(function (h) { return h.statut !== "suggestion"; });
    var c = APP.camp("k26"), R = APP.calc(c);
    var perimes = APP.state.articles.filter(function (a) { return APP.prix(a.id).perime; });
    // Écarts prévu / réel : prix payés sur le terrain (dépenses R26)
    var terrain = [{ art: "tomate", paye: 950, src: "Dépense R26 · vivres frais J.05" }, { art: "gasoil", paye: 705, src: "Dépense R26 · carburant convoi J.04" }];
    var cards = sug.map(function (h) {
      var F = flags(h), imp = impact(h.art, h.prix);
      return '<div class="gst-hook' + (F.out.some(function (x) { return x.k === "abnormal"; }) ? " mv-hook--warn" : "") + '">' + ico("lightbulb", "gst-icon--lg gst-hook__ico") + '<div class="gst-hook__body"><span class="gst-hook__src">' + esc(F.a.nom) + " · " + esc(h.src) + " · " + APP.dshort(h.date) + ' · <a href="#" data-src="' + esc(h.url) + '">vérifier la source</a></span><span class="gst-hook__vals"><s>' + f(F.cur.montant) + "</s> → <b>" + f(h.prix) + " F / " + esc(F.a.unite) + "</b> · " + (F.d > 0 ? "+" : "") + Math.round(F.d * 100) + " %</span>" + (F.out.length ? '<span class="mv-tag-row" style="margin-top:6px">' + F.out.map(function (x) { return '<span class="gst-badge ' + (x.k === "abnormal" ? "gst-badge--danger" : "gst-badge--warning") + '">' + esc(x.t) + "</span>"; }).join("") + "</span>" : "") + '<span class="mv-mono mv-muted" style="font-size:10.5px;margin-top:4px">Impact si validé sur le budget ' + esc(c.court) + " : " + (imp > 0 ? "+" : "") + f(imp) + ' F — aucun effet tant que ce n\'est pas validé</span></div><div class="gst-hook__actions"><button class="gst-btn gst-btn--brand gst-btn--sm" data-acc="' + h.id + '">Valider</button><button class="gst-btn gst-btn--secondary gst-btn--sm" data-cor="' + h.id + '">Corriger</button><button class="gst-btn gst-btn--ghost gst-btn--sm" data-rej="' + h.id + '">Rejeter</button></div></div>';
    }).join("");
    return APP.head(".06 / HOOK INTELLIGENT DES PRIX", "Le hook propose, un humain valide", "Recherche périodique sur des sources définies (transport, denrées, carburant), filtrée et nettoyée. Un prix trouvé n'entre dans aucun calcul tant qu'un responsable ne l'a pas confirmé.", '<button class="gst-btn gst-btn--secondary" data-scan>' + ico("refresh-cw", "gst-icon--sm") + "Lancer une recherche</button>") +
      '<div class="mv-g4">' + APP.kpi("Suggestions en file", sug.length, { ico: "lightbulb", cls: "mv-kpi--brand" }) + APP.kpi("Budget " + esc(c.court), APP.num("hk-bud", R.totalLive), { unit: "F", ico: "calculator", sub: "Inchangé par les suggestions" }) + APP.kpi("Prix périmés", perimes.length, { ico: "history", tone: perimes.length ? "yel" : "", sub: '<a href="#/app/prix?p=1">Voir la liste</a>' }) + APP.kpi("Traitées", done.length, { ico: "check" }) + "</div>" +
      APP.card("File de suggestions", sug.length ? '<div class="mv-stack">' + cards + "</div>" : APP.empty("File vide", "Toutes les suggestions ont été traitées. Lancez une recherche pour en obtenir de nouvelles."), { ico: "lightbulb", tag: "SOURCE ET DATE POUR CHAQUE PROPOSITION" }) +
      '<div class="mv-g2">' + APP.card("Écarts prévu / réel (terrain)", '<div class="mv-list">' + terrain.map(function (t) { var a = APP.article(t.art), cur = APP.prix(t.art); return '<div class="mv-li"><span class="mv-ico mv-ico--yel">' + ico("receipt") + '</span><div class="mv-li__m"><b>' + esc(a.nom) + " : payé " + f(t.paye) + " F (base " + f(cur.montant) + ")</b><small>" + esc(t.src) + '</small></div><button class="gst-btn gst-btn--secondary gst-btn--sm" data-terrain="' + t.art + "|" + t.paye + '">Corriger la base</button></div>'; }).join("") + "</div>", { ico: "receipt", tag: "PRIX RÉELLEMENT PAYÉS" }) +
      APP.card("Historique des décisions", done.length ? '<div class="mv-list">' + done.map(function (h) { var a = APP.article(h.art); return '<div class="mv-li"><div class="mv-li__m"><b>' + esc(a.nom) + " · " + f(h.final || h.prix) + " F</b><small>" + esc(h.src) + "</small></div>" + APP.badge(h.statut === "validé" ? "validé" : h.statut === "corrigé" ? "validé" : "rejeté") + "</div>"; }).join("") + "</div>" : '<p class="mv-muted" style="margin:0">Aucune décision pour l\'instant.</p>', { ico: "history" }) + "</div>";
  }, mount: function (el) {
    function find(id) { return APP.state.hook.filter(function (h) { return h.id === id; })[0]; }
    function accept(h, val, how) {
      var a = APP.article(h.art), old = APP.prix(h.art).montant, c = APP.camp("k26"), b0 = APP.calc(c).totalLive;
      APP.commit("hook", function (st) { a.prix.push({ id: APP.uid("px"), montant: val, marche: h.src, date: h.date, source: "Hook · " + h.src, statut: "validé" }); h.statut = how; h.final = val; }, { log: ["Base de prix · " + a.nom, "Prix (hook " + how + ")", old, val] });
      G.toast(a.nom + " : " + f(old) + " → " + f(val) + " F · budget " + c.court + " " + f(b0) + " → " + f(APP.calc(c).totalLive), { tag: ".06 / HOOK", tone: "success", duration: 5500 });
    }
    APP.bind(el, "click", "[data-acc]", function (b) { var h = find(b.dataset.acc); if (flags(h).out.some(function (x) { return x.k === "abnormal"; })) { APP.confirm("Valider un écart anormal ?", "Ce prix s'écarte fortement de la base. Une donnée fausse validée fausserait tout un budget.", "Valider quand même", { danger: true }).then(function (ok) { if (ok) accept(h, h.prix, "validé"); }); } else accept(h, h.prix, "validé"); });
    APP.bind(el, "click", "[data-cor]", function (b) { var h = find(b.dataset.cor), a = APP.article(h.art); var m = APP.modal('<span class="gst-tag">CORRIGER LA SUGGESTION</span><h4 class="gst-display-md" style="margin:10px 0">' + esc(a.nom) + "</h4>" + APP.field("Prix corrigé", APP.input("hc-v", h.prix, { money: true })) + '<div class="mv-row" style="margin-top:14px"><button class="gst-btn gst-btn--primary" data-ok>Valider la correction</button><button class="gst-btn gst-btn--ghost" data-close>Annuler</button></div>'); m.querySelector("[data-ok]").onclick = function () { var v = APP.money(m.querySelector("#hc-v").value); APP.closeDrawer(); if (v) accept(h, v, "corrigé"); }; });
    APP.bind(el, "click", "[data-rej]", function (b) { var h = find(b.dataset.rej); APP.commit("hrej", function () { h.statut = "rejeté"; }, { log: ["Hook des prix", "Suggestion rejetée", APP.article(h.art).nom, f(h.prix)] }); G.toast("Rejetée — la base ne change pas", { tag: ".06 / HOOK" }); });
    APP.bind(el, "click", "[data-src]", function (b, e) { e.preventDefault(); APP.drawer("SOURCE DE LA SUGGESTION", '<p class="mv-mono">' + esc(b.dataset.src) + '</p><p class="mv-muted">Dans la version de production, ce lien ouvre la page ou le document source (relevé terrain photographié, devis, affichage station) pour vérification.</p>'); });
    APP.bind(el, "click", "[data-terrain]", function (b) { var p = b.dataset.terrain.split("|"); accept({ art: p[0], src: "Prix payé sur le terrain (R26)", date: APP.state.today, id: "t" }, +p[1], "corrigé"); });
    el.querySelector("[data-scan]").onclick = function () {
      var btn = el.querySelector("[data-scan]"); btn.disabled = true; btn.innerHTML = ico("refresh-cw", "gst-icon--sm") + "Recherche en cours…";
      setTimeout(function () { APP.commit("scan", function (st) { st.hook.push({ id: APP.uid("h"), art: "essence", prix: 715, src: "Prix à la pompe — relevé hebdomadaire", url: "releve://stations-lome/" + st.today, date: st.today, statut: "suggestion" }); st.hook.push({ id: APP.uid("h"), art: "sucre", prix: 760, src: "Grossiste Bè — liste de prix", url: "liste://grossiste-be/" + st.today, date: st.today, statut: "suggestion" }); }, { log: ["Hook des prix", "Recherche périodique", "", "2 suggestion(s)"] }); G.toast("2 nouvelles suggestions — en attente de validation", { tag: ".06 / HOOK" }); }, 1200);
    };
  } });
})();
