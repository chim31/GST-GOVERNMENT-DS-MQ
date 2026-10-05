/* GST GOVERNMENT — MVP · Coquilles (application interne, site public) et rendu */
(function () {
  "use strict";
  var G = window.GST, APP = window.APP, S = window.GST_SEED;
  var ico = APP.ico, esc = APP.esc;

  /* ══ Navigation par rôle ═══════════════════════════════════════════════ */
  var NAV = [
    { s: "Pilotage", items: [
      ["#/app", "Tableau de bord", "layout-dashboard", "dash"], ["#/app/jeune", "Mon espace", "home", "jeune"], ["#/app/famille", "Espace famille", "home", "famille"],
      ["#/app/camps", "Camps", "tent", "camps"], ["#/app/notifications", "Alertes", "bell", "notifs"]] },
    { s: "Logistique", items: [
      ["#/app/logistique", "Groupes de gestion", "package", "logistique|logistique.B|logistique.eco"], ["#/app/inventaire", "Inventaire", "box", "inventaire"],
      ["#/app/fournisseurs", "Fournisseurs & devis", "file-text", "fournisseurs"], ["#/app/documents", "Documents", "shield-check", "documents"], ["#/app/logistique/H", "Retours", "rotate-ccw", "retours"]] },
    { s: "Comptabilité", items: [
      ["#/app/budget", "Budget prévisionnel", "calculator", "budget"], ["#/app/depenses", "Dépenses", "receipt", "depenses"], ["#/app/entrees", "Entrées & paiements", "wallet", "entrees"],
      ["#/app/courbes", "Courbes", "chart-line", "courbes"], ["#/app/jour", "Comptes du jour", "stamp", "jour"], ["#/app/avances", "Avances & caisse", "coins", "avances"], ["#/app/bilan", "Bilan de clôture", "file-text", "bilan"]] },
    { s: "Cuisine", items: [
      ["#/app/cuisine", "Catalogue de plats", "chef-hat", "cuisine"], ["#/app/cuisine/menu", "Choix & arrêt du menu", "vote", "cuisine"], ["#/app/cuisine/vivres", "Calcul des vivres", "calculator", "cuisine"],
      ["#/app/cuisine/live", "Suggestion live", "flame", "cuisine"], ["#/app/cuisine/gaspillage", "Gaspillage", "leaf", "cuisine"]] },
    { s: "Programme", items: [
      ["#/app/programme", "Construction du programme", "list", "programme.view"], ["#/app/roadmap", "Roadmap", "route", "roadmap"], ["#/app/agenda", "Agenda", "calendar", "agenda"]] },
    { s: "Public", items: [["#/app/bus", "Bus volant & inscriptions", "bus", "camps|entrees"]] },
    { s: "Socle", items: [
      ["#/app/annuaire", "Annuaire", "users", "annuaire|annuaire.unite|sanitaire"], ["#/app/prix", "Base de prix", "coins", "prix"], ["#/app/roles", "Rôles & accès", "lock", "roles"], ["#/app/journal", "Journal", "history", "journal"]] },
    { s: "Mémoire", items: [["#/app/references", "Base de références", "layers", "references"], ["#/app/hook", "Hook des prix", "lightbulb", "hook"]] }
  ];
  function allowed(perm) { var r = APP.role(); return perm.split("|").some(function (p) { if (p === "jeune") return r === "scout"; if (p === "famille") return r === "parent"; return APP.can(p); }); }
  APP.navItems = function () {
    return NAV.map(function (sec) { return { s: sec.s, items: sec.items.filter(function (it) { return allowed(it[3]); }) }; }).filter(function (s) { return s.items.length; });
  };
  var TABS = {
    chef: [["#/app", "Accueil", "home"], ["#/app/logistique", "Logist.", "package"], ["#/app/depenses", "Compta", "calculator"], ["#/app/cuisine/live", "Cuisine", "chef-hat"]],
    commissaire: [["#/app", "Accueil", "home"], ["#/app/logistique", "Groupes", "package"], ["#/app/inventaire", "Inventaire", "box"], ["#/app/documents", "Docs", "shield-check"]],
    respgroupe: [["#/app", "Accueil", "home"], ["#/app/logistique/B", "Mon groupe", "package"], ["#/app/inventaire", "Inventaire", "box"], ["#/app/roadmap", "Roadmap", "route"]],
    tresorier: [["#/app", "Accueil", "home"], ["#/app/depenses/nouvelle", "Saisir", "plus"], ["#/app/jour", "Jour", "stamp"], ["#/app/courbes", "Courbes", "chart-line"]],
    cuisine: [["#/app", "Accueil", "home"], ["#/app/cuisine/live", "Live", "flame"], ["#/app/cuisine/menu", "Menu", "vote"], ["#/app/cuisine", "Plats", "chef-hat"]],
    chefunite: [["#/app", "Accueil", "home"], ["#/app/agenda", "Agenda", "calendar"], ["#/app/roadmap", "Roadmap", "route"], ["#/app/annuaire", "Unité", "users"]],
    sante: [["#/app", "Accueil", "home"], ["#/app/logistique/D", "Santé", "heart-pulse"], ["#/app/annuaire", "Fiches", "users"], ["#/app/documents", "Docs", "shield-check"]],
    scout: [["#/app/jeune", "Accueil", "home"], ["#/app/jeune/repas", "Repas", "utensils"], ["#/app/roadmap", "Roadmap", "route"], ["#/app/jeune/inscription", "Inscription", "ticket"]],
    parent: [["#/app/famille", "Accueil", "home"], ["#/app/famille/paiement", "Paiement", "wallet"], ["#/app/roadmap", "Programme", "route"], ["#/app/bus", "Bus", "bus"]]
  };

  /* ══ Coquille application ══════════════════════════════════════════════ */
  function campsVisibles() {
    var st = APP.state, s = st.session, r = APP.role();
    if (r === "scout" || r === "parent") {
      var pid = r === "parent" ? (s.enfant || "p-selom") : s.person;
      return st.camps.filter(function (c) { return c.inscriptions.some(function (i) { return i.person === pid; }); });
    }
    return st.camps;
  }
  APP.campsVisibles = campsVisibles;
  function countdown(c) {
    var d = APP.campDay(c), j = APP.jours(c);
    if (c.statut === "clos") return { big: "CLOS", small: APP.ddm(c.du) + " → " + APP.ddm(c.au) };
    if (d < 1) return { big: "J" + (d - 1), small: APP.ddm(c.du) + " → " + APP.ddm(c.au) };
    if (d > j) return { big: "J+" + (d - j), small: "terminé" };
    return { big: APP.jj(d), small: "sur " + j + " jours" };
  }
  APP.countdown = countdown;

  function syncPill() {
    var st = APP.state, q = st.queue.length;
    if (!st.online) return '<button class="gst-sync is-offline mv-sync" data-net title="Basculer le réseau (démo)"><span class="gst-sync__dot"></span><span class="gst-sync__label">HORS LIGNE' + (q ? " · " + q + " EN FILE" : "") + "</span></button>";
    return '<button class="gst-sync mv-sync" data-net title="Basculer le réseau (démo)"><span class="gst-sync__dot"></span><span class="gst-sync__label">SYNCHRONISÉ</span></button>';
  }

  function sideNav(path) {
    return APP.navItems().map(function (sec) {
      return '<div class="mv-nav__lab">' + sec.s + "</div>" + sec.items.map(function (it) {
        var cur = path === it[0].slice(1) || (it[0] !== "#/app" && path.indexOf(it[0].slice(1) + "/") === 0 && !(it[0] === "#/app/logistique" && path === "/app/logistique/H"));
        var badge = it[0] === "#/app/notifications" ? (function () { var n = APP.alertsFor(APP.camp()).length; return n ? '<span class="n">' + n + "</span>" : ""; })() : "";
        return '<a href="' + it[0] + '"' + (cur ? ' aria-current="page"' : "") + ">" + ico(it[2], "gst-icon--sm") + "<span>" + it[1] + "</span>" + badge + "</a>";
      }).join("");
    }).join("");
  }

  function appShell(inner, def, path) {
    var st = APP.state, s = st.session, me = APP.me(), c = APP.camp(), cd = countdown(c), R = APP.role();
    var camps = campsVisibles();
    var tabs = (TABS[R] || TABS.chef).map(function (t) {
      var cur = path === t[0].slice(1) || (t[0] !== "#/app" && t[0] !== "#/app/jeune" && t[0] !== "#/app/famille" && path.indexOf(t[0].slice(1)) === 0);
      return '<a href="' + t[0] + '"' + (cur ? ' aria-current="page"' : "") + ">" + ico(t[2]) + "<span>" + t[1] + "</span></a>";
    }).join("") + '<button type="button" data-more>' + ico("menu") + "<span>Plus</span></button>";
    return '<div class="mv-app">' +
      '<aside class="mv-side" aria-label="Navigation principale">' +
        '<a class="mv-brand" href="' + (R === "scout" ? "#/app/jeune" : R === "parent" ? "#/app/famille" : "#/app") + '">' + APP.logo() + "<div><b>GST GOVERNMENT</b><span>Poste de commandement</span></div></a>" +
        '<button class="mv-campsw" data-campsw aria-haspopup="true"><span class="cnt">' + cd.big + "</span><div><b>" + esc(c.court) + "</b><small>" + esc(c.lieu.toUpperCase()) + " · " + APP.effectif(c) + "</small></div>" + ico("chevron-down", "gst-icon--sm") + "</button>" +
        '<nav class="mv-nav">' + sideNav(path) + "</nav>" +
        '<button class="mv-user" data-user>' + '<span class="gst-avatar">' + APP.initials(me) + "</span><div><b>" + esc(me ? me.prenom + " " + me.nom : "") + "</b><small>" + esc(S.ROLES[R].nom) + "</small></div>" + ico("chevron-down", "gst-icon--sm") + "</button>" +
      "</aside>" +
      '<div class="mv-main">' +
        '<header class="mv-head">' +
          '<button class="mv-mcamp" data-campsw><span class="cnt">' + cd.big + "</span><span><b>" + esc(c.court) + "</b><small>" + esc(cd.small.toUpperCase()) + "</small></span>" + ico("chevron-down", "gst-icon--sm") + "</button>" +
          '<div class="mv-head__t">' + (def.crumb ? '<span class="gst-tag">' + def.crumb + "</span>" : "") + "<h1>" + esc(def.titleText || "") + "</h1></div>" +
          '<div class="mv-head__r">' + syncPill() +
            '<a class="gst-icon-btn gst-icon-btn--ghost mv-bell" href="#/app/notifications" aria-label="Alertes">' + ico("bell") + (APP.alertsFor(c).length ? "<i></i>" : "") + "</a>" +
            '<a class="gst-btn gst-btn--ghost gst-btn--sm mv-sitelink" href="#/site">' + ico("arrow-up-right", "gst-icon--sm") + "Site public</a>" +
            '<button class="mv-ava" data-user aria-label="Compte"><span class="gst-avatar">' + APP.initials(me) + "</span></button>" +
          "</div>" +
        "</header>" +
        (!st.online ? '<div class="mv-offbar">' + ico("wifi-off", "gst-icon--sm") + "<span>Hors ligne — vos saisies sont enregistrées sur l'appareil et partiront au retour du réseau.</span></div>" : "") +
        '<main class="mv-body" id="main">' + inner + "</main>" +
      "</div>" +
      '<nav class="mv-tabs gst-glass" aria-label="Navigation rapide">' + tabs + "</nav>" +
    "</div>";
  }

  /* Menus contextuels : camp, compte, plus */
  function popMenu(anchor, html, cls) {
    closePop();
    var m = document.createElement("div"); m.className = "mv-pop " + (cls || ""); m.innerHTML = html; document.body.appendChild(m);
    var r = anchor.getBoundingClientRect(), mw = Math.min(320, innerWidth - 24);
    m.style.width = mw + "px";
    var left = Math.min(innerWidth - mw - 12, Math.max(12, r.left));
    var top = r.bottom + 8; if (top + 360 > innerHeight && r.top > 380) top = Math.max(12, r.top - m.offsetHeight - 8);
    m.style.left = left + "px"; m.style.top = top + "px";
    G.anim(m, [{ opacity: 0, transform: "translateY(-6px) scale(.98)" }, { opacity: 1, transform: "none" }], { duration: 180, easing: G.ease("tonnerre") });
    setTimeout(function () { document.addEventListener("click", outside, true); }, 0);
    function outside(e) { if (!m.contains(e.target)) { closePop(); } }
    m._off = function () { document.removeEventListener("click", outside, true); };
    return m;
  }
  function closePop() { document.querySelectorAll(".mv-pop").forEach(function (m) { m._off && m._off(); m.remove(); }); }
  APP.closePop = closePop;

  function campMenu(anchor) {
    var cur = APP.state.camp;
    var html = '<span class="gst-tag">CAMPS</span>' + campsVisibles().map(function (c) {
      var cd = countdown(c), T = S.TYPES[c.type];
      return '<button class="mv-pop__camp' + (c.id === cur ? " is-on" : "") + '" data-pick-camp="' + c.id + '"><span class="gst-camp-type"><b>' + T.l + "</b></span><span><b>" + esc(c.court) + "</b><small>" + esc(c.statut.toUpperCase()) + " · " + cd.big + "</small></span>" + (c.id === cur ? ico("check", "gst-icon--sm") : "") + "</button>";
    }).join("") + (APP.can("camps") && APP.role() === "chef" ? '<a class="gst-btn gst-btn--secondary gst-btn--sm gst-btn--block" href="#/app/camps/nouveau">' + ico("plus", "gst-icon--sm") + "Ouvrir un camp</a>" : "");
    var m = popMenu(anchor, html);
    m.querySelectorAll("[data-pick-camp]").forEach(function (b) {
      b.onclick = function () { closePop(); APP.state.camp = b.dataset.pickCamp; APP.save(); APP.render(true); G.toast(APP.camp().nom, { tag: ".00 / CAMP" }); };
    });
  }
  function userMenu(anchor) {
    var me = APP.me(), R = APP.role();
    var html = '<div class="mv-pop__me"><span class="gst-avatar">' + APP.initials(me) + "</span><div><b>" + esc(me.prenom + " " + me.nom) + "</b><small>" + esc(S.ROLES[R].nom) + "</small></div></div>" +
      '<span class="gst-tag">DÉMO · VOIR EN TANT QUE</span><div class="mv-pop__roles">' + APP.state.comptes.map(function (a) {
        return '<button data-as="' + a.role + '"' + (a.role === R ? ' aria-pressed="true"' : "") + '><span class="gst-avatar">' + APP.initials(APP.person(a.person)) + "</span>" + esc(S.ROLES[a.role].nom) + "</button>";
      }).join("") + "</div>" +
      '<div class="mv-pop__acts"><a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/site">' + ico("arrow-up-right", "gst-icon--sm") + "Site public</a>" +
      '<button class="gst-btn gst-btn--ghost gst-btn--sm" data-theme-cycle>' + ico("sun-medium", "gst-icon--sm") + "Jour · Nuit · Soleil</button>" +
      '<button class="gst-btn gst-btn--ghost gst-btn--sm" data-reset>' + ico("refresh-cw", "gst-icon--sm") + "Réinitialiser la démo</button>" +
      '<button class="gst-btn gst-btn--secondary gst-btn--sm" data-logout>' + ico("log-out", "gst-icon--sm") + "Se déconnecter</button></div>";
    var m = popMenu(anchor, html, "mv-pop--user");
    m.querySelectorAll("[data-as]").forEach(function (b) { b.onclick = function () { closePop(); APP.loginAs(b.dataset.as); }; });
    m.querySelector("[data-logout]").onclick = function () { closePop(); APP.state.session = null; APP.save(); APP.go("#/login"); };
    m.querySelector("[data-reset]").onclick = function () { closePop(); APP.confirm("Réinitialiser la démo ?", "Toutes vos saisies seront effacées et les données de démonstration rechargées.", "Réinitialiser").then(function (ok) { if (ok) { var s = APP.state.session; APP.reset(); APP.state.session = s; APP.save(); APP.render(true); G.toast("Démo réinitialisée", { tag: ".00 / DÉMO" }); } }); };
    m.querySelector("[data-theme-cycle]").onclick = function () { APP.cycleTheme(); };
  }
  function moreSheet() {
    var html = '<div class="mv-sheet__grab"></div><nav class="mv-sheet__nav">' + APP.navItems().map(function (sec) {
      return '<div class="mv-nav__lab">' + sec.s + "</div><div class=\"mv-sheet__grid\">" + sec.items.map(function (it) { return '<a href="' + it[0] + '">' + ico(it[2]) + "<span>" + it[1] + "</span></a>"; }).join("") + "</div>";
    }).join("") + '</nav><div class="mv-sheet__foot"><button class="gst-btn gst-btn--secondary gst-btn--sm" data-user2>' + ico("user", "gst-icon--sm") + 'Compte & rôles</button><a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/site">' + ico("arrow-up-right", "gst-icon--sm") + "Site public</a></div>";
    var d = APP.drawer("", html, { bottom: true, cls: "mv-sheet" });
    d.querySelector("[data-user2]").onclick = function (e) { APP.closeDrawer(); userMenu(document.querySelector(".mv-ava") || e.target); };
    d.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { APP.closeDrawer(); }); });
  }

  APP.cycleTheme = function () {
    var r = document.documentElement, cur = r.getAttribute("data-theme") || "jour", order = ["jour", "nuit", "soleil"], nx = order[(order.indexOf(cur) + 1) % 3];
    if (nx === "jour") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", nx);
    try { localStorage.setItem("gst-theme", nx); } catch (e) {}
    G.toast("Mode " + { jour: "Jour", nuit: "Nuit", soleil: "Plein soleil" }[nx], { tag: ".00 / AFFICHAGE" });
  };

  APP.loginAs = function (role) {
    var a = APP.state.comptes.filter(function (x) { return x.role === role; })[0];
    APP.state.session = { role: role, person: a.person, groupe: a.groupe, unite: a.unite, enfant: a.enfant };
    if (role === "scout" || role === "parent") {
      var cs = campsVisibles(); if (cs.length && !cs.some(function (c) { return c.id === APP.state.camp; })) APP.state.camp = cs[0].id;
      if (role === "parent" || role === "scout") APP.state.camp = "k26";
    }
    APP.save();
    var home = role === "scout" ? "#/app/jeune" : role === "parent" ? "#/app/famille" : "#/app";
    G.toast("Connecté·e : " + APP.pname(a.person) + " — " + S.ROLES[role].nom, { tag: ".00 / SESSION", tone: "success" });
    APP.go(home);
  };

  /* ══ Coquille site public ══════════════════════════════════════════════ */
  function siteShell(inner, path) {
    var links = [["#/site", "Accueil"], ["#/site/groupe", "Le groupe"], ["#/site/unites", "Unités"], ["#/site/activites", "Activités"], ["#/site/galerie", "Galerie"], ["#/site/actus", "Actualités"], ["#/site/bilans", "Bilans"], ["#/site/bus", "Bus volant"]];
    var nav = links.map(function (l) { var cur = path === l[0].slice(1) || (l[0] !== "#/site" && path.indexOf(l[0].slice(1)) === 0); return '<a href="' + l[0] + '"' + (cur ? ' aria-current="page"' : "") + ">" + l[1] + "</a>"; }).join("");
    var s = APP.state.session;
    return '<div class="mv-site">' +
      '<header class="mv-site__head gst-glass"><a class="mv-site__brand" href="#/site">' + APP.logo() + "<span><b>GROUPE SCOUT TONNERRE</b><small>DISTRICT GOLFE · AST</small></span></a>" +
        '<nav class="mv-site__nav" aria-label="Site">' + nav + "</nav>" +
        '<div class="mv-site__r"><a class="gst-btn gst-btn--brand gst-btn--sm" href="#/site/rejoindre">Rejoindre</a>' +
        '<a class="gst-btn gst-btn--secondary gst-btn--sm" href="' + (s ? (APP.role() === "parent" ? "#/app/famille" : APP.role() === "scout" ? "#/app/jeune" : "#/app") : "#/login") + '">' + ico("lock", "gst-icon--sm") + (s ? "Mon espace" : "Espace membres") + "</a>" +
        '<button class="gst-icon-btn gst-icon-btn--ghost mv-site__burger" data-site-menu aria-label="Menu">' + ico("menu") + "</button></div></header>" +
      '<main id="main" class="mv-site__main">' + inner + "</main>" +
      '<footer class="mv-site__foot"><div class="mv-site__fcols"><div>' + APP.logo() + "<p><b>Groupe Scout Tonnerre</b><br>District Golfe · Association Scoute du Togo · depuis 2013</p></div>" +
        "<div><span class=\"gst-tag\">LE GROUPE</span><a href=\"#/site/groupe\">Histoire & valeurs</a><a href=\"#/site/unites\">Unités</a><a href=\"#/site/activites\">Calendrier</a></div>" +
        "<div><span class=\"gst-tag\">TRANSPARENCE</span><a href=\"#/site/bilans\">Bilans de retour</a><a href=\"#/site/bus\">Bus volant</a><a href=\"#/site/actus\">Actualités</a></div>" +
        "<div><span class=\"gst-tag\">FAMILLES</span><a href=\"#/site/parents\">Espace parents</a><a href=\"#/site/mon-inscription\">Mon inscription</a><a href=\"#/site/rejoindre\">Contact & adhésion</a></div></div>" +
        '<p class="mv-site__legal">@associationscoutedutogo · @groupesscouttonnerre — Aucune donnée nominative sensible n\'est publiée sur ce site.</p></footer>' +
    "</div>";
  }

  APP.logo = function () {
    return '<svg class="mv-logo" viewBox="0 -18 120 78" aria-hidden="true"><path d="M2 58 L20 41 L27 45 L40 27 L48 33 L61 9 L68 19 L75 15 L90 35 L98 31 L118 58 Z" fill="currentColor" opacity=".18"/><path d="M2 58 L20 41 L27 45 L40 27 L48 33 L61 9 L68 19 L75 15 L90 35 L98 31 L118 58" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M80 -16 L68 1 L74 2 L62 10" fill="none" stroke="#FFD23F" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  };

  /* ══ Rendu ═════════════════════════════════════════════════════════════ */
  var lastPath = null, nums = {};
  APP.render = function (forceAnim) {
    var raw = location.hash.slice(1) || "/site", qi = raw.indexOf("?"), path = qi > -1 ? raw.slice(0, qi) : raw;
    var query = {}; if (qi > -1) raw.slice(qi + 1).split("&").forEach(function (kv) { var p = kv.split("="); query[p[0]] = decodeURIComponent(p[1] || ""); });
    if (path === "/" || path === "") path = "/site";
    var m = APP.match(path), root = document.getElementById("app");
    closePop();
    if (!m) { m = APP.match("/404"); }
    var def = m.r.def, params = m.params; params.q = query;
    var shell = def.shell || (path.indexOf("/app") === 0 ? "app" : path.indexOf("/site") === 0 ? "site" : "bare");
    if (shell === "app" && !APP.state.session) { APP.state.redirect = "#" + raw; location.replace("#/login"); return; }
    var denied = shell === "app" && def.perm && !allowed(def.perm);
    var focusId = document.activeElement && document.activeElement.id, sameRoute = lastPath === raw, sy = scrollY;
    var titleText = typeof def.title === "function" ? def.title(params) : def.title;
    var dd = { crumb: typeof def.crumb === "function" ? def.crumb(params) : def.crumb, titleText: titleText };
    var inner;
    try { inner = denied ? APP.views.denied(def) : def.render(params); }
    catch (e) { console.error(e); inner = '<div class="gst-empty"><span class="gst-fleur">⚜</span><h4 class="gst-empty__title">Écran indisponible</h4><p class="gst-empty__text">' + esc(e.message) + "</p></div>"; }
    root.innerHTML = shell === "app" ? appShell(inner, dd, path) : shell === "site" ? siteShell(inner, path) : inner;
    document.title = (titleText ? titleText + " — " : "") + "GST Government";
    // Câblage commun
    root.querySelectorAll("[data-campsw]").forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); campMenu(b); }; });
    root.querySelectorAll("[data-user]").forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); userMenu(b); }; });
    root.querySelectorAll("[data-more]").forEach(function (b) { b.onclick = moreSheet; });
    root.querySelectorAll("[data-net]").forEach(function (b) { b.onclick = APP.toggleNet; });
    root.querySelectorAll("[data-site-menu]").forEach(function (b) { b.onclick = function () { root.querySelector(".mv-site").classList.toggle("is-menu"); }; });
    G.wireTabs(root);
    try { if (!denied && def.mount) def.mount(root.querySelector("#main"), params); } catch (e) { console.error(e); }
    // Chiffres qui roulent (M4) : data-num="clé" data-v="valeur"
    root.querySelectorAll("[data-num]").forEach(function (el) {
      var k = el.getAttribute("data-num"), v = +el.getAttribute("data-v");
      if (sameRoute && nums[k] != null && nums[k] !== v) { G.odometer(el, nums[k], { instant: true }); G.odometer(el, v, { tone: el.hasAttribute("data-num-tone") ? (v > nums[k] ? "bad" : "good") : null }); }
      nums[k] = v;
    });
    if (sameRoute) { scrollTo(0, sy); if (focusId) { var f = document.getElementById(focusId); if (f) { f.focus({ preventScroll: true }); } } }
    else {
      scrollTo(0, 0);
      var main = root.querySelector("#main");
      if (main && !G.reduced()) {
        var kids = main.querySelectorAll(":scope > *");
        Array.prototype.slice.call(kids, 0, 8).forEach(function (k, i) { G.anim(k, [{ opacity: 0, transform: "translateY(12px)", filter: "blur(4px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }], { duration: 420, delay: i * 45, easing: G.ease("tonnerre") }); });
      }
      root.querySelectorAll("[data-decode]").forEach(function (t) { G.decode(t); });
    }
    lastPath = raw;
  };
  var pending = false;
  APP.on(function () { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; APP.render(); }); });

  APP.toggleNet = function () {
    var st = APP.state;
    if (st.online) { APP.setOnline(false); G.toast("Réseau coupé — mode hors ligne", { tag: ".00 / HORS LIGNE" }); return; }
    var q = st.queue.length;
    st.online = true;
    if (q) {
      G.toast(q + " saisie(s) synchronisée(s)", { tag: ".00 / SYNCHRONISATION", tone: "success" });
      st.queue = [];
    } else G.toast("Réseau rétabli", { tag: ".00 / EN LIGNE", tone: "success" });
    APP.save(); APP.render();
    var pill = document.querySelector(".mv-sync"); if (pill) G.pop(pill, 0);
  };

  /* ══ Composants d'interface réutilisables ══════════════════════════════ */
  APP.num = function (key, v, tone) { return '<span data-num="' + key + '" data-v="' + Math.round(v) + '"' + (tone ? " data-num-tone" : "") + ">" + G.fmt(v) + "</span>"; };
  APP.head = function (tag, title, lead, actions) {
    return '<div class="mv-ph"><div class="mv-ph__t"><span class="gst-tag gst-tag--accent" data-decode>' + tag + "</span><h2>" + title + "</h2>" + (lead ? "<p>" + lead + "</p>" : "") + "</div>" + (actions ? '<div class="mv-ph__a">' + actions + "</div>" : "") + "</div>";
  };
  APP.card = function (title, body, o) {
    o = o || {};
    return '<section class="mv-card' + (o.cls ? " " + o.cls : "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + ">" + (title ? '<div class="mv-card__h">' + (o.ico ? '<span class="mv-ico' + (o.tone ? " mv-ico--" + o.tone : "") + '">' + ico(o.ico) + "</span>" : "") + "<div>" + (o.tag ? '<span class="gst-tag">' + o.tag + "</span>" : "") + "<h3>" + title + "</h3></div>" + (o.act ? '<div class="mv-card__a">' + o.act + "</div>" : "") + "</div>" : "") + body + "</section>";
  };
  APP.kpi = function (label, value, o) {
    o = o || {};
    return '<div class="mv-kpi' + (o.cls ? " " + o.cls : "") + '">' + (o.ico ? '<span class="mv-ico' + (o.tone ? " mv-ico--" + o.tone : "") + '">' + ico(o.ico) + "</span>" : "") + '<span class="gst-label">' + label + '</span><b class="mv-kpi__v">' + value + (o.unit ? "<small>" + o.unit + "</small>" : "") + "</b>" + (o.sub ? '<span class="mv-kpi__s' + (o.subTone ? " is-" + o.subTone : "") + '">' + o.sub + "</span>" : "") + "</div>";
  };
  APP.badge = function (statut) {
    var map = { "validé": "success", "approuvé": "success", "consolidé": "brand", "soumis": "info", "en cours": "warning", "à venir": "", "fermé": "", "brouillon": "", "publié": "success", "clos": "ink", "préparation": "info", "suggestion": "warning", "rejeté": "danger", "ouverte": "warning", "justifiée": "success" };
    return '<span class="gst-badge' + (map[statut] ? " gst-badge--" + map[statut] : "") + '">' + esc(statut) + "</span>";
  };
  APP.empty = function (title, text, action) { return '<div class="gst-empty"><span class="gst-fleur">⚜</span><h4 class="gst-empty__title">' + title + '</h4><p class="gst-empty__text">' + text + "</p>" + (action || "") + "</div>"; };
  APP.alertHtml = function (a) {
    var tone = a.niv === "critical" ? "critical" : a.niv === "warning" ? "warning" : a.niv === "success" ? "success" : "";
    var ic = a.niv === "critical" ? "triangle-alert" : a.niv === "warning" ? "triangle-alert" : "info";
    return '<a class="gst-alert' + (tone ? " gst-alert--" + tone : "") + ' mv-alert" href="' + (a.href || "#") + '">' + ico(ic, "gst-alert__ico") + '<div><div class="gst-alert__title">' + a.t + '</div><div class="gst-alert__text">' + a.x + "</div></div>" + ico("chevron-right", "gst-icon--sm") + "</a>";
  };
  APP.gauge = function (label, val, max, o) {
    o = o || {};
    var p = max ? Math.min(100, (val / max) * 100) : 0, over = val > max;
    return '<div class="gst-gauge' + (over ? " is-over" : "") + '"><div class="gst-gauge__row"><span class="gst-label">' + label + "</span><span>" + G.fmt(val) + " / " + G.fmt(max) + '</span></div><div class="gst-gauge__bar"><i class="gst-gauge__fill" style="width:' + p + "%" + (over ? ";background:var(--gst-state-danger)" : "") + '"></i><i class="gst-gauge__mark" style="left:100%"></i></div><div class="gst-gauge__row"><span style="color:' + (over ? "var(--gst-state-danger-text)" : "var(--gst-state-success-text)") + '">' + (over ? "Dépassement " + G.fmt(val - max) : "Reste " + G.fmt(max - val)) + "</span><span>" + Math.round(max ? (val / max) * 100 : 0) + " %</span></div></div>";
  };
  APP.field = function (label, control, o) {
    o = o || {};
    return '<div class="gst-field' + (o.cls ? " " + o.cls : "") + '"><label class="gst-field__label"' + (o.for ? ' for="' + o.for + '"' : "") + "><span>" + label + "</span>" + (o.req ? '<span class="gst-field__req">requis</span>' : "") + "</label>" + control + (o.help ? '<span class="gst-field__help">' + o.help + "</span>" : "") + "</div>";
  };
  APP.input = function (id, v, o) { o = o || {}; return '<div class="gst-control' + (o.money ? " gst-control--money" : "") + '">' + (o.ico ? ico(o.ico, "gst-icon--sm") : "") + '<input id="' + id + '" name="' + id + '" value="' + esc(v == null ? "" : v) + '"' + (o.type ? ' type="' + o.type + '"' : "") + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : "") + (o.attrs || "") + ">" + (o.money ? "<span>F CFA</span>" : "") + "</div>"; };
  APP.select = function (id, opts, v, o) { o = o || {}; return '<div class="gst-control"><select id="' + id + '" name="' + id + '"' + (o.attrs || "") + ">" + (o.ph ? '<option value="">' + esc(o.ph) + "</option>" : "") + opts.map(function (x) { var val = Array.isArray(x) ? x[0] : x, lab = Array.isArray(x) ? x[1] : x; return '<option value="' + esc(val) + '"' + (String(val) === String(v) ? " selected" : "") + ">" + esc(lab) + "</option>"; }).join("") + "</select>" + ico("chevron-down", "gst-icon--sm gst-control__chev") + "</div>"; };
  APP.seg = function (name, opts, v, o) { o = o || {}; return '<div class="gst-seg' + (o.sm ? " gst-seg--sm" : "") + '" role="group" data-seg="' + name + '">' + opts.map(function (x) { return '<button type="button" data-value="' + esc(x[0]) + '" aria-pressed="' + (String(x[0]) === String(v)) + '">' + x[1] + "</button>"; }).join("") + "</div>"; };
  APP.toggle = function (id, on, label) { return '<label class="gst-toggle"><input type="checkbox" id="' + id + '"' + (on ? " checked" : "") + '><span class="gst-toggle__track"></span><span class="gst-ui">' + label + "</span></label>"; };
  APP.check = function (id, on, label, o) { o = o || {}; return '<label class="gst-check"><input type="checkbox" id="' + id + '"' + (on ? " checked" : "") + (o.attrs || "") + '><span class="gst-check__box"><svg viewBox="0 0 14 14"><path d="M2 7.5 L5.5 11 L12 3"/></svg></span>' + label + "</label>"; };
  APP.tabs = function (name, opts, v) { return '<div class="gst-tabs mv-tabsbar" data-tabs="' + name + '">' + opts.map(function (x) { return '<button type="button" data-value="' + x[0] + '" aria-selected="' + (x[0] === v) + '">' + x[1] + "</button>"; }).join("") + "</div>"; };
  APP.val = function (root, id) { var el = root.querySelector("#" + id); return el ? (el.type === "checkbox" ? el.checked : el.value) : null; };
  APP.money = function (s) { return Math.round(+String(s).replace(/[^\d.,-]/g, "").replace(",", ".") || 0); };

  /* Délégation d'événements */
  APP.bind = function (root, type, sel, fn) { root.addEventListener(type, function (e) { var t = e.target.closest(sel); if (t && root.contains(t)) fn(t, e); }); };

  /* Tiroir (droite ou bas) */
  APP.drawer = function (title, html, o) {
    o = o || {};
    APP.closeDrawer(true);
    var scrim = document.createElement("div"); scrim.className = "gst-scrim is-open mv-scrim";
    var d = document.createElement("aside"); d.className = "gst-drawer " + (o.bottom ? "gst-drawer--bottom" : "gst-drawer--right") + " is-open mv-drawer " + (o.cls || ""); d.setAttribute("aria-hidden", "false");
    d.setAttribute("role", "dialog"); d.setAttribute("aria-label", title || "Panneau");
    d.innerHTML = (title !== "" ? '<div class="gst-drawer__head"><span class="gst-tag">' + title + '</span><button class="gst-icon-btn gst-icon-btn--ghost" data-close aria-label="Fermer">' + ico("x") + "</button></div>" : "") + '<div class="gst-drawer__body">' + html + "</div>";
    document.body.appendChild(scrim); document.body.appendChild(d);
    scrim.onclick = APP.closeDrawer;
    d.querySelectorAll("[data-close]").forEach(function (b) { b.onclick = APP.closeDrawer; });
    var f = d.querySelector("button, a, input"); f && f.focus({ preventScroll: true });
    document.addEventListener("keydown", escClose);
    G.wireTabs(d);
    return d;
  };
  function escClose(e) { if (e.key === "Escape") { APP.closeDrawer(); } }
  APP.closeDrawer = function (instant) {
    document.removeEventListener("keydown", escClose);
    document.querySelectorAll(".mv-drawer, .mv-scrim, .mv-modal").forEach(function (n) {
      if (instant === true) { n.remove(); return; }
      n.classList.remove("is-open"); setTimeout(function () { n.remove(); }, 260);
    });
  };
  /* Modale */
  APP.modal = function (html, o) {
    o = o || {};
    APP.closeDrawer(true);
    var m = document.createElement("div"); m.className = "gst-modal is-open mv-modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-hidden", "false");
    m.innerHTML = '<div class="gst-modal__box' + (o.wide ? " mv-modal--wide" : "") + '">' + html + "</div>";
    document.body.appendChild(m);
    m.addEventListener("click", function (e) { if (e.target === m && !o.locked) APP.closeDrawer(); });
    m.querySelectorAll("[data-close]").forEach(function (b) { b.onclick = APP.closeDrawer; });
    document.addEventListener("keydown", escClose);
    var f = m.querySelector("input, select, textarea, button"); f && f.focus({ preventScroll: true });
    G.wireTabs(m);
    return m;
  };
  APP.confirm = function (title, text, okLabel, o) {
    o = o || {};
    return new Promise(function (res) {
      var m = APP.modal('<span class="gst-tag ' + (o.danger ? "gst-tag--accent" : "") + '">' + (o.tag || "CONFIRMATION") + '</span><h4 class="gst-display-md" style="margin:12px 0">' + title + '</h4><p style="margin:0 0 20px;color:var(--gst-text-secondary)">' + text + '</p><div class="mv-row"><button class="gst-btn ' + (o.danger ? "gst-btn--danger" : o.eclair ? "gst-btn--eclair" : "gst-btn--primary") + '" data-ok>' + (okLabel || "Confirmer") + '</button><button class="gst-btn gst-btn--ghost" data-no>Annuler</button></div>');
      m.querySelector("[data-ok]").onclick = function () { APP.closeDrawer(); res(true); };
      m.querySelector("[data-no]").onclick = function () { APP.closeDrawer(); res(false); };
    });
  };
  APP.toast = function (msg, tag, tone) { G.toast(msg, { tag: tag || ".00 / INFO", tone: tone }); };

  /* Impression d'un bloc (A4) */
  APP.print = function (title, html) {
    var w = document.getElementById("mv-print"); if (!w) { w = document.createElement("div"); w.id = "mv-print"; document.body.appendChild(w); }
    w.innerHTML = '<div class="mv-print__head">' + APP.logo() + "<div><b>GST GOVERNMENT</b><span>" + esc(title) + " · édité le " + APP.dshort(APP.state.today) + "</span></div></div>" + html;
    document.body.classList.add("is-printing");
    setTimeout(function () { window.print(); setTimeout(function () { document.body.classList.remove("is-printing"); }, 300); }, 60);
  };
  /* Export CSV (lisible sans la plateforme — ENF-09) */
  APP.csv = function (name, rows) {
    var s = rows.map(function (r) { return r.map(function (c) { c = String(c == null ? "" : c); return /[;"\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(";"); }).join("\n");
    var blob = new Blob(["﻿" + s], { type: "text/csv;charset=utf-8" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name + ".csv"; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    G.toast("Export « " + name + ".csv » prêt", { tag: ".00 / EXPORT", tone: "success" });
  };
})();
