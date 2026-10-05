/* GST GOVERNMENT — MVP · Programme, Roadmap (3D + 2D), Agenda (P4) */
(function () {
  "use strict";
  var G = window.GST, APP = window.APP, S = window.GST_SEED;
  var ico = APP.ico, esc = APP.esc, f = APP.f;

  function dayState(c, j) { var t = APP.campDay(c); if (c.statut === "clos") return "past"; return j < t ? "past" : j === t ? "now" : "future"; }
  function menuOf(c, j) { var m = c.menu; if (!m || !m.jours || !m.jours[j - 1]) return null; return m.jours[j - 1].map(function (id) { return id === "off" ? "Sans cuisine" : id ? (APP.plat(id) || {}).nom : "—"; }); }
  function materielOf(c, j) { var R = APP.calc(c); return (R.groupes.I ? R.groupes.I.rows : []).filter(function (r) { return r.l.jour === j; }); }
  APP.dayState = dayState;

  /* Détail d'une journée (drawer) */
  APP.openDay = function (c, j) {
    var d = c.programme[j - 1]; if (!d) return;
    var s = dayState(c, j), mn = menuOf(c, j), mat = materielOf(c, j);
    var canCR = (APP.role() === "chef" || APP.role() === "chefunite") && s !== "future";
    var html = '<div class="mv-stack"><div><span class="gst-chip' + (s === "now" ? " gst-chip--accent" : "") + '">' + APP.jj(j) + " · " + { past: "PASSÉE", now: "AUJOURD'HUI", future: "À VENIR" }[s] + '</span><h3 class="gst-display-md" style="margin:10px 0 0">' + esc(d.titre || "Journée à construire") + "</h3><span class=\"gst-tag\">" + APP.dday(APP.addDays(c.du, j - 1)).toUpperCase() + "</span></div>" +
      '<dl class="gst-spec gst-spec--rules"><dt>Lieu</dt><dd>' + esc(d.lieu || "—") + "</dd><dt>Responsable</dt><dd>" + esc(d.resp || "—") + "</dd><dt>Unités</dt><dd>" + esc(d.unites || "—") + "</dd></dl>" +
      '<div><span class="gst-label">' + ico("clock", "gst-icon--sm") + ' Horaires</span><div class="mv-list">' + (d.acts.map(function (a) { return '<div class="mv-li"><span class="mv-mono"><b>' + a.h + '</b></span><div class="mv-li__m"><b>' + esc(a.titre) + "</b>" + (a.lieu && a.lieu !== d.lieu ? "<small>" + esc(a.lieu) + "</small>" : "") + "</div></div>"; }).join("") || '<p class="mv-muted">Aucune activité saisie.</p>') + "</div></div>" +
      '<div><span class="gst-label">' + ico("box", "gst-icon--sm") + ' Matériel · tiré du groupe I</span><div class="mv-tag-row" style="margin-top:6px">' + (mat.map(function (r) { return '<span class="gst-badge">' + esc(r.a.nom) + " × " + f(r.need) + "</span>"; }).join("") || '<span class="mv-muted">—</span>') + "</div></div>" +
      '<div><span class="gst-label">' + ico("utensils", "gst-icon--sm") + " Menu du jour · module Cuisine</span>" + (d.sansCuisine || (mn && mn[0] === "Sans cuisine") ? '<div class="gst-badge gst-badge--info" style="margin-top:6px">Quartier libre · aucun repas préparé</div>' : mn ? '<dl class="gst-spec gst-spec--rules"><dt>Matin</dt><dd>' + esc(mn[0]) + "</dd><dt>Midi</dt><dd>" + esc(mn[1]) + "</dd><dt>Soir</dt><dd>" + esc(mn[2]) + "</dd></dl>" : '<p class="mv-muted" style="margin:6px 0 0">Menu pas encore arrêté.</p>') + "</div>" +
      '<div><span class="gst-label">' + ico("image", "gst-icon--sm") + " Compte-rendu & photos</span>" + (d.cr ? '<p style="margin:6px 0">' + esc(d.cr) + "</p>" : '<p class="mv-muted" style="margin:6px 0">' + (s === "future" ? "Ajouté après la journée : la roadmap devient l'album du camp." : "Pas encore de compte-rendu.") + "</p>") +
      (d.photos ? '<div class="mv-photos">' + Array.from({ length: d.photos }, function (_, k) { return APP.photoTile(j * 7 + k, ""); }).join("") + "</div>" : "") +
      (canCR ? '<textarea class="mv-ta" id="cr-t" placeholder="Compte-rendu de la journée…">' + esc(d.cr || "") + '</textarea><div class="mv-row"><button class="gst-btn gst-btn--primary gst-btn--sm" data-cr>Enregistrer</button><label class="gst-btn gst-btn--secondary gst-btn--sm">' + ico("camera", "gst-icon--sm") + 'Ajouter des photos<input type="file" accept="image/*" multiple data-ph style="display:none"></label></div>' : "") + "</div></div>";
    var dr = APP.drawer(APP.jj(j) + " / DÉTAIL DE LA JOURNÉE", html);
    var b = dr.querySelector("[data-cr]"); if (b) b.onclick = function () { var t = dr.querySelector("#cr-t").value; APP.commit("cr", function () { d.cr = t; }, { log: ["Roadmap · " + APP.jj(j), "Compte-rendu", "", "mis à jour"] }); APP.closeDrawer(); G.toast("Compte-rendu publié sur la roadmap", { tag: ".04 / ALBUM", tone: "success" }); };
    var ph = dr.querySelector("[data-ph]"); if (ph) ph.onchange = function () { var n = ph.files.length; if (!n) return; APP.commit("ph", function () { d.photos = (d.photos || 0) + n; }, { log: ["Roadmap · " + APP.jj(j), "Photos", "", "+" + n] }); APP.closeDrawer(); G.toast(n + " photo(s) ajoutée(s) à l'album", { tag: ".04 / ALBUM", tone: "success" }); };
  };

  /* Vignette « photo » illustrée (pas d'image de banque) */
  APP.photoTile = function (seed, label) {
    var pal = [["#F6C77A", "#2E8F89", "#063F3E"], ["#E58F5E", "#0C7873", "#032726"], ["#FFD9A0", "#5FAAA5", "#06605E"], ["#F3D9A8", "#8DB65E", "#3E8A62"]][seed % 4];
    var h1 = 40 + (seed * 13) % 30, h2 = 55 + (seed * 7) % 25;
    return '<div class="mv-ph-tile"><svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice"><rect width="160" height="120" fill="' + pal[0] + '"/><circle cx="' + (30 + (seed * 17) % 100) + '" cy="30" r="12" fill="#FFF3D6" opacity=".85"/><path d="M0 ' + (120 - h1) + " L40 " + (70 - (seed % 3) * 8) + " L70 " + (95 - h1 / 3) + " L110 " + (60 - (seed % 4) * 6) + " L160 " + (120 - h2) + ' L160 120 L0 120Z" fill="' + pal[1] + '"/><path d="M0 120 L0 ' + (110 - (seed % 5) * 4) + " Q80 " + (90 + (seed % 3) * 6) + " 160 " + (104 - (seed % 4) * 3) + ' L160 120Z" fill="' + pal[2] + '"/>' + (seed % 3 === 0 ? '<path d="M76 70 l8 -14 l8 14 z" fill="#C42621"/>' : "") + "</svg>" + (label ? "<span>" + esc(label) + "</span>" : "") + "</div>";
  };

  /* ══ Roadmap ═══════════════════════════════════════════════════════════ */
  function track2d(c) {
    var n = c.programme.length, W = 1000, H = 230, pts = [];
    for (var i = 0; i < n; i++) { var t = n > 1 ? i / (n - 1) : 0; pts.push([40 + t * (W - 80), H / 2 + Math.sin(t * Math.PI * 2.2) * 62]); }
    var d = pts.map(function (p, i) { if (!i) return "M" + p[0] + " " + p[1]; var q = pts[i - 1], mx = (q[0] + p[0]) / 2; return "C" + mx + " " + q[1] + " " + mx + " " + p[1] + " " + p[0] + " " + p[1]; }).join(" ");
    var today = Math.max(1, Math.min(n, APP.campDay(c))), tp = pts[today - 1] || pts[0];
    var nodes = pts.map(function (p, i) { var s = dayState(c, i + 1), j = i + 1; return '<g class="mv-st mv-st--' + s + '" data-day="' + j + '" tabindex="0" role="button" aria-label="' + APP.jj(j) + " " + esc(c.programme[i].titre || "") + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (s === "now" ? 15 : 11) + '"/><text x="' + p[0] + '" y="' + (p[1] + (i % 2 ? 34 : -24)) + '" text-anchor="middle">' + APP.jj(j) + "</text></g>"; }).join("");
    var passed = pts.slice(0, today);
    var dp = passed.map(function (p, i) { if (!i) return "M" + p[0] + " " + p[1]; var q = passed[i - 1], mx = (q[0] + p[0]) / 2; return "C" + mx + " " + q[1] + " " + mx + " " + p[1] + " " + p[0] + " " + p[1]; }).join(" ");
    return '<div class="mv-track2d"><svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Frise du camp"><path d="' + d + '" class="mv-rail"/><path d="' + d + '" class="mv-rail-ties"/>' + (passed.length > 1 ? '<path d="' + dp + '" class="mv-rail-done"/>' : "") + nodes + (c.statut !== "clos" && APP.campDay(c) >= 1 && APP.campDay(c) <= n ? '<g class="mv-train" transform="translate(' + tp[0] + "," + (tp[1] - 38) + ')"><rect x="-26" y="-14" width="52" height="28" rx="10"/><path d="M-12 14 v6 M12 14 v6" /><text x="0" y="5" text-anchor="middle">GST</text></g>' : "") + "</svg></div>";
  }
  var map3d = null;
  APP.route("/app/roadmap", { title: "Roadmap", perm: "roadmap", crumb: function () { return esc(APP.camp().court.toUpperCase()) + " / .04 ROADMAP"; }, render: function (p) {
    var c = APP.camp(), n = c.programme.length, today = APP.campDay(c);
    if (!c.modules.roadmap || !n) return APP.head(".04 / ROADMAP", "Roadmap", "") + APP.empty("Roadmap non activée", "La roadmap est réservée aux camps de deux semaines et aux jamborees. Elle s'active dans les modules du camp.");
    var can3d = c.id === "r26" && n === 14, view = p.q.v || (can3d ? "3d" : "2d");
    var cur = c.programme[Math.max(0, Math.min(n, today) - 1)];
    var strip = '<div class="mv-frise">' + c.programme.map(function (d) { var s = dayState(c, d.j); return '<button class="gst-station' + (s === "now" ? " is-now" : s === "future" ? " is-future" : "") + '" data-day="' + d.j + '"><span class="gst-station__j">' + APP.jj(d.j) + '</span><div><span class="gst-tag' + (s === "now" ? " gst-tag--accent" : "") + '">' + { past: "PASSÉE", now: "AUJOURD'HUI", future: "À VENIR" }[s] + '</span><div class="gst-ui">' + esc(d.titre || "À construire") + "</div></div></button>"; }).join("") + "</div>";
    var stage = view === "3d" && can3d ? '<div class="mv-rm3d" id="rm3d"><canvas tabindex="0" aria-label="Circuit 3D du camp — touchez une gare"></canvas><div class="rm-lands"></div><div class="rm-tags"></div><div class="mv-rm3d__flash" data-flash></div><div class="mv-rm3d__hud gst-glass"><svg class="gst-icon gst-icon--sm"><use data-hud-ico href="#i-sun"/></svg><span data-hud>Météo du camp</span></div></div>' : APP.card("Circuit du camp", track2d(c) + '<p class="mv-muted mv-small" style="margin:0">Version 2D : mêmes étapes, même détail au clic. ' + (can3d ? "Elle s'active automatiquement sur les appareils modestes." : "") + "</p>", { ico: "route" });
    var demo = APP.role() === "chef" && c.statut === "en cours" ? '<button class="gst-btn gst-btn--ghost" data-next-day>' + ico("skip-forward", "gst-icon--sm") + "Passer au lendemain (démo)</button>" : "";
    return APP.head(".04 / ROADMAP · " + esc(c.court.toUpperCase()), cur && today >= 1 && today <= n ? APP.jj(today) + " · " + esc(cur.titre) : "Le circuit du camp", "Un véhicule avance d'étape en étape, une étape par journée. Touchez une gare pour ouvrir le programme complet.", (can3d ? APP.seg("rmv", [["3d", "Vue 3D"], ["2d", "Vue 2D"]], view, { sm: true }) : "") + demo) +
      stage + strip;
  }, mount: function (el, p) {
    var c = APP.camp();
    APP.bind(el, "click", "[data-day]", function (b) { APP.openDay(c, +b.dataset.day); });
    APP.bind(el, "keydown", "[data-day]", function (b, e) { if (e.key === "Enter") APP.openDay(c, +b.dataset.day); });
    var sg = el.querySelector("[data-seg=rmv]"); if (sg) sg.addEventListener("gst-change", function (e) { APP.go("#/app/roadmap?v=" + e.detail.value); });
    var nd = el.querySelector("[data-next-day]"); if (nd) nd.onclick = function () { APP.commit("day", function (st) { st.today = APP.addDays(st.today, 1); }, { log: ["Démo", "Date simulée", APP.state.today, APP.addDays(APP.state.today, 1)], offline: false }); G.toast("Nouvelle journée : " + APP.dday(APP.state.today), { tag: ".04 / ROADMAP", tone: "success" }); if (map3d) map3d.adv(); };
    if (p.q.j) setTimeout(function () { APP.openDay(c, +p.q.j); }, 300);
    var box = el.querySelector("#rm3d"); if (!box) return;
    var K = window.GST3D;
    if (!K || !K.webglOK() || K.lowEnd()) { G.toast("Carte 2D activée automatiquement : toutes les informations restent disponibles.", { tag: ".04 / CARTE 2D" }); APP.go("#/app/roadmap?v=2d"); return; }
    var n = c.programme.length;
    var RM = { N: n, st: { today: Math.max(0, Math.min(n - 1, APP.campDay(c) - 1)), sel: null, view: "3d", listeners: [] },
      j: function (i) { return APP.jj(i + 1); },
      state: function (i) { return dayState(c, i + 1); },
      on: function (fn) { RM.st.listeners.push(fn); }, emit: function (ev, a) { RM.st.listeners.forEach(function (fn) { fn(ev, a); }); },
      select: function (i) { RM.st.sel = i; RM.emit("select", i); if (i != null) APP.openDay(c, i + 1); } };
    var hud = box.querySelector("[data-hud]"), hudIco = box.querySelector("[data-hud-ico]"), flash = box.querySelector("[data-flash]");
    Promise.all([import("three"), import("three/addons/controls/OrbitControls.js")]).then(function (mods) {
      if (!document.body.contains(box)) return;
      var THREE = mods[0], OC = mods[1].OrbitControls;
      var map = K.scenes.roadmap(THREE, OC, { canvas: box.querySelector("canvas"), RM: RM, tags: box.querySelector(".rm-tags"), landmarks: box.querySelector(".rm-lands"), season: "petite-seche",
        onFlash: function (k) { flash.style.opacity = k; if (k > 0) setTimeout(function () { flash.style.transition = "opacity .3s"; flash.style.opacity = 0; setTimeout(function () { flash.style.transition = ""; }, 320); }, 40); },
        onHud: function (h) { hudIco.setAttribute("href", "#i-" + h.ico); hud.textContent = h.label + " · " + h.temp + " °C · vent " + h.wind + " km/h"; },
        onLowPerf: function () { APP.go("#/app/roadmap?v=2d"); G.toast("Carte 2D activée automatiquement", { tag: ".04 / CARTE 2D" }); } });
      map3d = { adv: function () { var prev = RM.st.today; RM.st.today = Math.min(n - 1, prev + 1); RM.emit("advance", { from: prev, to: RM.st.today }); } };
      window.GST_MAP = map;
    }).catch(function () { APP.go("#/app/roadmap?v=2d"); });
  } });

  /* ══ Construction du programme (M4.1) ══════════════════════════════════ */
  APP.route("/app/programme", { title: "Construction du programme", perm: "programme.view", crumb: function () { return esc(APP.camp().court.toUpperCase()) + " / .04 / PROGRAMME"; }, render: function (p) {
    var c = APP.camp(), n = APP.jours(c), canW = APP.role() === "chef" || APP.role() === "commissaire";
    if (c.programme.length < n) for (var j = c.programme.length + 1; j <= n; j++) c.programme.push({ j: j, titre: "", lieu: c.lieu, resp: "", unites: "Toutes", acts: [], cr: "", photos: 0, sansCuisine: false });
    var sel = +(p.q.j || 1), d = c.programme[sel - 1];
    var done = c.programme.filter(function (x) { return x.acts.length; }).length;
    var list = '<div class="mv-daylist">' + c.programme.map(function (x) { return '<a href="#/app/programme?j=' + x.j + '" class="' + (x.j === sel ? "is-on " : "") + (x.acts.length ? "is-done" : "") + '"><b>' + APP.jj(x.j) + "</b><span>" + esc(x.titre || "À construire") + "</span><small>" + x.acts.length + " activité(s)</small></a>"; }).join("") + "</div>";
    var mat = materielOf(c, sel), mn = menuOf(c, sel);
    var acts = d.acts.map(function (a, k) { return '<div class="mv-act"><input class="mv-cell" type="time" value="' + a.h + '" data-ah="' + k + '"' + (canW ? "" : " disabled") + '><input class="mv-cell mv-act__t" value="' + esc(a.titre) + '" data-at="' + k + '"' + (canW ? "" : " disabled") + ' placeholder="Titre de l\'activité">' + (canW ? '<button class="gst-icon-btn gst-icon-btn--ghost" data-adel="' + k + '" aria-label="Supprimer">' + ico("x", "gst-icon--sm") + "</button>" : "") + "</div>"; }).join("");
    return APP.head(".04 / CONSTRUCTION DU PROGRAMME", "Ce qui se passe chaque jour", "Journées générées depuis les dates du camp. Le matériel vient du groupe Activités, le menu du module Cuisine. " + done + " / " + n + " journées construites.", canW ? '<button class="gst-btn gst-btn--secondary" data-dup>' + ico("layers", "gst-icon--sm") + "Dupliquer cette journée</button>" : "") +
      '<div class="mv-split2">' + APP.card("Journées", list, { ico: "calendar" }) +
      APP.card(APP.jj(sel) + " · " + APP.dday(APP.addDays(c.du, sel - 1)), '<div class="mv-form mv-form--2">' + APP.field("Titre de la journée", APP.input("pg-t", d.titre, { attrs: canW ? "" : " readonly" }), { cls: "is-full" }) + APP.field("Lieu", APP.input("pg-l", d.lieu, { attrs: canW ? "" : " readonly" })) + APP.field("Responsable", APP.input("pg-r", d.resp, { attrs: canW ? "" : " readonly" })) + APP.field("Unités concernées", APP.input("pg-u", d.unites, { attrs: canW ? "" : " readonly" })) + '<div style="align-self:end">' + APP.check("pg-sc", d.sansCuisine, "Jour sans cuisine (quartier libre)", { attrs: canW ? "" : " disabled" }) + "</div></div>" +
        '<span class="gst-label">Activités</span><div class="mv-stack">' + (acts || '<p class="mv-muted" style="margin:0">Aucune activité.</p>') + "</div>" + (canW ? '<button class="gst-btn gst-btn--secondary gst-btn--sm" data-aadd>' + ico("plus", "gst-icon--sm") + "Ajouter une activité</button>" : "") +
        '<div class="mv-g2"><div><span class="gst-label">Matériel (groupe I)</span><div class="mv-tag-row" style="margin-top:6px">' + (mat.map(function (r) { return '<span class="gst-badge">' + esc(r.a.nom) + " × " + f(r.need) + "</span>"; }).join("") || '<span class="mv-muted">—</span>') + '</div><a class="mv-small" href="#/app/logistique/I">Rattacher du matériel</a></div><div><span class="gst-label">Menu (cuisine)</span><p class="mv-small" style="margin:6px 0 0">' + (mn ? mn.map(esc).join(" · ") : "Menu non arrêté") + "</p></div></div>", { ico: "list" }) + "</div>";
  }, mount: function (el, p) {
    var c = APP.camp(), sel = +(p.q.j || 1), d = c.programme[sel - 1];
    function save(k, v, lab) { if (d[k] === v) return; var old = d[k]; APP.commit("pg", function () { d[k] = v; }, { log: ["Programme · " + APP.jj(sel), lab, old, v] }); }
    [["pg-t", "titre", "Titre"], ["pg-l", "lieu", "Lieu"], ["pg-r", "resp", "Responsable"], ["pg-u", "unites", "Unités"]].forEach(function (x) { var i = el.querySelector("#" + x[0]); if (i) i.onchange = function () { save(x[1], i.value, x[2]); }; });
    var sc = el.querySelector("#pg-sc"); if (sc) sc.onchange = function () { save("sansCuisine", sc.checked, "Sans cuisine"); };
    APP.bind(el, "change", "[data-ah]", function (i) { APP.commit("ah", function () { d.acts[+i.dataset.ah].h = i.value; d.acts.sort(function (a, b) { return a.h < b.h ? -1 : 1; }); }); });
    APP.bind(el, "change", "[data-at]", function (i) { APP.commit("at", function () { d.acts[+i.dataset.at].titre = i.value; }, { log: ["Programme · " + APP.jj(sel), "Activité", "", i.value] }); });
    APP.bind(el, "click", "[data-adel]", function (b) { APP.commit("adel", function () { d.acts.splice(+b.dataset.adel, 1); }); });
    var a = el.querySelector("[data-aadd]"); if (a) a.onclick = function () { APP.commit("aadd", function () { var last = d.acts.length ? d.acts[d.acts.length - 1].h : "07:00", hh = Math.min(22, +last.slice(0, 2) + 2); d.acts.push({ id: APP.uid("a"), h: String(hh).padStart(2, "0") + ":00", titre: "", lieu: d.lieu, resp: d.resp, unites: d.unites, desc: "" }); }); setTimeout(function () { var ins = document.querySelectorAll("[data-at]"); if (ins.length) ins[ins.length - 1].focus(); }, 60); };
    var dp = el.querySelector("[data-dup]"); if (dp) dp.onclick = function () {
      var empties = c.programme.filter(function (x) { return !x.acts.length && x.j !== sel; });
      var m = APP.modal('<span class="gst-tag">DUPLIQUER UNE JOURNÉE TYPE</span><h4 class="gst-display-md" style="margin:10px 0">' + APP.jj(sel) + " → …</h4>" + '<div class="mv-choice">' + c.programme.filter(function (x) { return x.j !== sel; }).map(function (x) { return '<label><input type="checkbox" value="' + x.j + '"' + (!x.acts.length ? " checked" : "") + "><b>" + APP.jj(x.j) + "</b><small>" + esc(x.titre || "vide") + "</small></label>"; }).join("") + '</div><div class="mv-row" style="margin-top:14px"><button class="gst-btn gst-btn--primary" data-ok>Dupliquer</button><button class="gst-btn gst-btn--ghost" data-close>Annuler</button></div>', { wide: true });
      m.querySelector("[data-ok]").onclick = function () { var js = Array.prototype.map.call(m.querySelectorAll("input:checked"), function (x) { return +x.value; }); APP.closeDrawer(); APP.commit("dup", function () { js.forEach(function (j) { var t = c.programme[j - 1]; t.titre = t.titre || d.titre; t.lieu = d.lieu; t.resp = d.resp; t.unites = d.unites; t.acts = d.acts.map(function (a) { return Object.assign({}, a, { id: APP.uid("a") }); }); }); }, { log: ["Programme", "Duplication de " + APP.jj(sel), "", js.length + " journée(s)"] }); G.toast(js.length + " journée(s) remplie(s)", { tag: ".04 / PROGRAMME", tone: "success" }); };
    };
  } });

  /* ══ Agenda (M4.4) ═════════════════════════════════════════════════════ */
  APP.route("/app/agenda", { title: "Agenda", perm: "agenda", crumb: function () { return esc(APP.camp().court.toUpperCase()) + " / .04 / AGENDA"; }, render: function (p) {
    var c = APP.camp(), v = p.q.v || "liste", fu = p.q.u || "", fr = p.q.r || "";
    if (!c.programme.length) return APP.head(".04 / AGENDA", "Agenda", "") + APP.empty("Pas de programme", "Ce camp n'a pas de programme jour par jour.");
    var U = fu ? APP.unite(fu) : null;
    function keep(d) { if (fu && d.unites !== "Toutes" && d.unites.indexOf("Toutes") < 0 && d.unites.indexOf(U.nom.split(" ").pop()) < 0) return false; if (fr && d.resp !== fr) return false; return true; }
    var days = c.programme.filter(keep);
    var resps = {}; c.programme.forEach(function (d) { if (d.resp) resps[d.resp] = 1; });
    var body = v === "semaine" ? '<div class="mv-tw"><div class="mv-week">' + days.map(function (d) { return '<div class="mv-week__d' + (dayState(c, d.j) === "now" ? " is-today" : "") + '"><span class="gst-tag">' + APP.jj(d.j) + " · " + APP.dday(APP.addDays(c.du, d.j - 1)).split(" ").slice(0, 2).join(" ").toUpperCase() + "</span><h5>" + esc(d.titre || "—") + "</h5>" + d.acts.map(function (a) { return '<div class="mv-ev"><b>' + a.h + "</b>" + esc(a.titre) + "</div>"; }).join("") + "</div>"; }).join("") + "</div></div>"
      : '<div class="mv-stack">' + days.map(function (d) { return '<div class="mv-agday' + (dayState(c, d.j) === "now" ? " is-today" : "") + '"><div class="mv-agday__h"><b>' + APP.jj(d.j) + "</b><span>" + APP.dday(APP.addDays(c.du, d.j - 1)) + "</span></div><div><h4>" + esc(d.titre || "—") + '</h4><span class="mv-mono mv-muted">' + esc(d.lieu) + " · " + esc(d.resp) + " · " + esc(d.unites) + '</span><div class="mv-list">' + d.acts.map(function (a) { return '<div class="mv-li"><span class="mv-mono"><b>' + a.h + '</b></span><div class="mv-li__m"><b>' + esc(a.titre) + "</b></div></div>"; }).join("") + "</div></div></div>"; }).join("") + "</div>";
    return APP.head(".04 / AGENDA", "Le programme, à l'ancienne", "Vue liste ou semaine, filtrable par unité et par responsable, imprimable en A4 (lisible sans couleur) pour ceux qui n'ont pas de réseau.", '<button class="gst-btn gst-btn--secondary" data-print>' + ico("printer", "gst-icon--sm") + 'Imprimer</button><button class="gst-btn gst-btn--ghost" data-csv>' + ico("download", "gst-icon--sm") + "Exporter</button>") +
      '<div class="mv-card"><div class="mv-row">' + APP.seg("agv", [["liste", "Liste"], ["semaine", "Semaine"]], v, { sm: true }) + APP.select("ag-u", APP.state.unites.map(function (u) { return [u.id, u.nom]; }), fu, { ph: "Toutes les unités" }) + APP.select("ag-r", Object.keys(resps).map(function (r) { return [r, r]; }), fr, { ph: "Tous les responsables" }) + (APP.role() === "chef" ? APP.toggle("ag-pub", c.agendaPublic !== false, "Consultable sur le site public") : "") + "</div></div>" + body;
  }, mount: function (el, p) {
    var c = APP.camp(), q = function () { return "#/app/agenda?v=" + (el.querySelector("[data-seg=agv] [aria-pressed=true]") || {}).dataset.value + "&u=" + el.querySelector("#ag-u").value + "&r=" + encodeURIComponent(el.querySelector("#ag-r").value); };
    el.querySelector("[data-seg=agv]").addEventListener("gst-change", function () { APP.go(q()); });
    el.querySelector("#ag-u").onchange = el.querySelector("#ag-r").onchange = function () { APP.go(q()); };
    var pb = el.querySelector("#ag-pub"); if (pb) pb.onchange = function () { APP.commit("pub", function () { c.agendaPublic = pb.checked; }, { log: ["Agenda " + c.court, "Consultation publique", "", pb.checked ? "oui" : "non"] }); };
    var U = p.q.u ? APP.unite(p.q.u) : null;
    el.querySelector("[data-print]").onclick = function () { APP.print("Agenda — " + c.nom + (U ? " · " + U.nom : ""), "<h2>Programme" + (U ? " · " + esc(U.nom) : "") + "</h2>" + c.programme.map(function (d) { return "<h3>" + APP.jj(d.j) + " — " + APP.dday(APP.addDays(c.du, d.j - 1)) + " · " + esc(d.titre) + "</h3><p>" + esc(d.lieu) + " · " + esc(d.resp) + "</p><ul>" + d.acts.map(function (a) { return "<li><b>" + a.h + "</b> " + esc(a.titre) + "</li>"; }).join("") + "</ul>"; }).join("")); };
    el.querySelector("[data-csv]").onclick = function () { var rows = [["jour", "date", "heure", "activité", "lieu", "responsable", "unités"]]; c.programme.forEach(function (d) { d.acts.forEach(function (a) { rows.push([APP.jj(d.j), APP.addDays(c.du, d.j - 1), a.h, a.titre, a.lieu || d.lieu, d.resp, d.unites]); }); }); APP.csv("agenda-" + c.id, rows); };
  } });
})();
