/* GST GOVERNMENT — MVP · Cuisine & menus (P3) */
(function () {
  "use strict";
  var G = window.GST, APP = window.APP, S = window.GST_SEED;
  var ico = APP.ico, esc = APP.esc, f = APP.f, cfa = APP.cfa;
  var SERV = [["matin", "Matin"], ["midi", "Midi"], ["soir", "Soir"]];
  var ALL = { arachide: "Arachide", poisson: "Poisson", lait: "Lait", gluten: "Gluten", oeuf: "Œuf" };

  APP.coutPortion = function (p) { return Math.round(p.ing.reduce(function (s, ig) { return s + ig[1] * APP.prix(ig[0]).montant; }, 0)); };
  function platCard(p, o) {
    o = o || {};
    var mk = (p.spe ? '<span class="gst-badge gst-badge--warning">spécialité</span>' : "") + (p.route ? '<span class="gst-badge">route</span>' : "") + (p.fete ? '<span class="gst-badge gst-badge--danger">fête</span>' : "");
    return '<a class="mv-plat' + (o.on ? " is-on" : "") + (o.out ? " is-out" : "") + '" href="' + (o.href || "#/app/cuisine/plat/" + p.id) + '"' + (o.attrs || "") + '><div class="mv-plat__art"><span class="gst-fleur">⚜</span></div><span class="gst-tag">' + (p.service === "route" ? "ROUTE" : p.service.toUpperCase()) + " · " + p.t + " MIN · " + p.diff.toUpperCase() + "</span><h4>" + esc(p.nom) + "</h4><small>" + p.ing.map(function (ig) { var a = APP.article(ig[0]); return a ? a.nom.toLowerCase() : ig[0]; }).join(" · ") + '</small><div class="mv-row mv-row--sb"><span class="mv-mono"><b>' + f(APP.coutPortion(p)) + ' F</b> / portion</span><span class="mv-tag-row">' + mk + "</span></div>" + (p.all.length ? '<div class="mv-tag-row">' + p.all.map(function (a) { return '<span class="gst-chip gst-chip--accent">' + ALL[a] + "</span>"; }).join("") + "</div>" : "") + (o.extra || "") + "</a>";
  }
  APP.platCard = platCard;

  /* ══ Catalogue (M3.1) ══════════════════════════════════════════════════ */
  APP.route("/app/cuisine", { title: "Catalogue de plats", perm: "cuisine", crumb: ".03 / CUISINE / CATALOGUE", render: function (p) {
    var sv = p.q.s || "midi", plats = APP.state.plats.filter(function (x) { return sv === "route" ? x.service === "route" || x.fete : x.service === sv && !x.fete; });
    var counts = {}; APP.state.plats.forEach(function (x) { counts[x.service] = (counts[x.service] || 0) + 1; });
    var pend = APP.camp("k26").menu.choix ? APP.camp("k26").menu.choix.propositions.filter(function (x) { return x.statut === "en attente"; }) : [];
    return APP.head(".03 / CUISINE", "La bibliothèque culinaire", APP.state.plats.length + " plats, chacun avec ses ingrédients par portion reliés à la base de prix. Un plat sans quantité par portion ne peut pas être validé.", '<button class="gst-btn gst-btn--primary" data-new-plat>' + ico("plus", "gst-icon--sm") + "Nouveau plat</button>") +
      '<div class="mv-g4">' + SERV.map(function (s) { return APP.kpi(s[1], counts[s[0]] || 0, { sub: "plats · objectif ≥ 10", subTone: (counts[s[0]] || 0) >= 10 ? "good" : "bad" }); }).join("") + APP.kpi("Propositions des jeunes", pend.length, { ico: "message-circle", sub: "en attente de validation", tone: pend.length ? "yel" : "" }) + "</div>" +
      (pend.length ? APP.card("Plats proposés par les jeunes", '<div class="mv-list">' + pend.map(function (x, i) { return '<div class="mv-li"><span class="mv-ico mv-ico--yel">' + ico("message-circle") + '</span><div class="mv-li__m"><b>' + esc(x.texte) + "</b><small>Proposé " + x.n + ' fois · Jamboree Kara 2026</small></div><button class="gst-btn gst-btn--brand gst-btn--sm" data-accept="' + esc(x.texte) + '">Ajouter au catalogue</button><button class="gst-btn gst-btn--ghost gst-btn--sm" data-refuse="' + esc(x.texte) + '">Refuser</button></div>'; }).join("") + "</div>", { ico: "message-circle", tone: "yel", tag: "FILE DE VALIDATION DE L'INTENDANCE" }) : "") +
      APP.tabs("cs", [["matin", "Matin"], ["midi", "Midi"], ["soir", "Soir"], ["route", "Route & fête"]], sv) +
      '<div class="mv-plats">' + plats.map(function (x) { return platCard(x); }).join("") + "</div>";
  }, mount: function (el) {
    var t = el.querySelector("[data-tabs=cs]"); if (t) t.addEventListener("gst-change", function (e) { APP.go("#/app/cuisine?s=" + e.detail.value); });
    var k = APP.camp("k26");
    APP.bind(el, "click", "[data-accept]", function (b) { platForm({ nom: b.dataset.accept, from: b.dataset.accept }); });
    APP.bind(el, "click", "[data-refuse]", function (b) { APP.commit("refus", function () { k.menu.choix.propositions.forEach(function (x) { if (x.texte === b.dataset.refuse) x.statut = "refusé"; }); }, { log: ["Cuisine", "Proposition refusée", b.dataset.refuse, ""] }); });
    el.querySelector("[data-new-plat]").onclick = function () { platForm({}); };
  } });
  function platForm(preset) {
    var arts = APP.state.articles.filter(function (a) { return a.cat === "ALI"; });
    var line = function (i) { return '<div class="mv-row" data-ing style="flex-wrap:nowrap"><div class="gst-control" style="flex:2">' + '<select data-ia>' + arts.map(function (a) { return '<option value="' + a.id + '">' + esc(a.nom) + " (" + esc(a.unite) + ")</option>"; }).join("") + '</select></div><div class="gst-control" style="flex:1"><input data-iq placeholder="qté / portion" inputmode="decimal"></div></div>'; };
    var m = APP.modal('<span class="gst-tag">CATALOGUE · NOUVEAU PLAT</span><form class="mv-form mv-form--2" data-pf style="margin-top:12px">' + APP.field("Nom du plat", APP.input("pf-n", preset.nom || ""), { req: true, cls: "is-full" }) + APP.field("Service", APP.select("pf-s", [["matin", "Matin"], ["midi", "Midi"], ["soir", "Soir"], ["route", "Repas de route"]], "midi")) + APP.field("Temps (min)", APP.input("pf-t", "60", { type: "number" })) +
      '<div class="is-full"><span class="gst-label">Ingrédients · quantité par portion <span class="gst-field__req">requis</span></span><div class="mv-stack" data-ings style="margin-top:8px">' + line() + line() + line() + '</div><button type="button" class="gst-btn gst-btn--ghost gst-btn--sm" data-more-ing>' + ico("plus", "gst-icon--sm") + "Ingrédient</button></div>" +
      '<div class="is-full mv-row">' + Object.keys(ALL).map(function (k) { return APP.check("pf-al-" + k, false, ALL[k]); }).join("") + "</div>" + '<p class="mv-mono is-full" data-pf-c style="margin:0"></p><div class="mv-row is-full"><button class="gst-btn gst-btn--primary" type="submit">Valider le plat</button><button class="gst-btn gst-btn--ghost" type="button" data-close>Annuler</button></div></form>', { wide: true });
    function read() { return Array.prototype.map.call(m.querySelectorAll("[data-ing]"), function (r) { return [r.querySelector("[data-ia]").value, +String(r.querySelector("[data-iq]").value).replace(",", ".")]; }).filter(function (x) { return x[1] > 0; }); }
    m.addEventListener("input", function () { var ing = read(); m.querySelector("[data-pf-c]").textContent = ing.length ? "Coût par portion : " + f(Math.round(ing.reduce(function (s, x) { return s + x[1] * APP.prix(x[0]).montant; }, 0))) + " F" : ""; });
    m.querySelector("[data-more-ing]").onclick = function () { m.querySelector("[data-ings]").insertAdjacentHTML("beforeend", line()); };
    m.querySelector("[data-pf]").onsubmit = function (e) {
      e.preventDefault(); var ing = read(), nom = m.querySelector("#pf-n").value.trim();
      if (!nom) { G.toast("Nom requis", { tag: ".03 / CATALOGUE", tone: "danger" }); return; }
      if (!ing.length) { G.toast("Un plat sans quantité par portion ne peut pas être validé", { tag: ".03 / CATALOGUE", tone: "danger" }); return; }
      var id = "u" + Date.now().toString(36), sv = m.querySelector("#pf-s").value;
      APP.closeDrawer();
      APP.commit("plat", function (st) {
        st.plats.push({ id: id, nom: nom, service: sv, t: +m.querySelector("#pf-t").value || 60, diff: "moyenne", ing: ing, all: Object.keys(ALL).filter(function (k) { return m.querySelector("#pf-al-" + k).checked; }), statut: "validé", route: sv === "route" });
        if (preset.from) { var k = APP.camp("k26"); k.menu.choix.propositions.forEach(function (x) { if (x.texte === preset.from) { x.statut = "ajouté"; x.plat = id; } }); }
      }, { log: ["Cuisine · catalogue", "Nouveau plat", "", nom] });
      G.toast("Plat validé et ajouté au catalogue", { tag: ".03 / CATALOGUE", tone: "success" });
    };
  }
  APP.route("/app/cuisine/plat/:id", { title: function (p) { var x = APP.plat(p.id); return x ? x.nom : "Plat"; }, perm: "cuisine|jeune", crumb: ".03 / CUISINE / FICHE PLAT", render: function (p) {
    var x = APP.plat(p.id); if (!x) return APP.empty("Plat introuvable", "");
    var eff = APP.effectif(APP.camp()), cp = APP.coutPortion(x);
    return APP.head(".03 / " + x.service.toUpperCase(), esc(x.nom), x.t + " min · difficulté " + x.diff + (x.all.length ? " · allergènes : " + x.all.map(function (a) { return ALL[a]; }).join(", ") : " · sans allergène majeur")) +
      '<div class="mv-split">' + APP.card("Ingrédients par portion", '<div class="mv-tw"><table class="mv-t"><thead><tr><th>Ingrédient (base de prix)</th><th class="n">Par portion</th><th class="n">Pour ' + eff + ' pers.</th><th class="n">Coût</th></tr></thead><tbody>' + x.ing.map(function (ig) { var a = APP.article(ig[0]), pr = APP.prix(ig[0]); return '<tr><td><a href="#/app/prix/' + a.id + '">' + esc(a.nom) + "</a>" + (pr.perime ? ' <span class="mv-perime">périmé</span>' : "") + '</td><td class="n">' + String(ig[1]).replace(".", ",") + " " + esc(a.unite) + '</td><td class="n">' + (Math.round(ig[1] * eff * 10) / 10).toString().replace(".", ",") + " " + esc(a.unite) + '</td><td class="n">' + f(Math.round(ig[1] * eff * pr.montant)) + "</td></tr>"; }).join("") + '</tbody><tfoot><tr><td colspan="3">Pour ' + eff + ' personnes</td><td class="n">' + f(cp * eff) + "</td></tr></tfoot></table></div>", { ico: "list" }) +
      '<div class="mv-stack">' + APP.kpi("Coût par portion", f(cp), { unit: "F CFA", cls: "mv-kpi--brand" }) + APP.card("Marqueurs", '<div class="mv-tag-row">' + (x.spe ? '<span class="gst-badge gst-badge--warning">plat de spécialité</span>' : "") + (x.route ? '<span class="gst-badge">plat de route</span>' : "") + (x.fete ? '<span class="gst-badge gst-badge--danger">plat de fête</span>' : "") + (!x.spe && !x.route && !x.fete ? '<span class="mv-muted">Plat courant</span>' : "") + "</div>", { ico: "star" }) + "</div></div>";
  } });

  /* ══ Corrélation, taux et arrêt du menu (M3.3) ══════════════════════════ */
  function taux(c) {
    var ch = c.menu.choix, totProp = ch.propositions.reduce(function (s, x) { return s + x.n; }, 0);
    return APP.state.plats.map(function (p) {
      var sel = ch.votants ? Math.round(((ch.selections[p.id] || 0) / ch.votants) * 100) : 0;
      var prop = totProp ? Math.round((ch.propositions.filter(function (x) { return x.plat === p.id; }).reduce(function (s, x) { return s + x.n; }, 0) / totProp) * 100) : 0;
      return { p: p, sel: sel, prop: prop, score: Math.round(sel * 0.65 + prop * 0.35 * 2.5) };
    }).sort(function (a, b) { return b.score - a.score; });
  }
  APP.tauxMenu = taux;
  APP.route("/app/cuisine/menu", { title: "Choix & arrêt du menu", perm: "cuisine", crumb: function () { return esc(APP.camp().court.toUpperCase()) + " / .03 / MENU"; }, render: function () {
    var c = APP.camp(), m = c.menu, n = APP.jours(c);
    if (!S.TYPES[c.type].cuisine) return APP.head(".03 / MENU", "Pas de module cuisine", "") + APP.empty("Module Cuisine non activé", "Le type « " + S.TYPES[c.type].court + " » se contente d'une restauration simple, saisie à la main dans le groupe Alimentaire.");
    if (!m.jours && !m.choix) return APP.empty("Aucun choix ouvert", "Ouvrez les choix aux jeunes depuis l'espace jeune.");
    var T = m.choix ? taux(c) : [];
    var grid = '<div class="mv-tw"><div class="mv-menu" style="--n:' + n + '"><span class="h"></span>' + Array.from({ length: n }, function (_, i) { var dj = (c.programme[i] || {}); return '<span class="h' + (APP.campDay(c) === i + 1 ? " is-today" : "") + '">' + APP.jj(i + 1) + "<br>" + APP.ddm(APP.addDays(c.du, i)) + "</span>"; }).join("") +
      SERV.map(function (s, si) { return '<span class="h">' + s[1].toUpperCase() + "</span>" + Array.from({ length: n }, function (_, i) { var id = m.jours ? (m.jours[i] || [])[si] : null, p = id && id !== "off" ? APP.plat(id) : null; var cls = id === "off" ? "off" : p && (p.spe || p.fete) ? "sp" : p ? "t" : ""; var lab = id === "off" ? "Sans cuisine" : p ? p.nom : "—"; return m.arrete ? '<span class="' + cls + '" title="' + esc(lab) + '">' + esc(lab) + "</span>" : '<button class="' + cls + '" data-cell="' + i + "|" + si + '" title="' + esc(lab) + '">' + esc(lab) + "</button>"; }).join(""); }).join("") + "</div></div>";
    var V = APP.vivres(c);
    var left = m.choix ? APP.card("Taux de proposition et de sélection", '<div class="gst-legend"><span><i style="background:var(--gst-accent)"></i>Proposition (suggestions libres)</span><span><i style="background:var(--gst-brand)"></i>Sélection (catalogue)</span></div><div id="rates"></div><p class="mv-muted mv-small" style="margin:0">' + m.choix.votants + " votants · " + m.choix.propositions.reduce(function (s, x) { return s + x.n; }, 0) + " propositions libres. Classement = croisement des deux taux.</p>", { ico: "vote", tag: "CLASSEMENT CROISÉ" }) : "";
    var head = m.arrete ? APP.head(".03 / MENU ARRÊTÉ", "Menu du camp", "Arrêté le " + APP.dshort(m.dateArret || APP.state.today) + " et transmis au groupe Alimentaire : " + f(V.portions) + " portions, " + cfa(V.total) + " de vivres.", '<a class="gst-btn gst-btn--secondary" href="#/app/cuisine/vivres">' + ico("calculator", "gst-icon--sm") + 'Liste de courses</a><button class="gst-btn gst-btn--ghost" data-reopen>' + ico("rotate-ccw", "gst-icon--sm") + "Rouvrir</button>")
      : APP.head(".03 / ARRÊT DU MENU", "Composer le menu", "Jour par jour, service par service, en voyant les taux. Les jours sans cuisine ne génèrent aucun besoin en vivres. Clôture des choix des jeunes : " + APP.dlong(m.cloture) + ".", '<button class="gst-btn gst-btn--secondary" data-auto>' + ico("sparkles", "gst-icon--sm") + 'Composer selon les taux</button><button class="gst-btn gst-btn--eclair" data-arret>' + ico("stamp", "gst-icon--sm") + "Arrêter & transmettre</button>");
    var timer = !m.arrete ? '<span class="mv-timer" data-mtimer>' + ico("clock", "gst-icon--sm") + "<b>composition : 0 min</b></span>" : "";
    return head + timer + '<div class="' + (left ? "mv-split2" : "mv-stack") + '">' + left + APP.card(m.arrete ? "Calendrier des repas" : "Calendrier · touchez une case", grid + '<div class="mv-legend"><span><i style="background:var(--gst-state-info-bg)"></i>Plat</span><span><i style="background:var(--gst-eclair-50)"></i>Spécialité / fête</span><span><i style="background:var(--gst-bg-sunken)"></i>Sans cuisine</span></div>', { ico: "calendar", tag: n + " JOURS · " + (m.jours ? m.jours.reduce(function (s, r) { return s + r.filter(function (x) { return x && x !== "off"; }).length; }, 0) : 0) + " SERVICES" }) + "</div>" +
      (m.choix ? APP.card("Propositions libres des jeunes", '<div class="mv-list">' + m.choix.propositions.map(function (x) { var p = x.plat && APP.plat(x.plat); return '<div class="mv-li"><span class="mv-ico">' + ico("message-circle") + '</span><div class="mv-li__m"><b>« ' + esc(x.texte) + " »</b><small>" + (p ? "→ " + esc(p.nom) : x.statut === "refusé" ? "refusé" : "absent du catalogue · en attente de validation") + '</small></div><span class="mv-li__v">× ' + x.n + "</span></div>"; }).join("") + "</div>", { ico: "message-circle" }) : "");
  }, mount: function (el) {
    var c = APP.camp(), m = c.menu, n = APP.jours(c);
    var host = el.querySelector("#rates"); if (host && m.choix) G.rateBars(host, taux(c).slice(0, 12).map(function (t) { return { nom: t.p.nom, a: t.prop, b: t.sel }; }));
    if (!m.arrete) {
      c._menuT0 = c._menuT0 || Date.now();
      var mt = el.querySelector("[data-mtimer] b"); var iv = setInterval(function () { if (!document.body.contains(mt)) { clearInterval(iv); return; } mt.textContent = "composition : " + Math.floor((Date.now() - c._menuT0) / 60000) + " min " + String(Math.floor((Date.now() - c._menuT0) / 1000) % 60).padStart(2, "0") + " s"; }, 1000);
    }
    function ensure() { if (!m.jours) m.jours = Array.from({ length: n }, function () { return ["", "", ""]; }); }
    APP.bind(el, "click", "[data-cell]", function (b) {
      var pr = b.dataset.cell.split("|"), i = +pr[0], si = +pr[1], sv = SERV[si][0];
      var T = m.choix ? taux(c) : APP.state.plats.map(function (p) { return { p: p, sel: 0, prop: 0, score: 0 }; });
      var opts = T.filter(function (t) { return t.p.service === sv || (sv === "midi" && (t.p.fete || t.p.route)) || (t.p.route && sv !== "matin"); });
      var d = APP.drawer(APP.jj(i + 1) + " · " + SERV[si][1].toUpperCase() + " / CHOISIR UN PLAT", '<div class="mv-stack"><button class="gst-btn gst-btn--secondary" data-pick="off">' + ico("x", "gst-icon--sm") + "Jour sans cuisine (quartier libre)</button>" + opts.map(function (t) { return '<button class="mv-pickplat" data-pick="' + t.p.id + '"><span><b>' + esc(t.p.nom) + "</b><small>" + f(APP.coutPortion(t.p)) + " F / portion" + (t.p.spe ? " · spécialité" : "") + (t.p.fete ? " · fête" : "") + "</small></span><span class=\"mv-mono\">sél. " + t.sel + " % · prop. " + t.prop + " %</span></button>"; }).join("") + "</div>");
      d.querySelectorAll("[data-pick]").forEach(function (x) { x.onclick = function () { var v = x.dataset.pick; APP.closeDrawer(); APP.commit("cell", function () { ensure(); if (v === "off") m.jours[i] = ["off", "off", "off"]; else { if (m.jours[i][0] === "off") m.jours[i] = ["", "", ""]; m.jours[i][si] = v; } }); }; });
    });
    var au = el.querySelector("[data-auto]"); if (au) au.onclick = function () {
      var T = taux(c), by = {}; SERV.forEach(function (s) { by[s[0]] = T.filter(function (t) { return t.p.service === s[0] && !t.p.fete; }).slice(0, 6).map(function (t) { return t.p.id; }); });
      APP.commit("auto", function () {
        m.jours = Array.from({ length: n }, function (_, i) {
          if (i === Math.floor(n / 2)) return ["off", "off", "off"];
          if (i === 0) return [by.matin[0], "r1", by.soir[0]];
          if (i === n - 2) return [by.matin[1], "f1", by.soir[1]];
          return [by.matin[i % by.matin.length], by.midi[i % by.midi.length], by.soir[(i + 2) % by.soir.length]];
        });
      }, { log: ["Cuisine · menu " + c.court, "Composition", "", "selon les taux (" + n + " jours)"] });
      G.toast("Menu composé selon le classement — ajustez case par case", { tag: ".03 / MENU" });
    };
    var ar = el.querySelector("[data-arret]"); if (ar) ar.onclick = function () {
      if (!m.jours || m.jours.some(function (r) { return r.some(function (x) { return !x; }); })) { G.toast("Toutes les cases doivent être remplies (ou marquées sans cuisine)", { tag: ".03 / MENU", tone: "danger" }); return; }
      var t0 = performance.now(), B0 = APP.calc(c).groupes.B.cost;
      APP.confirm("Arrêter le menu et le transmettre ?", "Les vivres seront calculés pour " + APP.effectif(c) + " personnes et envoyés automatiquement au groupe Alimentaire, puis au groupe Économique.", "Arrêter & transmettre", { eclair: true, tag: "ARRÊT DU MENU" }).then(function (ok) {
        if (!ok) return;
        APP.commit("arret-menu", function (st) { m.arrete = true; m.transmis = true; m.dateArret = st.today; c.groupes.B.source = "menu"; }, { log: ["Cuisine · menu " + c.court, "Arrêt du menu", "en composition", "arrêté et transmis"] });
        var B1 = APP.calc(c).groupes.B.cost;
        G.toast("Groupe Alimentaire rempli : " + f(B0) + " → " + f(B1) + " F en " + Math.round(performance.now() - t0) + " ms", { tag: ".03 → .01 / CHAÎNE DE CHIFFRAGE", tone: "success", duration: 6000 });
        APP.go("#/app/cuisine/vivres");
      });
    };
    var ro = el.querySelector("[data-reopen]"); if (ro) ro.onclick = function () { APP.confirm("Rouvrir le menu ?", "Le groupe Alimentaire repassera en saisie manuelle jusqu'au prochain arrêt.", "Rouvrir").then(function (ok) { if (ok) APP.commit("reopen", function () { m.arrete = false; m.transmis = false; if (!m.choix) m.choix = { votants: 0, selections: {}, propositions: [], mes: {} }; }, { log: ["Cuisine · menu " + c.court, "Menu", "arrêté", "rouvert"] }); }); };
  } });

  /* ══ Calcul des vivres (M3.4) ══════════════════════════════════════════ */
  APP.route("/app/cuisine/vivres", { title: "Calcul des vivres", perm: "cuisine", crumb: function () { return esc(APP.camp().court.toUpperCase()) + " / .03 / VIVRES"; }, render: function () {
    var c = APP.camp(), m = c.menu, eff = APP.effectif(c), V = APP.vivres(c), R = APP.calc(c);
    if (!m.jours) return APP.head(".03 / VIVRES", "Calcul des vivres", "") + APP.empty("Pas encore de menu", "Composez puis arrêtez le menu : la liste de courses chiffrée se calcule toute seule.", '<a class="gst-btn gst-btn--primary" href="#/app/cuisine/menu">Composer le menu</a>');
    var off = m.jours.filter(function (r) { return r[0] === "off"; }).length;
    return APP.head(".03 / CALCUL DES VIVRES", "La liste de courses chiffrée", "Ingrédients × portions × effectif réel, agrégés sur toute la durée du camp, marge de " + (c.groupes.B.marge || 0) + " % comprise. " + (off ? off + " jour(s) sans cuisine : aucun besoin." : ""), '<button class="gst-btn gst-btn--secondary" data-csv>' + ico("download", "gst-icon--sm") + 'Exporter</button><a class="gst-btn gst-btn--primary" href="#/app/logistique/B">' + ico("arrow-right", "gst-icon--sm") + "Groupe Alimentaire</a>") +
      '<div class="mv-g4">' + APP.kpi("Coût des vivres", APP.num("vv-tot", V.total), { unit: "F CFA", cls: "mv-kpi--brand", ico: "calculator" }) + APP.kpi("Portions", APP.num("vv-por", V.portions), { sub: eff + " personnes" }) + APP.kpi("Articles", V.lignes.length) + APP.kpi("Transmis au groupe B", m.transmis ? "Oui" : "Non", { sub: m.transmis ? "Total identique au calcul" : "Arrêtez le menu", subTone: m.transmis ? "good" : "bad" }) + "</div>" +
      APP.card("Recalcul instantané", '<p class="mv-muted" style="margin:0">Testez le critère M3.4 : ajouter 10 participants recalcule toutes les quantités.</p><div class="mv-row"><button class="gst-btn gst-btn--secondary" data-plus10>' + ico("users", "gst-icon--sm") + 'Simuler +10 participants</button><span class="mv-mono" data-plusres></span></div>', { ico: "zap", tone: "yel" }) +
      APP.card("Liste agrégée", '<div class="mv-tw"><table class="mv-t"><thead><tr><th>Article</th><th class="n">Quantité</th><th>Unité</th><th class="n">C.U.</th><th class="n">Coût</th></tr></thead><tbody>' + V.lignes.map(function (l) { var a = APP.article(l.art); return '<tr><td><a href="#/app/prix/' + a.id + '">' + esc(a.nom) + "</a>" + (l.perime ? ' <span class="mv-perime">périmé</span>' : "") + '</td><td class="n">' + String(l.q).replace(".", ",") + "</td><td>" + esc(a.unite) + '</td><td class="n">' + f(l.cu) + '</td><td class="n"><b>' + f(l.cost) + "</b></td></tr>"; }).join("") + '</tbody><tfoot><tr><td colspan="4">Total transmis</td><td class="n">' + f(V.total) + "</td></tr></tfoot></table></div>", { ico: "list" });
  }, mount: function (el) {
    var c = APP.camp();
    el.querySelector("[data-csv]") && (el.querySelector("[data-csv]").onclick = function () { var V = APP.vivres(c); APP.csv("vivres-" + c.id, [["article", "quantité", "unité", "coût unitaire", "coût"]].concat(V.lignes.map(function (l) { var a = APP.article(l.art); return [a.nom, l.q, a.unite, l.cu, l.cost]; }))); });
    var p = el.querySelector("[data-plus10]"); if (p) p.onclick = function () { var t0 = performance.now(), A = APP.vivres(c), B = APP.vivres(c, APP.effectif(c) + 10), ms = Math.max(1, Math.round(performance.now() - t0)); el.querySelector("[data-plusres]").innerHTML = "<b>" + f(A.total) + " → " + f(B.total) + " F</b> · " + B.lignes.length + " quantités recalculées en " + ms + " ms"; };
  } });

  /* ══ Suggestion live sur le terrain (M3.5) ══════════════════════════════ */
  function feasible(c, p, eff) { var st = c.live.stock; return p.ing.every(function (ig) { return (st[ig[0]] || 0) >= ig[1] * eff; }); }
  APP.feasible = feasible;
  APP.route("/app/cuisine/live", { title: "Suggestion live", perm: "cuisine", crumb: function () { return esc(APP.camp().court.toUpperCase()) + " / .03 / LIVE"; }, render: function () {
    var c = APP.camp();
    if (!c.live) return APP.head(".03 / SUGGESTION LIVE", "Le mode camp", "") + APP.empty("Disponible pendant le camp", "La suggestion live s'active quand le camp est en cours : la cuisine déclare son stock, les jeunes votent la veille pour le lendemain.", '<button class="gst-btn gst-btn--secondary" data-goR>Voir sur Réjouissance 2026 (en cours)</button>');
    var eff = APP.effectif(c), today = APP.campDay(c), L = c.live;
    var stock = Object.keys(L.stock).map(function (k) { var a = APP.article(k); return { a: a, q: L.stock[k] }; }).filter(function (x) { return x.a; }).sort(function (a, b) { return a.a.nom.localeCompare(b.a.nom); });
    var cols = SERV.map(function (s) {
      var plats = APP.state.plats.filter(function (p) { return p.service === s[0] || (s[0] === "midi" && p.route); });
      var ok = plats.filter(function (p) { return feasible(c, p, eff); }), ko = plats.filter(function (p) { return !feasible(c, p, eff); });
      var votes = L.votes[s[0]] || {}, maj = Object.keys(votes).filter(function (k) { return feasible(c, APP.plat(k), eff); }).sort(function (a, b) { return votes[b] - votes[a]; })[0];
      var tot = Object.keys(votes).reduce(function (t, k) { return t + votes[k]; }, 0);
      return APP.card(s[1] + " · " + APP.jj(today + 1), '<div class="mv-stack">' + ok.map(function (p) { var v = votes[p.id] || 0; return '<div class="mv-vote' + (p.id === maj ? " is-maj" : "") + '"><div class="mv-row mv-row--sb" style="flex-wrap:nowrap"><b>' + esc(p.nom) + '</b><span class="mv-mono">' + v + " vote(s)</span></div><div class=\"mv-bar\"><i style=\"width:" + (tot ? (v / tot) * 100 : 0) + '%"></i></div>' + (p.id === maj ? '<span class="gst-badge gst-badge--success">majoritaire</span>' : "") + "</div>"; }).join("") +
        (ko.length ? '<details><summary class="mv-mono mv-muted" style="cursor:pointer">' + ko.length + " plat(s) retiré(s) — ingrédient épuisé</summary>" + ko.map(function (p) { var miss = p.ing.filter(function (ig) { return (L.stock[ig[0]] || 0) < ig[1] * eff; }).map(function (ig) { return APP.article(ig[0]).nom; }); return '<div class="mv-li"><div class="mv-li__m"><b style="text-decoration:line-through;opacity:.6">' + esc(p.nom) + "</b><small>manque : " + esc(miss.join(", ")) + "</small></div></div>"; }).join("") + "</details>" : "") +
        (maj ? '<button class="gst-btn gst-btn--brand gst-btn--block" data-serve="' + s[0] + "|" + maj + '">' + ico("chef-hat", "gst-icon--sm") + "Préparer « " + esc(APP.plat(maj).nom) + " »</button>" : "") + "</div>", { ico: "vote", tag: tot + " VOTANTS" });
    }).join("");
    return APP.head(".03 / SUGGESTION LIVE · " + APP.jj(today), "Ce soir, on vote pour demain", "La cuisine déclare ce qui reste ; seuls les plats réalisables sont proposés aux jeunes. Chaque service préparé décrémente le stock automatiquement — sans double saisie, même hors ligne.") +
      '<div class="mv-g3">' + cols + "</div>" +
      APP.card("Stock déclaré par l'intendance", '<div class="mv-stockgrid">' + stock.map(function (x) { var low = x.q === 0; return '<label class="mv-stock' + (low ? " is-out" : "") + '"><span>' + esc(x.a.nom) + '</span><span class="mv-row" style="gap:6px;flex-wrap:nowrap"><input class="mv-cell" id="st-' + x.a.id + '" data-st="' + x.a.id + '" value="' + x.q + '" inputmode="decimal"><small>' + esc(x.a.unite) + "</small></span></label>"; }).join("") + "</div>", { ico: "box", tag: "MODIFIEZ UNE QUANTITÉ · LES PROPOSITIONS SE METTENT À JOUR" }) +
      APP.card("Services préparés", '<div class="mv-tw"><table class="mv-t"><thead><tr><th>Jour</th><th>Service</th><th>Plat</th><th class="n">Prévues</th><th class="n">Servies</th></tr></thead><tbody>' + L.servis.slice().reverse().map(function (s) { return "<tr><td>" + APP.jj(s.j) + "</td><td>" + s.s + "</td><td>" + esc((APP.plat(s.plat) || {}).nom || "") + '</td><td class="n">' + s.prevues + '</td><td class="n">' + (s.servies == null ? '<input class="mv-cell" data-servies="' + L.servis.indexOf(s) + '" placeholder="compter">' : s.servies) + "</td></tr>"; }).join("") + "</tbody></table></div>", { ico: "history" });
  }, mount: function (el) {
    var c = APP.camp(), g = el.querySelector("[data-goR]");
    if (g) g.onclick = function () { APP.state.camp = "r26"; APP.save(); APP.render(); };
    if (!c.live) return;
    APP.bind(el, "change", "[data-st]", function (i) { var k = i.dataset.st, v = +String(i.value).replace(",", "."); if (isNaN(v) || v < 0) return; var old = c.live.stock[k]; var eff = APP.effectif(c); var before = APP.state.plats.filter(function (p) { return feasible(c, p, eff); }).length; APP.commit("stock", function () { c.live.stock[k] = v; }, { log: ["Cuisine live · stock", APP.article(k).nom, old, v] }); var after = APP.state.plats.filter(function (p) { return feasible(c, p, eff); }).length; if (after !== before) G.toast((after < before ? before - after + " plat(s) retiré(s)" : after - before + " plat(s) de nouveau proposé(s)") + " des votes", { tag: ".03 / LIVE", tone: after < before ? "danger" : "success" }); });
    APP.bind(el, "change", "[data-servies]", function (i) { var s = c.live.servis[+i.dataset.servies], v = +i.value; if (!v) return; APP.commit("servies", function () { s.servies = v; }, { log: ["Cuisine live", "Portions servies " + APP.jj(s.j) + " " + s.s, "", v] }); });
    APP.bind(el, "click", "[data-serve]", function (b) {
      var pr = b.dataset.serve.split("|"), p = APP.plat(pr[1]), eff = APP.effectif(c), today = APP.campDay(c);
      APP.confirm("Préparer « " + p.nom + " » ?", "Le stock sera décrémenté de : " + p.ing.map(function (ig) { return (Math.round(ig[1] * eff * 10) / 10).toString().replace(".", ",") + " " + APP.article(ig[0]).unite + " " + APP.article(ig[0]).nom.toLowerCase(); }).join(", ") + ".", "Préparer le service").then(function (ok) {
        if (!ok) return;
        APP.commit("serve", function () { p.ing.forEach(function (ig) { c.live.stock[ig[0]] = Math.max(0, Math.round(((c.live.stock[ig[0]] || 0) - ig[1] * eff) * 10) / 10); }); c.live.servis.push({ j: today + 1, s: pr[0], plat: p.id, prevues: eff, servies: null }); c.live.votes[pr[0]] = {}; }, { log: ["Cuisine live", "Service préparé · " + pr[0], "", p.nom + " × " + eff] });
        G.toast("Stock décrémenté automatiquement" + (APP.state.online ? "" : " — en file hors ligne"), { tag: ".03 / LIVE", tone: "success" });
      });
    });
  } });

  /* ══ Indicateurs de gaspillage (M3.6) ═══════════════════════════════════ */
  APP.gaspillage = function (c) {
    if (!c.live) return null;
    var s = c.live.servis.filter(function (x) { return x.servies != null; });
    var prevues = s.reduce(function (t, x) { return t + x.prevues; }, 0), servies = s.reduce(function (t, x) { return t + x.servies; }, 0);
    var restes = Object.keys(c.live.stock).reduce(function (t, k) { return t + (c.live.stock[k] || 0) * APP.prix(k).montant; }, 0);
    return { prevues: prevues, servies: servies, restesValeur: Math.round(restes), s: s };
  };
  APP.route("/app/cuisine/gaspillage", { title: "Gaspillage", perm: "cuisine|bilan", crumb: function () { return esc(APP.camp().court.toUpperCase()) + " / .03 / GASPILLAGE"; }, render: function () {
    var c = APP.camp(), W = APP.gaspillage(c);
    if (!W) return APP.head(".03 / GASPILLAGE", "Indicateurs de gaspillage", "") + APP.empty("Pas encore de service", "Les indicateurs se calculent pendant le camp, à partir des portions servies et du stock restant.");
    var taux = W.prevues ? ((W.prevues - W.servies) / W.prevues) * 100 : 0;
    var bars = W.s.map(function (x) { var p = (x.servies / x.prevues) * 100; return '<div class="mv-wbar" title="' + APP.jj(x.j) + " " + x.s + " · " + esc((APP.plat(x.plat) || {}).nom || "") + " : " + x.servies + "/" + x.prevues + '"><i style="height:' + p + '%"></i><span>' + APP.jj(x.j).slice(2) + x.s[0].toUpperCase() + "</span></div>"; }).join("");
    var comp = [["Réjouissance 2024", 17.8], ["Réjouissance 2025", 12.4], [c.court + " (en cours)", Math.round(taux * 10) / 10]];
    return APP.head(".03 / GASPILLAGE", "La preuve chiffrée", "Portions prévues contre portions réellement servies, reste de vivres et taux global — versés au bilan de clôture.") +
      '<div class="mv-g4">' + APP.kpi("Taux de gaspillage", taux.toFixed(1).replace(".", ",") + "<small>%</small>", { cls: "mv-kpi--brand", ico: "leaf" }) + APP.kpi("Portions prévues", f(W.prevues)) + APP.kpi("Portions servies", f(W.servies), { sub: f(W.prevues - W.servies) + " non consommées" }) + APP.kpi("Reste de vivres", f(W.restesValeur), { unit: "F", sub: "Valeur du stock restant" }) + "</div>" +
      '<div class="mv-split">' + APP.card("Servies / prévues par service", '<div class="mv-wbars">' + bars + "</div>", { ico: "chart-line" }) + APP.card("D'un camp à l'autre", '<div class="mv-stack">' + comp.map(function (x) { return '<div><div class="mv-row mv-row--sb"><span class="mv-mono">' + esc(x[0]) + '</span><b class="mv-mono">' + String(x[1]).replace(".", ",") + ' %</b></div><div class="mv-bar mv-bar--red"><i style="width:' + x[1] * 4 + '%"></i></div></div>'; }).join("") + "</div>", { ico: "layers" }) + "</div>";
  } });
})();
