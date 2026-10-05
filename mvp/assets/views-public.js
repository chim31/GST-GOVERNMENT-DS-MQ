/* GST GOVERNMENT — MVP · Espace public (P5) : site vitrine, inscription, bus volant, mon inscription,
   espace jeune, espace famille. Contrainte de dignité : aucun statut de paiement en public. */
(function () {
  "use strict";
  var G = window.GST, APP = window.APP, S = window.GST_SEED;
  var ico = APP.ico, esc = APP.esc, f = APP.f, cfa = APP.cfa;
  var STATES = ["libre", "réservé", "partiel", "garanti"];

  function openCamp() { return APP.state.camps.filter(function (c) { return c.modules.inscription && c.statut === "préparation"; })[0] || APP.camp("k26"); }
  function code(c, ins) { return "GST-" + c.id.toUpperCase() + "-" + String(ins.siege).padStart(2, "0") + ins.id.slice(-3).toUpperCase(); }
  APP.insCode = code;
  function myIns(c, pid) { return c.inscriptions.filter(function (i) { return i.person === pid; })[0]; }

  /* ══ Bus : sièges dérivés de l'état ═════════════════════════════════════ */
  function seats(c) {
    var out = []; for (var s = 0; s < c.places; s++) out.push({ etat: 0, prenom: "", nom: "", initiale: "", paye: 0 });
    c.inscriptions.forEach(function (i) { var p = APP.person(i.person); if (!p || i.siege > c.places) return; out[i.siege - 1] = { etat: APP.seatState(c, i), prenom: p.prenom, nom: p.nom, initiale: p.nom[0] + ".", paye: APP.versements(i), person: p.id, ins: i.id }; });
    return out;
  }
  APP.busSeats = seats;
  /* Plan 2D : public = libre / occupé (prénom + initiale) ; responsable = 4 états ; « moi » = mon siège seulement */
  function plan2d(c, mode, me, hl) {
    var ss = seats(c);
    return '<div class="mv-bus-wrap' + (c.inscriptions.length >= c.places ? " is-full" : "") + '"><div class="mv-balloons" aria-hidden="true">' + Array.from({ length: 11 }, function (_, i) { return '<i style="transform:scale(' + (0.35 + 0.65 * Math.min(1, c.inscriptions.length / c.places)) + ") rotate(" + ((i - 5) * 6) + 'deg)"></i>'; }).join("") + '</div><div class="mv-bus" role="list" aria-label="Plan des sièges">' + ss.map(function (s, i) {
      var cls = "mv-seat", lab = "Siège " + (i + 1) + " · libre", txt = i + 1;
      if (s.etat) {
        var mine = me && s.person === me;
        if (mode === "resp" || (mode === "moi" && mine)) { cls += " s" + s.etat; lab = "Siège " + (i + 1) + " · " + s.prenom + " " + s.initiale + " · " + STATES[s.etat] + (s.etat === 2 ? " (" + f(s.paye) + " / " + f(c.inscription) + ")" : ""); }
        else { cls += " pub"; lab = "Siège " + (i + 1) + " · " + s.prenom + " " + s.initiale; }
        if (mine) cls += " me";
        txt = s.prenom.slice(0, 2).toUpperCase();
      }
      if (hl && hl === i + 1) cls += " new";
      return '<button class="' + cls + '" role="listitem" title="' + esc(lab) + '" aria-label="' + esc(lab) + '" data-seat="' + (i + 1) + '">' + txt + "</button>";
    }).join("") + "</div></div>" +
      (mode === "resp" ? '<div class="mv-legend"><span><i style="background:var(--gst-bg-panel);box-shadow:inset 0 0 0 1px var(--gst-line-soft)"></i>Libre</span><span><i style="box-shadow:inset 0 0 0 1.5px var(--gst-brand)"></i>Réservé · paiement attendu</span><span><i style="background:linear-gradient(0deg,var(--gst-brand) 50%,#fff 50%)"></i>Partiel</span><span><i style="background:var(--gst-brand)"></i>Garanti</span></div>'
        : '<div class="mv-legend"><span><i style="background:var(--gst-bg-panel);box-shadow:inset 0 0 0 1px var(--gst-line-soft)"></i>Place libre</span><span><i style="background:var(--gst-brand)"></i>Place prise</span>' + (mode === "moi" ? '<span><i style="box-shadow:0 0 0 2px var(--gst-eclair)"></i>Mon siège</span>' : "") + "</div>");
  }
  APP.plan2d = plan2d;
  function busFrame(c) {
    return '<div class="mv-busframe" id="busf"><canvas aria-label="Bus volant en 3D — faites glisser pour tourner"></canvas><div class="bus-names"></div><div class="bus-tip"></div><div class="bus-camp" data-camp aria-hidden="true"><span>' + ico("tent", "gst-icon--sm") + esc(c.lieu.split(" — ")[0]) + ' · le camp</span></div><div class="bus-count3" aria-hidden="true"><span></span></div><div class="mv-busframe__flash" data-flash></div>' +
      '<div class="mv-busframe__hud gst-glass"><span class="gst-tag">PLACES RESTANTES</span><b data-left>' + (c.places - c.inscriptions.length) + "</b><span class=\"mv-mono\">" + c.inscriptions.length + " / " + c.places + " inscrits</span></div></div>";
  }
  /* Monte la scène 3D du design system sur l'état du camp */
  APP.mountBus3d = function (root, c, mode, me) {
    var frame = root.querySelector("#busf"); if (!frame) return null;
    var K = window.GST3D;
    if (!K || !K.webglOK() || K.lowEnd()) { frame.classList.add("is-2d"); return null; }
    var ss = seats(c), listeners = [];
    var BUS = {
      seats: ss, frame: frame, ME: -1,
      get view() { return mode === "moi" ? "moi" : mode; },
      on: function (fn) { listeners.push(fn); }, emit: function (e, a) { listeners.forEach(function (fn) { fn(e, a); }); },
      count: function () { return ss.filter(function (s) { return s.etat > 0; }).length; },
      shown: function (i) { var s = ss[i]; if (!s.etat) return "free"; if (mode === "resp" || (mode === "moi" && me && s.person === me)) return ["free", "res", "part", "gar"][s.etat]; return "occ"; },
      label: function (i) { var s = ss[i], n = "SIÈGE " + String(i + 1).padStart(2, "0"); if (!s.etat) return n + " · LIBRE"; var who = (s.prenom + " " + s.initiale).toUpperCase(), st = BUS.shown(i); return st === "occ" ? n + " · " + who : n + " · " + who + " · " + ({ res: "RÉSERVÉ", part: "ACOMPTE " + f(s.paye), gar: "GARANTI ⚜" })[st]; },
      countdown: function () { var cd = frame.querySelector(".bus-count3 span"); if (G.reduced()) return Promise.resolve(); return ["3", "2", "1"].reduce(function (p, n) { return p.then(function () { cd.textContent = n; return cd.animate([{ opacity: 0, transform: "translateY(18%) scale(.88,.8)" }, { opacity: 1, transform: "none", offset: .35 }, { opacity: 1, transform: "scale(1.02)", offset: .75 }, { opacity: 0, transform: "scale(1.08)" }], { duration: 520, easing: G.ease("tonnerre") }).finished; }); }, Promise.resolve()); },
      stampFull: function () { frame.querySelectorAll(".gst-stamp").forEach(function (s) { s.remove(); }); return G.stamp(frame, { big: "BUS COMPLET", small: "DÉCOLLAGE CONFIRMÉ · " + APP.dshort(c.du), left: "50%", top: "56%" }).then(function (s) { s.style.zIndex = 7; }); },
      /* Resynchronise depuis l'état après une inscription ou un paiement */
      sync: function (ev, seat) { var nw = seats(c); nw.forEach(function (s, i) { ss[i] = s; }); var left = frame.querySelector("[data-left]"); if (left) G.odometer(left, c.places - c.inscriptions.length, { tone: "good" }); if (ev) BUS.emit(ev, seat - 1); if (c.inscriptions.length >= c.places) setTimeout(function () { BUS.emit("full"); }, 900); }
    };
    var flash = frame.querySelector("[data-flash]");
    Promise.all([import("three"), import("three/addons/controls/OrbitControls.js")]).then(function (mods) {
      if (!document.body.contains(frame)) return;
      BUS.scene = K.scenes.bus(mods[0], mods[1].OrbitControls, { canvas: frame.querySelector("canvas"), BUS: BUS, tip: frame.querySelector(".bus-tip"), names: frame.querySelector(".bus-names"), campTag: frame.querySelector("[data-camp]"),
        onFlash: function (k) { flash.style.opacity = k * 0.8; if (k > 0) setTimeout(function () { flash.style.transition = "opacity .3s"; flash.style.opacity = 0; setTimeout(function () { flash.style.transition = ""; }, 320); }, 40); },
        onLowPerf: function () { frame.classList.add("is-2d"); } });
      if (BUS.pendingNew) setTimeout(function () { BUS.emit("register", BUS.pendingNew - 1); }, 1200);
    }).catch(function () { frame.classList.add("is-2d"); });
    return BUS;
  };

  /* ══ Site public ═══════════════════════════════════════════════════════ */
  function sec(tag, title, act, body) { return '<section class="mv-sec"><div class="mv-sec__h"><div><span class="gst-tag gst-tag--accent">' + tag + "</span><h2>" + title + "</h2></div>" + (act || "") + "</div>" + body + "</section>"; }
  APP.route("/site", { title: "Groupe Scout Tonnerre", render: function () {
    var k = openCamp(), R = APP.calc(k), r26 = APP.camp("r26");
    var bilans = APP.state.camps.filter(function (c) { return c.groupes.H.publie; });
    return '<section class="mv-sh"><div class="mv-sh__bg"></div><div class="mv-sh__3d"><canvas id="site-crest" aria-hidden="true"></canvas></div><div class="mv-sh__shade"></div><div class="mv-sh__c"><span class="gst-tag" data-decode>GROUPE SCOUT TONNERRE · DISTRICT GOLFE · DEPUIS 2013</span><h1>Toujours<br>prêts.</h1><p>Camps, missions, jamborees : le GST forme des jeunes qui aiment la nature, servent leur communauté et savent préparer chaque départ.</p><div class="mv-row"><a class="gst-btn gst-btn--eclair gst-btn--lg" href="#/site/inscription/' + k.id + '">' + ico("ticket") + "S'inscrire au " + esc(k.court) + '</a><a class="gst-btn gst-btn--ghost gst-btn--lg" style="color:#fff;background:rgba(255,255,255,.14)" href="#/site/bus">' + ico("bus") + "Voir le bus volant</a></div></div></section>" +
      '<div class="mv-g3">' + [["heart", "Servir", "Chantiers communautaires, salubrité, accueil : le scout rend service sans attendre de retour."], ["leaf", "Protéger la nature", "Le camp repart sans laisser de trace. Le terrain est rendu plus propre qu'à l'arrivée."], ["compass", "Grandir ensemble", "De 8 à 25 ans, chaque unité fait grandir l'autonomie, la confiance et le sens des responsabilités."]].map(function (v) { return '<div class="mv-card"><span class="mv-ico">' + ico(v[0]) + '</span><h3 class="gst-display-md" style="margin:0;font-size:1.9rem">' + v[1] + '</h3><p class="mv-muted" style="margin:0">' + v[2] + "</p></div>"; }).join("") + "</div>" +
      sec(".01 / PROCHAIN GRAND CAMP", esc(k.nom), '<a class="gst-btn gst-btn--primary" href="#/site/inscription/' + k.id + '">S\'inscrire</a>', '<div class="mv-split"><a class="mv-card" href="#/site/bus" style="text-decoration:none;gap:12px"><span class="gst-tag">LE BUS VOLANT · ' + k.inscriptions.length + " / " + k.places + " PLACES PRISES</span>" + plan2d(k, "public") + '<span class="mv-mono mv-muted">Chaque inscription réserve un siège visible de tous. Le bus décolle quand il est complet.</span></a>' +
        '<div class="mv-stack"><div class="mv-card mv-card--brand"><span class="gst-tag">DATES</span><b class="gst-display-md" style="font-size:2.2rem">' + APP.dlong(k.du) + " → " + APP.dlong(k.au) + '</b><span class="mv-mono">' + esc(k.lieu) + '</span></div><div class="mv-g2">' + APP.kpi("Places restantes", k.places - k.inscriptions.length, { ico: "ticket" }) + APP.kpi("Participation", f(k.inscription), { unit: "F CFA", ico: "wallet" }) + '</div><a class="mv-card mv-card--tint" href="#/site/activites" style="text-decoration:none"><span class="gst-tag">EN CE MOMENT</span><b>' + esc(r26.court) + " · " + APP.jj(APP.campDay(r26)) + '</b><span class="mv-muted">Suivez le programme jour par jour →</span></a></div></div>') +
      sec(".02 / ACTUALITÉS", "Les nouvelles du groupe", '<a class="gst-btn gst-btn--ghost" href="#/site/actus">Toutes les actualités</a>', '<div class="mv-g3">' + S.ACTUS.slice(0, 3).map(function (a, i) { return '<article class="mv-card" style="padding:0;overflow:hidden">' + APP.photoTile(i + 3, APP.dshort(a.d)) + '<div style="padding:0 18px 18px;display:flex;flex-direction:column;gap:6px"><h3 style="margin:0;font-family:var(--gst-font-display);font-weight:400;font-size:1.5rem;line-height:1">' + esc(a.t) + '</h3><p class="mv-muted" style="margin:0">' + esc(a.x) + "</p></div></article>"; }).join("") + "</div>") +
      sec(".03 / TRANSPARENCE", "Bilans de retour publiés", '<a class="gst-btn gst-btn--ghost" href="#/site/bilans">Tous les bilans</a>', '<div class="mv-grid">' + bilans.map(function (c) { var rows = APP.retoursRows(c), ok = rows.filter(function (x) { return x.p && x.p.etat !== "perdu"; }).length; return '<a class="mv-card" href="#/site/bilans/' + c.id + '" style="text-decoration:none"><span class="gst-tag">' + esc(S.TYPES[c.type].court.toUpperCase()) + " · " + APP.dshort(c.du) + '</span><h3 class="gst-display-md" style="margin:0;font-size:1.7rem">' + esc(c.court) + '</h3><div class="mv-row mv-row--sb"><span class="mv-mono">Matériel revenu</span><b class="mv-mono">' + Math.round(rows.length ? (ok / rows.length) * 100 : 100) + ' %</b></div><div class="mv-bar"><i style="width:' + (rows.length ? (ok / rows.length) * 100 : 100) + '%"></i></div></a>'; }).join("") + "</div>") +
      '<section class="mv-card mv-card--brand" style="padding:clamp(22px,4vw,40px)"><span class="gst-tag">REJOINDRE LE GST</span><h2 class="gst-display-md" style="margin:0;font-size:clamp(2.2rem,5vw,3.4rem)">Votre enfant a entre 8 et 25 ans ?</h2><p style="margin:0;max-width:56ch;opacity:.9">Réunions le samedi après-midi au local de Bè. Venez découvrir une unité avant de vous engager.</p><div class="mv-row"><a class="gst-btn gst-btn--eclair" href="#/site/rejoindre">Nous contacter</a><a class="gst-btn gst-btn--ghost" style="color:#fff;background:rgba(255,255,255,.14)" href="#/site/parents">Espace parents</a></div></section>';
  }, mount: function (el) {
    var cv = el.querySelector("#site-crest"), K = window.GST3D; if (!cv || !K || !K.webglOK() || K.lowEnd() || innerWidth < 700) { if (cv) cv.remove(); return; }
    import("three").then(function (THREE) {
      if (!document.body.contains(cv)) return;
      cv.classList.add("is-on"); var c = K.scenes.crest(THREE, { canvas: cv, mode: "aube", distance: 70 }); c.intro();
      
    }).catch(function () { cv.remove(); });
  } });

  APP.route("/site/groupe", { title: "Le groupe", render: function () {
    var tl = [["2013", "Fondation du groupe à Bè par une poignée de routiers du District Golfe."], ["2015", "Première meute de louveteaux et ronde de jeannettes."], ["2018", "Premier jamboree national : 24 jeunes à Kpalimé."], ["2021", "Le groupe dépasse les 100 membres et ouvre un clan de routiers."], ["2024", "Camp de réjouissance de Kpalimé : 71 participants, budget suivi au franc près."], ["2026", "Lancement de GST Government : préparer, financer, nourrir, suivre et raconter chaque camp."]];
    return sec(".01 / LE GROUPE", "Histoire, identité et valeurs", "", '<div class="mv-split"><div class="mv-card"><p class="gst-serif-lg" style="margin:0">Le Groupe Scout Tonnerre appartient au District Golfe de l\'Association Scoute du Togo. Son nom vient de l\'orage qui avait frappé la colline du premier camp — et de l\'énergie qu\'il veut transmettre : l\'éclair qui décide, la crête qui tient.</p><div class="mv-tl">' + tl.map(function (t) { return '<div class="mv-tl__i"><span class="gst-tag">' + t[0] + "</span><div>" + esc(t[1]) + "</div></div>"; }).join("") + '</div></div><div class="mv-stack">' + [["shield-check", "Loi scoute", "Le scout est loyal, il rend service, il aime et protège la nature."], ["users", "Méthode", "Petits groupes, vie dans la nature, progression personnelle et engagement."], ["flag", "Rattachement", "Association Scoute du Togo · District Golfe · @associationscoutedutogo"]].map(function (v) { return APP.card(v[1], '<p class="mv-muted" style="margin:0">' + v[2] + "</p>", { ico: v[0] }); }).join("") + "</div></div>");
  } });
  APP.route("/site/unites", { title: "Les unités", render: function () {
    var descr = { LOU: "Le jeu et la découverte, en meute.", JEA: "La ronde, l'imaginaire et l'entraide.", ECL: "La patrouille, l'aventure et les techniques.", GUI: "La compagnie, l'autonomie et le service.", PIO: "Le projet, le chantier et l'engagement.", ROU: "Le service, la route et la transmission." };
    return sec(".02 / LES UNITÉS", "Six unités, de 8 à 25 ans", "", '<div class="mv-grid">' + APP.state.unites.map(function (u, i) { var n = APP.state.personnes.filter(function (p) { return p.unite === u.id && !p.encadrant; }).length; return '<div class="mv-card" style="padding:0;overflow:hidden">' + APP.photoTile(i * 5 + 1, u.age) + '<div style="padding:0 18px 18px;display:flex;flex-direction:column;gap:6px"><h3 class="gst-display-md" style="margin:0;font-size:1.7rem">' + esc(u.nom) + '</h3><p class="mv-muted" style="margin:0">' + descr[u.id] + '</p><span class="mv-mono">' + n + " membres</span></div></div>"; }).join("") + "</div>");
  } });
  APP.route("/site/activites", { title: "Activités & calendrier", render: function () {
    var cal = [["Janvier", "Rentrée scoute & passages"], ["Mars", "Camp de survie — Mont Agou"], ["Juin", "Journée de salubrité au marché de Bè"], ["Août", "Camp de réjouissance — Attikoumé"], ["Octobre", "Jamboree national — Kara"], ["Novembre", "Camp de formation des chefs — Kpalimé"], ["Décembre", "Veillée de Noël & bilan de l'année"]];
    var r = APP.camp("r26");
    return sec(".03 / ACTIVITÉS", "Le calendrier de l'année", "", '<div class="mv-split"><div class="mv-card"><div class="mv-list">' + cal.map(function (x) { return '<div class="mv-li"><span class="gst-chip">' + x[0] + '</span><div class="mv-li__m"><b>' + esc(x[1]) + "</b></div></div>"; }).join("") + "</div></div>" +
      (r.agendaPublic !== false ? APP.card("En direct · " + esc(r.court), '<p class="mv-muted" style="margin:0">Programme rendu public par le chef de groupe.</p><div class="mv-list">' + r.programme.map(function (d) { var s = APP.dayState(r, d.j); return '<div class="mv-li"><span class="gst-chip' + (s === "now" ? " gst-chip--accent" : "") + '">' + APP.jj(d.j) + '</span><div class="mv-li__m"><b>' + esc(d.titre) + "</b><small>" + esc(d.lieu) + (d.cr && s === "past" ? " · " + esc(d.cr) : "") + "</small></div></div>"; }).join("") + "</div>", { ico: "route", tag: "ROADMAP PUBLIQUE" }) : "") + "</div>");
  } });
  APP.route("/site/galerie", { title: "Galerie", render: function () {
    var r = APP.camp("r26");
    return sec(".04 / GALERIE", "Photos & vidéos, par camp", "", APP.state.camps.map(function (c, ci) { var n = c.id === "r26" ? r.programme.reduce(function (s, d) { return s + (d.photos || 0); }, 0) : c.id === "s26" ? 8 : 0; if (!n) return ""; return '<div class="mv-stack"><h3 class="gst-display-md" style="margin:0;font-size:1.8rem">' + esc(c.nom) + '</h3><div class="mv-gal">' + Array.from({ length: Math.min(n, 12) }, function (_, k) { return APP.photoTile(ci * 11 + k, k % 4 === 0 ? "VIDÉO · 0:4" + k : ""); }).join("") + "</div></div>"; }).join(""));
  } });
  APP.route("/site/actus", { title: "Actualités", render: function () {
    return sec(".05 / ACTUALITÉS", "Actualités & annonces", "", '<div class="mv-stack">' + S.ACTUS.map(function (a, i) { return '<article class="mv-card" style="flex-direction:row;gap:18px;align-items:center;flex-wrap:wrap"><div style="width:220px;max-width:100%">' + APP.photoTile(i + 2, "") + '</div><div style="flex:1;min-width:240px"><span class="gst-tag">' + APP.dlong(a.d).toUpperCase() + '</span><h3 class="gst-display-md" style="margin:6px 0;font-size:1.8rem">' + esc(a.t) + '</h3><p class="mv-muted" style="margin:0">' + esc(a.x) + "</p></div></article>"; }).join("") + "</div>");
  } });
  APP.route("/site/bilans", { title: "Bilans de retour", render: function () {
    var L = APP.state.camps.filter(function (c) { return c.groupes.H.publie; });
    return sec(".06 / TRANSPARENCE", "Comment les choses sont gérées sur le terrain", "", '<p class="mv-muted" style="margin:0;max-width:70ch">Après chaque camp, le groupe Retours pointe ce qui revient, dans quel état, et publie le bilan. Aucun nom, aucune donnée sensible : seulement les quantités, les états et les écarts.</p><div class="mv-grid">' + (L.map(function (c) { return '<a class="mv-card" href="#/site/bilans/' + c.id + '" style="text-decoration:none"><span class="gst-tag">' + APP.dshort(c.du) + " → " + APP.dshort(c.au) + '</span><h3 class="gst-display-md" style="margin:0;font-size:1.7rem">' + esc(c.nom) + '</h3><span class="mv-muted">Lire le bilan →</span></a>'; }).join("") || APP.empty("Aucun bilan publié", "")) + "</div>");
  } });
  APP.route("/site/bilans/:id", { title: "Bilan de retour", render: function (p) {
    var c = APP.camp(p.id); if (!c || !c.groupes.H.publie) return APP.empty("Bilan non publié", "Ce bilan n'est pas encore public.");
    var rows = APP.retoursRows(c), by = {}; rows.forEach(function (x) { var e = x.p ? x.p.etat : "non pointé"; by[e] = (by[e] || 0) + 1; });
    var R = APP.calc(c);
    return sec(".06 / BILAN DE RETOUR", esc(c.nom), '<a class="gst-btn gst-btn--ghost" href="#/site/bilans">Tous les bilans</a>', '<div class="mv-g4">' + ["intact", "usé", "consommé", "perdu"].map(function (e) { return APP.kpi(e.charAt(0).toUpperCase() + e.slice(1), by[e] || 0, { sub: "ligne(s)" }); }).join("") + '</div><div class="mv-g2">' + APP.card("Matériel pointé au retour", '<div class="mv-tw"><table class="mv-t"><thead><tr><th>Article</th><th class="n">Parti</th><th>État</th></tr></thead><tbody>' + rows.map(function (x) { return "<tr><td>" + esc(x.r.a.nom) + '</td><td class="n">' + f(x.r.need) + "</td><td>" + (x.p ? APP.badge(x.p.etat) : "—") + "</td></tr>"; }).join("") + "</tbody></table></div>", { ico: "rotate-ccw" }) +
      APP.card("Les chiffres du camp", '<dl class="gst-spec gst-spec--rules"><dt>Participants</dt><dd>' + APP.effectif(c) + "</dd><dt>Durée</dt><dd>" + APP.jours(c) + " jours</dd><dt>Budget prévu</dt><dd>" + cfa(R.total) + "</dd><dt>Dépensé</dt><dd>" + cfa(R.totalReel) + "</dd><dt>Écart</dt><dd>" + APP.pct(R.totalReel - R.total, R.total || 1) + '</dd></dl><p class="mv-muted mv-small" style="margin:0">Aucune donnée nominative n\'est publiée.</p>', { ico: "calculator" }) + "</div>");
  } });
  APP.route("/site/rejoindre", { title: "Rejoindre le GST", render: function () {
    return sec(".07 / REJOINDRE", "Contact & adhésion", "", '<div class="mv-split"><form class="mv-card mv-form mv-form--2" data-join>' + APP.field("Prénom et nom du jeune", APP.input("jn-n", ""), { req: true, cls: "is-full" }) + APP.field("Âge", APP.input("jn-a", "", { type: "number" })) + APP.field("Unité souhaitée", APP.select("jn-u", APP.state.unites.map(function (u) { return [u.id, u.nom + " (" + u.age + ")"]; }), "ECL")) + APP.field("Parent / tuteur", APP.input("jn-p", ""), { req: true }) + APP.field("Téléphone", APP.input("jn-t", "", { ph: "+228 …" }), { req: true }) + APP.field("Message", '<textarea class="mv-ta" id="jn-m" placeholder="Questions, disponibilités…"></textarea>', { cls: "is-full" }) + '<div class="is-full">' + APP.check("jn-c", false, "J'accepte que le GST me recontacte au sujet de cette demande.") + '</div><button class="gst-btn gst-btn--primary gst-btn--lg is-full" type="submit">Envoyer la demande d\'adhésion</button></form><div class="mv-stack">' + APP.card("Le local", '<p style="margin:0">Local GST — paroisse de Bè, Lomé<br>Réunions le samedi de 15 h à 18 h</p>', { ico: "map-pin" }) + APP.card("Nous joindre", '<p style="margin:0">+228 90 12 00 13<br>@groupesscouttonnerre</p>', { ico: "message-circle" }) + "</div></div>");
  }, mount: function (el) {
    el.querySelector("[data-join]").onsubmit = function (e) { e.preventDefault(); if (!el.querySelector("#jn-n").value || !el.querySelector("#jn-p").value || !el.querySelector("#jn-t").value) { G.toast("Merci de remplir les champs requis", { tag: ".07 / ADHÉSION", tone: "danger" }); return; } APP.log("Site public", "Demande d'adhésion", "", el.querySelector("#jn-n").value); APP.save(); e.target.innerHTML = APP.empty("Demande envoyée", "Merci ! Un chef d'unité vous rappelle sous une semaine pour une séance découverte.", '<a class="gst-btn gst-btn--secondary" href="#/site">Retour à l\'accueil</a>'); };
  } });
  APP.route("/site/parents", { title: "Espace parents", render: function () {
    return sec(".08 / FAMILLES", "Espace parents & familles", "", '<div class="mv-g3">' + [["ticket", "Inscrire mon enfant", "Inscription en ligne aux camps ouverts, siège réservé dans le bus.", "#/site/inscription/" + openCamp().id], ["wallet", "Suivre mon inscription", "Statut, montant payé, reste dû — visible par vous seul.", "#/site/mon-inscription"], ["route", "Suivre le programme", "La roadmap du camp, jour par jour, avec photos et comptes-rendus.", "#/site/activites"]].map(function (x) { return '<a class="mv-card" href="' + x[3] + '" style="text-decoration:none"><span class="mv-ico">' + ico(x[0]) + '</span><h3 class="gst-display-md" style="margin:0;font-size:1.7rem">' + x[1] + '</h3><p class="mv-muted" style="margin:0">' + x[2] + "</p></a>"; }).join("") + '</div><div class="mv-card mv-card--tint"><span class="gst-tag">ESPACE FAMILLE CONNECTÉ</span><p style="margin:0">Paiements, autorisation parentale signée en ligne, siège de votre enfant dans le bus.</p><div class="mv-row"><a class="gst-btn gst-btn--primary" href="#/login">Se connecter</a><button class="gst-btn gst-btn--ghost" data-demo-parent>Entrer en démo (Mawuena Akakpo)</button></div></div>');
  }, mount: function (el) { el.querySelector("[data-demo-parent]").onclick = function () { APP.loginAs("parent"); }; } });

  /* ══ Bus volant public ═════════════════════════════════════════════════ */
  APP.route("/site/bus", { title: "Bus volant", render: function (p) {
    var c = openCamp(), full = c.inscriptions.length >= c.places, hl = +(p.q.new || 0), ins = hl ? c.inscriptions.filter(function (i) { return i.siege === hl; })[0] : null;
    return (ins ? '<div class="gst-alert gst-alert--success"><svg class="gst-icon gst-alert__ico"><use href="#i-circle-check"/></svg><div><div class="gst-alert__title">Bienvenue à bord ! Siège ' + hl + " réservé pour " + esc(APP.pname(ins.person, true)) + '</div><div class="gst-alert__text">Votre code : <b class="mv-mono">' + code(c, ins) + '</b> — conservez-le pour suivre l\'inscription et le paiement (visible par vous seul). <a href="#/site/mon-inscription?c=' + code(c, ins) + '">Mon inscription</a></div></div><span></span></div>' : "") +
      sec(".05 / BUS VOLANT · " + esc(c.court.toUpperCase()), full ? "Le bus a décollé !" : "Chaque inscription, une place dans le ciel", full ? "" : '<a class="gst-btn gst-btn--eclair gst-btn--lg" href="#/site/inscription/' + c.id + '">' + ico("ticket") + "Réserver une place</a>",
        busFrame(c) + '<div class="mv-split"><div class="mv-card"><div class="mv-row mv-row--sb"><span class="gst-tag">PLAN DES SIÈGES · MÊMES PLACES, MÊMES NOMS QU\'EN 3D</span><span class="mv-mono">' + c.inscriptions.length + " / " + c.places + "</span></div>" + plan2d(c, "public", null, hl) + '</div><div class="mv-stack">' + APP.kpi("Participation", f(c.inscription), { unit: "F CFA", ico: "wallet", cls: "mv-kpi--brand", sub: full ? "Inscriptions fermées automatiquement" : "Payable en plusieurs fois · le bus décolle quand il est complet" }) + APP.card("Dignité", '<p class="mv-muted" style="margin:0">Le bus montre les prénoms et le nombre de places prises. Le statut de paiement n\'est visible que par la famille concernée et les responsables.</p>', { ico: "shield-check" }) + "</div></div>");
  }, mount: function (el, p) {
    var c = openCamp(), B = APP.mountBus3d(el, c, "public", null);
    if (B && p.q.new) B.pendingNew = +p.q.new;
    APP.bind(el, "click", "[data-seat]", function (b) { G.toast(b.getAttribute("aria-label"), { tag: ".05 / SIÈGE" }); });
  } });

  /* ══ Inscription en ligne (M5.2) ═══════════════════════════════════════ */
  APP.route("/site/inscription/:id", { title: "Inscription", render: function (p) {
    var c = APP.camp(p.id);
    if (!c.modules.inscription) return APP.empty("Inscriptions non ouvertes", "Ce camp n'a pas d'inscription publique.");
    if (c.inscriptions.length >= c.places) return sec(".05 / INSCRIPTION", esc(c.nom), "", APP.empty("Inscriptions fermées", "Le bus est complet : l'effectif maximum est atteint. Les inscriptions se sont fermées automatiquement.", '<a class="gst-btn gst-btn--secondary" href="#/site/bus">Voir le bus</a>'));
    var R = APP.calc(c);
    return sec(".05 / INSCRIPTION EN LIGNE", esc(c.nom), "", '<div class="mv-split"><form class="mv-card mv-form mv-form--2" data-ins><span class="gst-tag is-full">LE JEUNE</span>' + APP.field("Prénom", APP.input("in-pre", ""), { req: true }) + APP.field("Nom", APP.input("in-nom", ""), { req: true }) + APP.field("Date de naissance", APP.input("in-nai", "2012-06-15", { type: "date" }), { req: true }) + APP.field("Unité", APP.select("in-u", c.unites.map(function (u) { return [u, APP.unite(u).nom]; }), c.unites[0])) +
      APP.field("Allergies ou régime", APP.input("in-al", "", { ph: "ex. arachide, sans porc" }), { cls: "is-full", help: "Transmis uniquement à la responsable santé et à la cuisine (filtrage des plats)." }) +
      '<span class="gst-tag is-full">LE PARENT / TUTEUR</span>' + APP.field("Nom du parent", APP.input("in-par", ""), { req: true }) + APP.field("Téléphone", APP.input("in-tel", "", { ph: "+228 …" }), { req: true }) +
      '<div class="is-full mv-stack">' + APP.check("in-auto", false, "J'autorise mon enfant à participer au camp (autorisation parentale)") + APP.check("in-c", false, "J'accepte que le prénom et l'initiale du nom apparaissent dans le bus volant public") + '</div><button class="gst-btn gst-btn--eclair gst-btn--lg is-full" type="submit">' + ico("ticket") + "Réserver ma place dans le bus</button></form>" +
      '<div class="mv-stack"><div class="mv-card mv-card--brand"><span class="gst-tag">CE QUI SE PASSE QUAND VOUS VALIDEZ</span><ol style="margin:0;padding-left:18px;line-height:1.7"><li>La personne et l\'inscription sont créées</li><li>Un siège unique vous est attribué</li><li>L\'effectif du camp passe à ' + (APP.effectif(c) + 1) + " : eau, vivres et transport se recalculent</li><li>Vous recevez un code pour suivre le paiement</li></ol></div>" + APP.kpi("Participation", f(c.inscription), { unit: "F CFA", sub: "Payable en plusieurs fois" }) + APP.kpi("Places restantes", c.places - c.inscriptions.length, { ico: "bus" }) + "</div></div>");
  }, mount: function (el, p) {
    var c = APP.camp(p.id), f0 = el.querySelector("[data-ins]"); if (!f0) return;
    f0.onsubmit = function (e) {
      e.preventDefault(); var v = function (i) { return el.querySelector("#" + i).value.trim(); };
      if (!v("in-pre") || !v("in-nom") || !v("in-par") || !v("in-tel")) { G.toast("Merci de remplir les champs requis", { tag: ".05 / INSCRIPTION", tone: "danger" }); return; }
      if (!el.querySelector("#in-c").checked) { G.toast("L'affichage du prénom dans le bus doit être accepté", { tag: ".05 / INSCRIPTION", tone: "danger" }); return; }
      if (c.inscriptions.length >= c.places) { G.toast("Le bus vient d'être complété", { tag: ".05 / INSCRIPTION", tone: "danger" }); return; }
      var taken = {}; c.inscriptions.forEach(function (i) { taken[i.siege] = 1; });
      var seat = 1; while (taken[seat]) seat++;
      var B0 = APP.calc(c), eff0 = B0.eff, cost0 = B0.totalLive;
      var pid = APP.uid("p"), iid = APP.uid("ins");
      APP.commit("inscription", function (st) {
        st.personnes.push({ id: pid, prenom: v("in-pre"), nom: v("in-nom"), naissance: v("in-nai"), unite: v("in-u"), tel: "", urgence: v("in-par") + " · " + v("in-tel"), sanitaire: { allergies: v("in-al") ? v("in-al").split(/,\s*/) : [], traitements: "", antecedents: "" }, camps: [c.id] });
        c.inscriptions.push({ id: iid, person: pid, siege: seat, date: st.today, versements: [], docs: { auto: el.querySelector("#in-auto").checked, sanitaire: false, assurance: false }, web: true });
      }, { log: ["Inscription · " + c.court, "Nouvelle inscription (site public)", "", v("in-pre") + " " + v("in-nom")[0] + ". · siège " + seat], offline: false });
      var B1 = APP.calc(c);
      G.toast("Effectif " + eff0 + " → " + B1.eff + " · budget " + f(cost0) + " → " + f(B1.totalLive) + " F · eau +" + (B1.sachets - B0.sachets) + " sachets", { tag: ".05 → .01 / RECALCUL", tone: "success", duration: 6500 });
      APP.go("#/site/bus?new=" + seat);
    };
  } });

  /* ══ Mon inscription (code) ═════════════════════════════════════════════ */
  APP.route("/site/mon-inscription", { title: "Mon inscription", render: function (p) {
    var q = (p.q.c || "").toUpperCase(), found = null, fc = null;
    if (q) APP.state.camps.forEach(function (c) { c.inscriptions.forEach(function (i) { if (code(c, i) === q) { found = i; fc = c; } }); });
    var form = '<form class="mv-card mv-row" data-mi style="align-items:flex-end">' + APP.field("Code d'inscription", APP.input("mi-c", q, { ph: "GST-K26-…" }), { cls: "mv-grow" }) + '<button class="gst-btn gst-btn--primary" type="submit">Consulter</button></form>';
    return sec(".05 / MON INSCRIPTION", "Statut, montant payé, reste dû", "", form + (q && !found ? APP.empty("Code inconnu", "Vérifiez le code reçu à l'inscription.") : "") + (found ? APP.insCard(fc, found, "moi") : '<p class="mv-muted" style="margin:0">Vous êtes parent ? <a href="#/site/parents">Espace parents</a>.</p>'));
  }, mount: function (el) { el.querySelector("[data-mi]").onsubmit = function (e) { e.preventDefault(); APP.go("#/site/mon-inscription?c=" + encodeURIComponent(el.querySelector("#mi-c").value.trim())); }; } });
  APP.insCard = function (c, ins, mode) {
    var p = APP.person(ins.person), v = APP.versements(ins), st = APP.seatState(c, ins);
    return '<div class="mv-split"><div class="mv-card"><div class="mv-row" style="gap:14px"><span class="mv-seatbig s' + st + '">' + ins.siege + '</span><div><span class="gst-tag">' + esc(c.nom.toUpperCase()) + '</span><h3 class="gst-display-md" style="margin:4px 0 0;font-size:2rem">' + esc(p.prenom + " " + p.nom) + '</h3><span class="mv-mono">Code ' + code(c, ins) + "</span></div></div>" +
      '<div class="mv-g3" style="gap:8px">' + APP.kpi("Statut", STATES[st], { sub: st === 3 ? "Place garantie ⚜" : "Paiement attendu" }) + APP.kpi("Payé", f(v), { unit: "F" }) + APP.kpi("Reste dû", f(Math.max(0, c.inscription - v)), { unit: "F", subTone: "bad" }) + "</div>" +
      '<div class="mv-list">' + (ins.versements.map(function (x) { return '<div class="mv-li"><span class="mv-ico">' + ico("receipt") + '</span><div class="mv-li__m"><b>' + f(x.montant) + " F · " + esc(x.mode) + "</b><small>Reçu " + esc(x.recu) + " · " + APP.dshort(x.date) + "</small></div></div>"; }).join("") || '<p class="mv-muted" style="margin:0">Aucun versement pour le moment.</p>') + "</div>" +
      '<p class="mv-muted mv-small" style="margin:0">' + ico("lock", "gst-icon--sm") + " Ces informations ne sont visibles que par vous et les responsables du camp.</p></div>" +
      '<div class="mv-card"><span class="gst-tag">VOTRE SIÈGE DANS LE BUS</span>' + plan2d(c, "moi", ins.person) + "</div></div>";
  };

  /* ══ Bus interne (responsables) ════════════════════════════════════════ */
  APP.route("/app/bus", { title: "Bus volant & inscriptions", perm: "camps|entrees|famille", crumb: function () { return esc(APP.camp().court.toUpperCase()) + " / .05 BUS VOLANT"; }, render: function () {
    var c = APP.camp(), R = APP.calc(c), r = APP.role(), parent = r === "parent";
    if (!c.modules.bus) return APP.head(".05 / BUS VOLANT", "Bus volant", "") + APP.empty("Bus volant non activé", "Ce camp n'utilise pas le bus volant.");
    var mode = parent ? "moi" : "resp", me = parent ? APP.state.session.enfant : null;
    var counts = [0, 0, 0, 0]; c.inscriptions.forEach(function (i) { counts[APP.seatState(c, i)]++; });
    return APP.head(".05 / BUS VOLANT · " + esc(c.court.toUpperCase()), parent ? "Le siège de Sélom" : "Inscriptions & paiements", parent ? "Vous voyez l'état de paiement de votre enfant seulement. Les autres familles ne voient que les prénoms." : "Vue responsable : quatre états. Chaque siège rempli correspond à une entrée réelle en comptabilité.", parent ? "" : '<a class="gst-btn gst-btn--secondary" href="#/site/bus">' + ico("eye", "gst-icon--sm") + 'Vue publique</a><button class="gst-btn gst-btn--primary" data-sim-pay>' + ico("wallet", "gst-icon--sm") + "Simuler un paiement</button>") +
      (parent ? "" : '<div class="mv-g4">' + APP.kpi("Garantis", APP.num("bus-g", counts[3]), { ico: "shield-check", cls: "mv-kpi--brand" }) + APP.kpi("Partiels", APP.num("bus-p", counts[2]), { ico: "wallet" }) + APP.kpi("Réservés", APP.num("bus-r", counts[1]), { ico: "ticket" }) + APP.kpi("Libres", APP.num("bus-l", c.places - c.inscriptions.length), { ico: "bus" }) + "</div>") +
      busFrame(c) + APP.card("Plan des sièges", plan2d(c, mode, me), { ico: "bus", tag: parent ? "VUE FAMILLE" : "VUE RESPONSABLE · TOUCHEZ UN SIÈGE" });
  }, mount: function (el) {
    var c = APP.camp(), parent = APP.role() === "parent", B = APP.mountBus3d(el, c, parent ? "moi" : "resp", parent ? APP.state.session.enfant : null);
    APP.bind(el, "click", "[data-seat]", function (b) {
      var s = +b.dataset.seat, ins = c.inscriptions.filter(function (i) { return i.siege === s; })[0];
      if (!ins) { G.toast("Siège " + s + " libre", { tag: ".05 / SIÈGE" }); return; }
      if (parent) { G.toast(b.getAttribute("aria-label"), { tag: ".05 / SIÈGE" }); return; }
      if (APP.seatState(c, ins) < 3 && APP.can("entrees")) APP.payForm(c, ins); else G.toast(b.getAttribute("aria-label"), { tag: ".05 / SIÈGE" });
    });
    var sp = el.querySelector("[data-sim-pay]"); if (sp) sp.onclick = function () {
      var cand = c.inscriptions.filter(function (i) { return APP.seatState(c, i) < 3; }); if (!cand.length) { G.toast("Tous les sièges sont garantis", { tag: ".05 / BUS" }); return; }
      var ins = cand[(Math.random() * cand.length) | 0], reste = c.inscription - APP.versements(ins), mt = reste > 12500 ? 12500 : reste, before = APP.seatState(c, ins);
      APP.commit("simpay", function (st) { ins.versements.push({ id: APP.uid("v"), date: st.today, montant: mt, mode: "Mobile money", recu: "R-" + c.id.toUpperCase() + "-" + String(ins.siege).padStart(3, "0") + "-" + (ins.versements.length + 1) }); }, { log: ["Inscription · " + APP.pname(ins.person), "Versement", "", f(mt)], silent: true });
      var after = APP.seatState(c, ins);
      var seat = el.querySelector('[data-seat="' + ins.siege + '"]'); if (seat) { seat.className = "mv-seat s" + after + " new"; seat.title = seat.getAttribute("aria-label"); }
      if (B && B.scene) B.sync("pay", ins.siege);
      var counts = [0, 0, 0, 0]; c.inscriptions.forEach(function (i) { counts[APP.seatState(c, i)]++; });
      [["bus-g", 3], ["bus-p", 2], ["bus-r", 1]].forEach(function (x) { var n = el.querySelector('[data-num="' + x[0] + '"]'); if (n) G.odometer(n, counts[x[1]], {}); });
      G.toast("Siège " + ins.siege + " · " + STATES[before] + " → " + STATES[after] + " (" + f(mt) + " F)", { tag: ".02 → .05 / PAIEMENT", tone: "success" });
    };
  } });

  /* ══ Espace jeune (M3.2, M3.5) ═════════════════════════════════════════ */
  function allergic(p, me) { return me.sanitaire.allergies.some(function (a) { return p.all.indexOf(a.toLowerCase()) > -1; }); }
  APP.route("/app/jeune", { title: "Mon espace", perm: "jeune", crumb: "ESPACE JEUNE", render: function () {
    var me = APP.me(), k = APP.camp("k26"), r = APP.camp("r26"), ik = myIns(k, me.id), today = APP.campDay(r), prog = r.programme[today - 1];
    return '<section class="mv-hero"><div class="mv-hero__main"><span class="gst-tag">ESPACE JEUNE · ' + esc(APP.unite(me.unite).nom.toUpperCase()) + "</span><h2>Salut " + esc(me.prenom) + ' !</h2><p>Ton camp, tes repas, ta place dans le bus.</p><div class="mv-row"><a class="gst-btn gst-btn--eclair gst-btn--sm" href="#/app/jeune/repas">' + ico("utensils", "gst-icon--sm") + 'Mes repas</a><a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/app/roadmap">' + ico("route", "gst-icon--sm") + "Roadmap</a></div></div>" + '<div class="mv-hero__cd"><b>' + APP.jj(today) + "</b><span>" + esc(r.court) + "</span></div></section>" +
      '<div class="mv-g2">' + APP.card("Aujourd'hui au camp", prog ? '<b class="gst-display-md" style="font-size:1.8rem">' + esc(prog.titre) + '</b><div class="mv-list">' + prog.acts.map(function (a) { return '<div class="mv-li"><span class="mv-mono"><b>' + a.h + '</b></span><div class="mv-li__m"><b>' + esc(a.titre) + "</b></div></div>"; }).join("") + '</div><a class="gst-btn gst-btn--secondary gst-btn--sm" href="#/app/jeune/repas?c=r26">' + ico("vote", "gst-icon--sm") + "Voter pour le repas de demain</a>" : "Pas de camp aujourd'hui.", { ico: "calendar", tag: esc(r.court.toUpperCase()) }) +
      APP.card(esc(k.court), ik ? '<div class="mv-row" style="gap:14px"><span class="mv-seatbig s' + APP.seatState(k, ik) + '">' + ik.siege + '</span><div><b>Ton siège dans le bus</b><br><span class="mv-mono">' + STATES[APP.seatState(k, ik)] + " · reste " + f(Math.max(0, k.inscription - APP.versements(ik))) + ' F</span></div></div><div class="mv-row"><a class="gst-btn gst-btn--secondary gst-btn--sm" href="#/app/jeune/repas?c=k26">' + ico("chef-hat", "gst-icon--sm") + 'Choisir mes plats</a><a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/app/jeune/inscription">Mon inscription</a></div>' : '<a class="gst-btn gst-btn--primary" href="#/site/inscription/k26">S\'inscrire</a>', { ico: "bus", tag: APP.dshort(k.du) + " → " + APP.dshort(k.au) }) + "</div>";
  } });
  APP.route("/app/jeune/repas", { title: "Mes repas", perm: "jeune", crumb: "ESPACE JEUNE / REPAS", render: function (p) {
    var me = APP.me(), cid = p.q.c || (APP.camp().live ? APP.camp().id : "k26"), c = APP.camp(cid);
    var tabs = APP.tabs("jc", [["k26", "Choix · " + APP.camp("k26").court], ["r26", "Vote de demain · " + APP.camp("r26").court]], cid);
    var hidden = APP.state.plats.filter(function (x) { return allergic(x, me); }).length;
    var allergyNote = me.sanitaire.allergies.length ? '<div class="gst-alert"><svg class="gst-icon gst-alert__ico"><use href="#i-shield-check"/></svg><div><div class="gst-alert__title">Allergie déclarée : ' + esc(me.sanitaire.allergies.join(", ")) + '</div><div class="gst-alert__text">' + hidden + " plat(s) contenant ton allergène sont masqués, et ne te seront jamais proposés.</div></div><span></span></div>" : "";
    if (c.live) {
      var eff = APP.effectif(c), mv = c.live.monVote[me.id] || {};
      return APP.head("ESPACE JEUNE · VOTE", "Qu'est-ce qu'on mange demain ?", "Seuls les plats réalisables avec le stock de la cuisine sont proposés. Vote avant 21 h — même sans réseau.") + tabs + allergyNote +
        '<div class="mv-g3">' + [["matin", "Matin"], ["midi", "Midi"], ["soir", "Soir"]].map(function (s) { var opts = APP.state.plats.filter(function (x) { return (x.service === s[0] || (s[0] === "midi" && x.route)) && APP.feasible(c, x, eff) && !allergic(x, me); }); return APP.card(s[1], '<div class="mv-stack">' + (opts.map(function (x) { var on = mv[s[0]] === x.id; return '<button class="mv-votebtn' + (on ? " is-on" : "") + '" data-vote="' + s[0] + "|" + x.id + '"><b>' + esc(x.nom) + "</b>" + (on ? ico("check", "gst-icon--sm") : "") + "</button>"; }).join("") || '<p class="mv-muted">Aucun plat réalisable.</p>') + "</div>", { ico: "vote", tag: APP.jj(APP.campDay(c) + 1) }); }).join("") + "</div>";
    }
    var ch = c.menu.choix; if (!ch) return tabs + APP.empty("Pas de choix ouvert", "");
    var closed = APP.state.today > c.menu.cloture || c.menu.arrete, mine = ch.mes[me.id] || [];
    return APP.head("ESPACE JEUNE · CHOIX DU MENU", "Choisis tes plats", closed ? "Les choix sont clos depuis le " + APP.dshort(c.menu.cloture) + " : plus aucune modification n'est possible." : "Jusqu'au " + APP.dlong(c.menu.cloture) + ". Coche les plats que tu aimerais manger au camp, ou propose un plat oublié.", closed ? "" : '<button class="gst-btn gst-btn--secondary" data-propose>' + ico("message-circle", "gst-icon--sm") + "Proposer un plat</button>") + tabs + allergyNote +
      '<div class="mv-row">' + APP.kpi("Mes choix", mine.length, { ico: "check" }) + '<button class="gst-btn gst-btn--ghost" data-regime>' + ico("heart-pulse", "gst-icon--sm") + "Déclarer un régime ou une allergie</button></div>" +
      [["matin", "Matin"], ["midi", "Midi"], ["soir", "Soir"]].map(function (s) { var list = APP.state.plats.filter(function (x) { return x.service === s[0] && !allergic(x, me); }); return '<div class="mv-stack"><h3 class="gst-display-md" style="margin:0;font-size:1.8rem">' + s[1] + '</h3><div class="mv-plats">' + list.map(function (x) { var on = mine.indexOf(x.id) > -1; return APP.platCard(x, { on: on, href: "#", attrs: ' data-pick="' + x.id + '"' + (closed ? ' aria-disabled="true"' : ""), extra: '<span class="gst-btn ' + (on ? "gst-btn--brand" : "gst-btn--secondary") + ' gst-btn--sm">' + (on ? "Choisi ✓" : "Choisir") + "</span>" }); }).join("") + "</div></div>"; }).join("");
  }, mount: function (el, p) {
    var me = APP.me(), cid = p.q.c || (APP.camp().live ? APP.camp().id : "k26"), c = APP.camp(cid);
    var t = el.querySelector("[data-tabs=jc]"); if (t) t.addEventListener("gst-change", function (e) { APP.go("#/app/jeune/repas?c=" + e.detail.value); });
    APP.bind(el, "click", "[data-vote]", function (b) { var pr = b.dataset.vote.split("|"), L = c.live; APP.commit("vote", function () { L.monVote[me.id] = L.monVote[me.id] || {}; var old = L.monVote[me.id][pr[0]]; if (old) L.votes[pr[0]][old] = Math.max(0, (L.votes[pr[0]][old] || 1) - 1); L.monVote[me.id][pr[0]] = pr[1]; L.votes[pr[0]] = L.votes[pr[0]] || {}; L.votes[pr[0]][pr[1]] = (L.votes[pr[0]][pr[1]] || 0) + 1; }, { log: ["Vote live · " + pr[0], me.prenom, "", APP.plat(pr[1]).nom] }); G.toast("Vote enregistré" + (APP.state.online ? "" : " — en file hors ligne"), { tag: ".03 / VOTE", tone: "success" }); });
    APP.bind(el, "click", "[data-pick]", function (b, e) {
      e.preventDefault(); var ch = c.menu.choix; if (APP.state.today > c.menu.cloture || c.menu.arrete) { G.toast("Les choix sont clos", { tag: ".03 / CHOIX", tone: "danger" }); return; }
      var id = b.dataset.pick;
      APP.commit("pick", function () { var m = ch.mes[me.id]; if (!m) { m = ch.mes[me.id] = []; ch.votants++; } var k = m.indexOf(id); if (k > -1) { m.splice(k, 1); ch.selections[id] = Math.max(0, (ch.selections[id] || 1) - 1); } else { m.push(id); ch.selections[id] = (ch.selections[id] || 0) + 1; } });
    });
    var pr = el.querySelector("[data-propose]"); if (pr) pr.onclick = function () {
      var m = APP.modal('<span class="gst-tag">PROPOSER UN PLAT</span><h4 class="gst-display-md" style="margin:10px 0">Un plat que la cuisine a oublié ?</h4>' + APP.field("Nom du plat", APP.input("pp-n", "", { ph: "ex. Yassa poulet" })) + '<div class="mv-row" style="margin-top:14px"><button class="gst-btn gst-btn--primary" data-ok>Proposer</button><button class="gst-btn gst-btn--ghost" data-close>Annuler</button></div>');
      m.querySelector("[data-ok]").onclick = function () { var n = m.querySelector("#pp-n").value.trim(); if (!n) return; APP.closeDrawer(); var ch = c.menu.choix; APP.commit("prop", function () { var ex = ch.propositions.filter(function (x) { return x.texte.toLowerCase() === n.toLowerCase(); })[0]; if (ex) ex.n++; else { var pl = APP.state.plats.filter(function (x) { return x.nom.toLowerCase().indexOf(n.toLowerCase()) > -1; })[0]; ch.propositions.push({ texte: n, plat: pl ? pl.id : null, n: 1, statut: pl ? null : "en attente" }); } }, { log: ["Cuisine · propositions", me.prenom, "", n] }); G.toast("Proposition envoyée à l'intendance", { tag: ".03 / PROPOSITION", tone: "success" }); };
    };
    el.querySelector("[data-regime]") && (el.querySelector("[data-regime]").onclick = function () {
      var m = APP.modal('<span class="gst-tag">RÉGIME · ALLERGIE · INTERDIT</span><h4 class="gst-display-md" style="margin:10px 0">Ce que tu ne peux pas manger</h4>' + '<div class="mv-stack">' + ["arachide", "poisson", "lait", "gluten", "oeuf"].map(function (a) { return APP.check("rg-" + a, me.sanitaire.allergies.indexOf(a) > -1, a.charAt(0).toUpperCase() + a.slice(1)); }).join("") + APP.field("Régime ou interdit", APP.input("rg-r", me.sanitaire.regime || "", { ph: "ex. sans porc, végétarien" })) + '</div><p class="mv-muted mv-small">Visible uniquement par la responsable santé et la cuisine.</p><div class="mv-row"><button class="gst-btn gst-btn--primary" data-ok>Enregistrer</button><button class="gst-btn gst-btn--ghost" data-close>Annuler</button></div>');
      m.querySelector("[data-ok]").onclick = function () { var al = ["arachide", "poisson", "lait", "gluten", "oeuf"].filter(function (a) { return m.querySelector("#rg-" + a).checked; }), rg = m.querySelector("#rg-r").value; APP.closeDrawer(); APP.commit("regime", function () { me.sanitaire.allergies = al; me.sanitaire.regime = rg; }, { log: ["Fiche sanitaire · " + me.prenom, "Déclaration", "", al.join(", ") || "aucune"] }); G.toast("Déclaration enregistrée — les plats sont filtrés", { tag: ".03 / RÉGIME", tone: "success" }); };
    });
  } });
  APP.route("/app/jeune/inscription", { title: "Mon inscription", perm: "jeune", crumb: "ESPACE JEUNE / INSCRIPTION", render: function () {
    var me = APP.me(), html = APP.state.camps.map(function (c) { var i = myIns(c, me.id); return i ? APP.insCard(c, i) : ""; }).join("");
    return APP.head("ESPACE JEUNE", "Mes inscriptions", "Ton statut et tes paiements ne sont visibles que par toi, ta famille et les responsables.") + (html || APP.empty("Aucune inscription", "", '<a class="gst-btn gst-btn--primary" href="#/site/inscription/k26">S\'inscrire</a>'));
  } });

  /* ══ Espace famille ════════════════════════════════════════════════════ */
  APP.route("/app/famille", { title: "Espace famille", perm: "famille", crumb: "ESPACE FAMILLE", render: function () {
    var me = APP.me(), kid = APP.person(APP.state.session.enfant || "p-selom"), k = APP.camp("k26"), r = APP.camp("r26"), ik = myIns(k, kid.id), today = APP.campDay(r), prog = r.programme[today - 1];
    return '<section class="mv-hero"><div class="mv-hero__main"><span class="gst-tag">ESPACE FAMILLE</span><h2>Bonjour ' + esc(me.prenom) + '</h2><p>' + esc(kid.prenom) + " est inscrit·e à " + kid.camps.length + ' camp(s). Tout ce qui le concerne, au même endroit.</p></div><div class="mv-hero__cd"><b>' + APP.initials(kid) + "</b><span>" + esc(kid.prenom) + "</span></div></section>" +
      '<div class="mv-g2">' + APP.card(esc(r.court) + " · en ce moment", prog ? '<b class="gst-display-md" style="font-size:1.8rem">' + APP.jj(today) + " · " + esc(prog.titre) + '</b><p class="mv-muted" style="margin:0">' + esc(prog.lieu) + '</p><a class="gst-btn gst-btn--secondary gst-btn--sm" href="#/app/roadmap">' + ico("route", "gst-icon--sm") + "Suivre la roadmap</a>" : "", { ico: "route" }) +
      (ik ? APP.card(esc(k.court), '<div class="mv-row" style="gap:14px"><span class="mv-seatbig s' + APP.seatState(k, ik) + '">' + ik.siege + '</span><div><b>' + STATES[APP.seatState(k, ik)] + '</b><br><span class="mv-mono">Payé ' + f(APP.versements(ik)) + " / " + f(k.inscription) + ' F</span></div></div><div class="mv-row">' + (APP.seatState(k, ik) < 3 ? '<a class="gst-btn gst-btn--eclair gst-btn--sm" href="#/app/famille/paiement">' + ico("wallet", "gst-icon--sm") + "Payer le solde</a>" : "") + '<a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/app/bus">' + ico("bus", "gst-icon--sm") + "Voir le bus</a></div>" +
        '<div class="mv-li"><span class="mv-ico' + (ik.docs.auto ? "" : " mv-ico--red") + '">' + ico("file-text") + '</span><div class="mv-li__m"><b>Autorisation parentale</b><small>' + (ik.docs.auto ? "signée" : "à signer avant J-7") + "</small></div>" + (ik.docs.auto ? APP.badge("validé") : '<button class="gst-btn gst-btn--primary gst-btn--sm" data-sign-auto>Signer en ligne</button>') + "</div>", { ico: "ticket" }) : "") + "</div>" +
      APP.card("Équipement à prévoir", '<ol class="mv-equip">' + S.EQUIPEMENT.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ol>", { ico: "list" });
  }, mount: function (el) {
    var kid = APP.state.session.enfant || "p-selom", k = APP.camp("k26"), ik = myIns(k, kid);
    var s = el.querySelector("[data-sign-auto]"); if (s) s.onclick = function () { APP.commit("auto", function () { ik.docs.auto = true; }, { log: ["Documents · " + APP.pname(kid), "Autorisation parentale", "manquante", "signée en ligne"] }); G.toast("Autorisation parentale signée", { tag: ".01 / DOCUMENTS", tone: "success" }); };
  } });
  APP.route("/app/famille/paiement", { title: "Paiement", perm: "famille", crumb: "ESPACE FAMILLE / PAIEMENT", render: function () {
    var kid = APP.state.session.enfant || "p-selom", k = APP.camp("k26"), ik = myIns(k, kid);
    if (!ik) return APP.empty("Aucune inscription", "");
    var reste = Math.max(0, k.inscription - APP.versements(ik));
    return APP.head("ESPACE FAMILLE · PAIEMENT", "Participation — " + esc(k.court), "Payable en plusieurs fois. Chaque versement génère un reçu et met à jour le siège de votre enfant dans le bus.") +
      '<div class="mv-split">' + (reste ? '<form class="mv-card mv-stack" data-fp><div class="mv-g3" style="gap:8px">' + APP.kpi("Participation", f(k.inscription), { unit: "F" }) + APP.kpi("Déjà payé", f(APP.versements(ik)), { unit: "F" }) + APP.kpi("Reste dû", f(reste), { unit: "F", cls: "mv-kpi--brand" }) + "</div>" +
        APP.field("Montant", APP.input("fp-m", reste, { money: true })) + APP.field("Moyen de paiement", APP.seg("fp-mode", [["Mobile money", "Mobile money"], ["Espèces", "Espèces au local"]], "Mobile money", { sm: true })) + APP.field("Numéro Mobile money", APP.input("fp-tel", "+228 90 45 12 78")) +
        '<button class="gst-btn gst-btn--eclair gst-btn--lg gst-btn--block" type="submit">' + ico("wallet") + "Payer</button></form>" : APP.card("Tout est réglé", APP.empty("Place garantie ⚜", "La participation est entièrement payée. Merci !"), { ico: "shield-check" })) + APP.insCard(k, ik, "moi").replace('<div class="mv-split">', '<div class="mv-stack">') + "</div>";
  }, mount: function (el) {
    var kid = APP.state.session.enfant || "p-selom", k = APP.camp("k26"), ik = myIns(k, kid), fm = el.querySelector("[data-fp]"); if (!fm) return;
    fm.onsubmit = function (e) {
      e.preventDefault(); var mt = APP.money(el.querySelector("#fp-m").value), mode = el.querySelector("[data-seg=fp-mode] [aria-pressed=true]").dataset.value; if (!mt) return;
      var btn = fm.querySelector("button[type=submit]"); btn.disabled = true; btn.innerHTML = ico("refresh-cw") + "Confirmation sur votre téléphone…";
      setTimeout(function () {
        var before = APP.seatState(k, ik), recu = "R-K26-" + String(ik.siege).padStart(3, "0") + "-" + (ik.versements.length + 1);
        APP.commit("fpay", function (st) { ik.versements.push({ id: APP.uid("v"), date: st.today, montant: mt, mode: mode, recu: recu }); }, { log: ["Inscription · " + APP.pname(kid), "Versement (espace famille)", "", f(mt)] });
        G.toast("Paiement reçu · siège " + ik.siege + " : " + STATES[before] + " → " + STATES[APP.seatState(k, ik)], { tag: ".05 / BUS VOLANT", tone: "success" });
        APP.receipt(k, { recu: recu, nom: APP.pname(kid), montant: mt, date: APP.state.today, mode: mode, objet: "Participation — " + k.nom + " (siège " + ik.siege + ")" });
      }, 1100);
    };
  } });
})();
