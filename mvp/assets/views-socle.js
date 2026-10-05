/* GST GOVERNMENT — MVP · Socle (P0) : connexion, tableaux de bord, camps, annuaire, prix, journal, rôles */
(function () {
  "use strict";
  var G = window.GST, APP = window.APP, S = window.GST_SEED;
  var ico = APP.ico, esc = APP.esc, f = APP.f, cfa = APP.cfa;

  APP.ring = function (p, label) {
    var r = 30, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, p)));
    return '<div class="mv-ring"><svg viewBox="0 0 72 72"><circle class="bg" cx="36" cy="36" r="' + r + '"/><circle class="fg" cx="36" cy="36" r="' + r + '" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/></svg><b>' + (label != null ? label : Math.round(p * 100) + "%") + "</b></div>";
  };
  APP.spark = function (arr) {
    var v = arr.filter(function (x) { return x != null; }); if (v.length < 2) return "";
    var max = Math.max.apply(null, v) || 1, W = 200, H = 40;
    var pts = v.map(function (x, i) { return [(i / (v.length - 1)) * W, H - (x / max) * (H - 4) - 2]; });
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    return '<svg class="mv-spark" viewBox="0 0 200 40" preserveAspectRatio="none" style="width:100%;height:40px;overflow:visible"><path d="' + d + ' L200 40 L0 40 Z" fill="var(--gst-brand)" opacity=".1"/><path d="' + d + '" fill="none" stroke="var(--gst-brand)" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
  };
  var heroArt = '<svg class="mv-hero__art" viewBox="0 -18 120 78" aria-hidden="true"><path d="M2 58 L20 41 L27 45 L40 27 L48 33 L61 9 L68 19 L75 15 L90 35 L98 31 L118 58 Z" fill="rgba(255,255,255,.08)"/><path d="M2 58 L20 41 L27 45 L40 27 L48 33 L61 9 L68 19 L75 15 L90 35 L98 31 L118 58" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.2" stroke-linejoin="round"/><path d="M80 -16 L68 1 L74 2 L62 10" fill="none" stroke="#FFD23F" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>';

  /* ══ Connexion ═════════════════════════════════════════════════════════ */
  APP.route("/login", { shell: "bare", title: "Connexion", render: function () {
    var roles = APP.state.comptes.map(function (a) {
      var p = APP.person(a.person);
      return '<button data-as="' + a.role + '"><span class="gst-avatar">' + APP.initials(p) + "</span><span><b>" + esc(S.ROLES[a.role].nom) + "</b><small>" + esc(p.prenom + " " + p.nom) + "</small></span></button>";
    }).join("");
    return '<div class="mv-login"><div class="mv-login__art"><a href="#/site" class="mv-row" style="text-decoration:none;color:inherit">' + APP.logo() + '<span class="gst-tag" style="color:rgba(244,244,242,.75)">GROUPE SCOUT TONNERRE</span></a>' +
      '<div><span class="gst-tag" style="color:rgba(244,244,242,.75)" data-decode>.00 / POSTE DE COMMANDEMENT</span><h1>GST<br>GOVERNMENT</h1><p>Préparer, financer, nourrir, suivre et raconter chaque camp — une seule plateforme, une seule vérité.</p></div>' +
      '<svg class="big" viewBox="0 -18 120 78" aria-hidden="true"><path d="M2 58 L20 41 L27 45 L40 27 L48 33 L61 9 L68 19 L75 15 L90 35 L98 31 L118 58" fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="round"/><path d="M80 -16 L68 1 L74 2 L62 10" fill="none" stroke="#FFD23F" stroke-width="2" stroke-linejoin="round"/></svg>' +
      '<span class="gst-tag" style="color:rgba(244,244,242,.6)">DISTRICT GOLFE · AST · DEPUIS 2013</span></div>' +
      '<div class="mv-login__form"><div><span class="gst-tag gst-tag--accent">CONNEXION</span><h2 class="gst-display-md" style="margin:8px 0 0">Bon retour au camp</h2></div>' +
      '<form class="mv-form" data-login>' + APP.field("Identifiant", APP.input("lg-id", "codjo.agossou", { ico: "user", attrs: ' autocomplete="username"' }), { for: "lg-id" }) +
      APP.field("Mot de passe", APP.input("lg-pw", "tonnerre", { type: "password", ico: "lock", attrs: ' autocomplete="current-password"' }), { for: "lg-pw", help: '<a href="#/login/oubli">Mot de passe oublié ?</a>' }) +
      '<button class="gst-btn gst-btn--primary gst-btn--lg gst-btn--block" type="submit">Se connecter' + ico("arrow-right", "gst-icon--sm") + "</button></form>" +
      '<div class="gst-divider gst-divider--center"><span class="gst-tag">OU ENTRER EN DÉMO AVEC UN RÔLE</span></div><div class="mv-roles">' + roles + "</div>" +
      '<p class="mv-muted mv-small" style="margin:0">Le public n\'a pas besoin de compte : <a href="#/site">site vitrine</a>, <a href="#/site/bus">bus volant</a> et <a href="#/site/bilans">bilans de retour</a> sont en lecture libre.</p></div></div>';
  }, mount: function (el) {
    var root = document.getElementById("app");
    root.querySelectorAll("[data-as]").forEach(function (b) { b.onclick = function () { APP.loginAs(b.dataset.as); }; });
    root.querySelector("[data-login]").onsubmit = function (e) {
      e.preventDefault();
      var id = root.querySelector("#lg-id").value.trim().toLowerCase(), a = APP.state.comptes.filter(function (x) { return x.login === id; })[0];
      if (!a) { G.toast("Identifiant inconnu — essayez un rôle de démo", { tag: ".00 / CONNEXION", tone: "danger" }); return; }
      APP.loginAs(a.role);
    };
  } });
  APP.route("/login/oubli", { shell: "bare", title: "Mot de passe oublié", render: function () {
    return '<div class="mv-login"><div class="mv-login__art"><a href="#/login" class="mv-row" style="text-decoration:none;color:inherit">' + APP.logo() + '</a><div><h1>Mot de passe<br>oublié</h1><p>Un lien de réinitialisation vous sera envoyé par SMS ou par e-mail.</p></div><span></span></div>' +
      '<div class="mv-login__form"><form class="mv-form" data-forgot>' + APP.field("Identifiant, e-mail ou téléphone", APP.input("fg-id", "", { ico: "user", ph: "ex. komi.ayite ou +228 90 …" }), { for: "fg-id" }) +
      '<button class="gst-btn gst-btn--primary gst-btn--lg gst-btn--block" type="submit">Envoyer le lien</button><a class="gst-btn gst-btn--ghost" href="#/login">' + ico("chevron-left", "gst-icon--sm") + "Retour à la connexion</a></form></div></div>";
  }, mount: function () {
    document.querySelector("[data-forgot]").onsubmit = function (e) { e.preventDefault(); G.toast("Lien envoyé — valable 30 minutes", { tag: ".00 / RÉCUPÉRATION", tone: "success" }); setTimeout(function () { APP.go("#/login"); }, 900); };
  } });

  APP.views.denied = function (def) {
    return '<div class="mv-card" style="max-width:680px;margin:6vh auto;align-items:center;text-align:center;padding:40px 28px"><span class="mv-ico mv-ico--red" style="width:64px;height:64px;border-radius:20px">' + ico("lock", "gst-icon--lg") + '</span><span class="gst-tag gst-tag--accent">.00 / ACCÈS REFUSÉ</span><h2 class="gst-display-md" style="margin:0">Cet écran n\'est pas pour votre rôle</h2>' +
      '<p class="mv-muted" style="margin:0;max-width:52ch">Vous êtes connecté·e en tant que <b>' + esc(S.ROLES[APP.role()].nom) + "</b>. « " + esc(typeof def.title === "function" ? "" : def.title) + " » est cloisonné : les droits sont attribués par personne et par camp, et les données sensibles (comptabilité, fiches sanitaires, paiements) restent réservées aux rôles habilités.</p>" +
      '<div class="mv-row" style="justify-content:center"><a class="gst-btn gst-btn--primary" href="' + (APP.role() === "scout" ? "#/app/jeune" : APP.role() === "parent" ? "#/app/famille" : "#/app") + '">Retour à mon accueil</a><button class="gst-btn gst-btn--ghost" data-user>Changer de rôle (démo)</button></div></div>';
  };
  APP.route("/404", { shell: "bare", title: "Introuvable", render: function () { return '<div class="mv-login" style="place-items:center;display:grid"><div class="mv-card" style="max-width:520px;text-align:center;align-items:center"><span class="gst-tag gst-tag--accent">.404</span><h2 class="gst-display-md" style="margin:0">Ce sentier n\'existe pas</h2><a class="gst-btn gst-btn--primary" href="#/site">Revenir au camp</a></div></div>'; } });

  /* ══ Tableau de bord (M0.5) ════════════════════════════════════════════ */
  function groupsStrip(c, R) {
    return '<div class="mv-grid">' + "ABCDEFGHIJ".split("").map(function (L) {
      var g = c.groupes[L], meta = S.GROUPES[L], cg = R.groupes[L];
      var val = L === "F" ? R.totalLive : cg ? cg.cost : 0;
      return '<a class="mv-grp' + (g.open ? "" : " is-off") + (meta.pivot ? " is-pivot" : "") + '" href="#/app/logistique/' + L + '"><div class="mv-grp__top"><span class="mv-grp__l">' + L + "</span><div><h4>" + meta.nom + "</h4><small>" + (g.resp ? esc(APP.pname(g.resp, true)) : "Sans responsable") + "</small></div></div>" +
        (g.open ? '<div class="mv-row mv-row--sb"><span class="mv-grp__v">' + (L === "H" ? "—" : f(val) + "<small> F</small>") + "</span>" + APP.badge(g.statut) + "</div>" : '<span class="gst-badge">fermé pour ce type</span>') + "</a>";
    }).join("") + "</div>";
  }
  function jalons(R) {
    var now = R.jalons.filter(function (j) { return !j.done; })[0];
    return '<div class="mv-steps">' + R.jalons.map(function (j) { return '<div class="mv-step' + (j.done ? " is-done" : "") + (j === now ? " is-now" : "") + '" title="' + esc(j.t) + '"><b>' + j.k + "</b><span>" + APP.ddm(j.date) + "</span></div>"; }).join("") + "</div>" +
      (now ? '<p class="mv-muted mv-small" style="margin:0"><b>Prochain jalon · ' + now.k + " (" + APP.dlong(now.date) + ")</b> — " + esc(now.t) + "</p>" : '<p class="mv-muted mv-small" style="margin:0">Tous les jalons sont passés.</p>');
  }
  function hero(c, R, extra) {
    var cd = APP.countdown(c), T = S.TYPES[c.type];
    return '<section class="mv-hero">' + heroArt + '<div class="mv-hero__main"><span class="gst-tag">' + T.nom.toUpperCase() + " · " + esc(c.lieu.toUpperCase()) + "</span><h2>" + esc(c.nom) + "</h2><p>" + APP.dlong(c.du) + " → " + APP.dlong(c.au) + " · " + APP.effectif(c) + " personnes (" + c.inscriptions.length + " jeunes + " + c.encadrement.length + " encadrants)</p>" + (extra || "") + "</div>" +
      '<div class="mv-hero__cd"><b>' + cd.big + "</b><span>" + cd.small + "</span></div></section>";
  }

  APP.route("/app", { title: "Tableau de bord", crumb: function () { return esc(APP.camp().court.toUpperCase()) + " / ACCUEIL"; }, perm: "dash", render: function () {
    var c = APP.camp(), R = APP.calc(c), r = APP.role(), me = APP.me();
    var alerts = APP.alertsFor(c);
    var alertBox = alerts.length ? APP.card("Alertes", '<div class="mv-stack">' + alerts.slice(0, 5).map(APP.alertHtml).join("") + "</div>" + (alerts.length > 5 ? '<a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/app/notifications">Voir les ' + alerts.length + " alertes</a>" : ""), { ico: "bell", tone: "red", tag: alerts.length + " EN COURS" })
      : APP.card("Alertes", APP.empty("Rien à signaler", "Aucun seuil franchi, aucune validation en attente pour votre rôle."), { ico: "bell" });
    var hello = '<div class="mv-ph"><div class="mv-ph__t"><span class="gst-tag gst-tag--accent" data-decode>.00 / ' + esc(S.ROLES[r].nom.toUpperCase()) + "</span><h2>Bonjour " + esc(me.prenom) + "</h2><p>" + APP.dday(APP.state.today) + " — " + esc(c.court) + (c.statut === "en cours" ? ", " + APP.jj(APP.campDay(c)) + " du camp." : ".") + "</p></div></div>";
    var spent = R.totalReel, today = APP.campDay(c);
    if (r === "tresorier") {
      var todayDep = c.depenses.filter(function (d) { return d.jour === Math.max(0, today); });
      return hello + '<div class="mv-g4">' +
        APP.kpi("Dépensé aujourd'hui", APP.num("t-today", todayDep.reduce(function (s, d) { return s + d.montant; }, 0)), { unit: "F CFA", ico: "receipt", sub: todayDep.length + " mouvement(s) · " + APP.jj(today) }) +
        APP.kpi("Dépensé au total", APP.num("t-spent", spent), { unit: "F CFA", ico: "wallet", sub: APP.pct(spent, R.total) + " de la version A", cls: "mv-kpi--brand" }) +
        APP.kpi("Encaissé", APP.num("t-enc", R.encaisse), { unit: "F CFA", ico: "coins", sub: R.impayes.length + " participation(s) incomplète(s)" }) +
        APP.kpi("Signatures en attente", R.attente.length, { ico: "stamp", tone: R.attente.length ? "red" : "", sub: "Au-delà de " + cfa(c.seuilDouble) }) + "</div>" +
        '<div class="mv-split">' + APP.card("Enveloppes par poste", '<div class="mv-stack">' + S.POSTES.map(function (p) { return APP.gauge(p.nom, R.reel[p.id], R.postes[p.id] || 0); }).join("") + "</div>", { ico: "calculator", tag: "VERSION A — RÉFÉRENCE", act: '<a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/app/courbes">Courbes</a>' }) +
        '<div class="mv-stack">' + APP.card("Saisie rapide", '<p class="mv-muted" style="margin:0">Montant, poste, activité, photo du reçu : moins d\'une minute, même hors ligne.</p><a class="gst-btn gst-btn--primary gst-btn--lg gst-btn--block" href="#/app/depenses/nouvelle">' + ico("plus") + 'Saisir une dépense</a><a class="gst-btn gst-btn--secondary gst-btn--block" href="#/app/jour">' + ico("stamp", "gst-icon--sm") + "Comptes du jour</a>", { ico: "receipt", tone: "yel" }) + alertBox + "</div></div>";
    }
    if (r === "cuisine") {
      var row = c.menu && c.menu.jours ? c.menu.jours[Math.max(0, Math.min(c.menu.jours.length, today) - 1)] : null, k26 = APP.camp("k26");
      return hello + (row ? APP.card("Menu du jour · " + APP.jj(today), '<div class="mv-g3">' + ["Matin", "Midi", "Soir"].map(function (s, i) { var p = APP.plat(row[i]); return '<div class="mv-card mv-card--tint"><span class="gst-tag">' + s.toUpperCase() + '</span><b class="gst-display-md" style="font-size:1.6rem">' + (row[i] === "off" ? "Sans cuisine" : esc(p ? p.nom : "—")) + "</b></div>"; }).join("") + "</div>", { ico: "chef-hat", act: '<a class="gst-btn gst-btn--primary gst-btn--sm" href="#/app/cuisine/live">Suggestion live</a>' }) : "") +
        '<div class="mv-split">' + APP.card("Choix du menu · " + esc(k26.court), '<p class="mv-muted" style="margin:0">' + k26.menu.choix.votants + " jeunes ont choisi leurs plats. Clôture le " + APP.dlong(k26.menu.cloture) + ".</p>" + '<div class="mv-row"><a class="gst-btn gst-btn--secondary" href="#/app/cuisine/menu">Voir les taux & arrêter le menu</a></div>', { ico: "vote" }) + alertBox + "</div>";
    }
    if (r === "chefunite") {
      var s = APP.state.session, u = APP.unite(s.unite), jeunes = c.inscriptions.filter(function (i) { var p = APP.person(i.person); return p && p.unite === s.unite; });
      var prog = c.programme[Math.max(0, today - 1)];
      return hello + '<div class="mv-g3">' + APP.kpi("Effectif de l'unité", jeunes.length, { ico: "users", sub: esc(u.nom) }) + APP.kpi("Allergies déclarées", jeunes.filter(function (i) { return APP.person(i.person).sanitaire.allergies.length; }).length, { ico: "heart-pulse", sub: "Détail réservé à la santé" }) + APP.kpi("Matériel affecté", APP.state.inventaire.filter(function (it) { return it.det === "p-yao"; }).length + " lots", { ico: "box" }) + "</div>" +
        (prog ? APP.card("Programme du jour · " + APP.jj(prog.j) + " — " + esc(prog.titre), '<div class="mv-list">' + prog.acts.map(function (a) { return '<div class="mv-li"><span class="mv-mono">' + a.h + '</span><div class="mv-li__m"><b>' + esc(a.titre) + "</b><small>" + esc(a.lieu) + "</small></div></div>"; }).join("") + "</div>", { ico: "calendar", act: '<a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/app/agenda?u=' + s.unite + '">Agenda de l\'unité</a>' }) : "") +
        APP.card("Mon unité", '<div class="mv-list">' + jeunes.slice(0, 8).map(function (i) { var p = APP.person(i.person); return '<a class="mv-li" href="#/app/personne/' + p.id + '"><span class="gst-avatar">' + APP.initials(p) + '</span><div class="mv-li__m"><b>' + esc(p.prenom + " " + p.nom) + "</b><small>Siège " + i.siege + "</small></div></a>"; }).join("") + "</div>", { ico: "users", act: '<a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/app/annuaire">Tout voir</a>' });
    }
    if (r === "respgroupe") {
      var L = APP.state.session.groupe, g = c.groupes[L], cg = R.groupes[L];
      return hello + hero(c, R) + '<div class="mv-split">' + APP.card("Mon groupe · " + L + " — " + S.GROUPES[L].nom, '<div class="mv-g3">' + APP.kpi("Coût du manquant", APP.num("rg-cost", cg.cost), { unit: "F CFA" }) + APP.kpi("Lignes", cg.lignes) + APP.kpi("Statut", APP.badge(g.statut)) + "</div>" +
        (L === "B" ? '<div class="gst-alert"><svg class="gst-icon gst-alert__ico"><use href="#i-droplet"/></svg><div><div class="gst-alert__title">Eau potable : ' + f(R.sachets) + ' sachets</div><div class="gst-alert__text">' + R.eff + " personnes × " + R.jours + " jours × 6 sachets (2 matin, 2 midi, 2 soir).</div></div><span></span></div>" : "") +
        '<a class="gst-btn gst-btn--primary" href="#/app/logistique/' + L + '">Ouvrir le recensement' + ico("arrow-right", "gst-icon--sm") + "</a>", { ico: S.GROUPES[L].ico }) + alertBox + "</div>";
    }
    if (r === "sante") {
      var D = R.groupes.D, al = c.inscriptions.map(function (i) { return APP.person(i.person); }).filter(function (p) { return p && (p.sanitaire.allergies.length || p.sanitaire.traitements); });
      return hello + hero(c, R) + '<div class="mv-split">' + APP.card("Groupe Santé", '<div class="mv-g3">' + APP.kpi("Responsable", c.groupes.D.respSante ? esc(APP.pname(c.groupes.D.respSante, true)) : '<span class="gst-accent">Aucun</span>') + APP.kpi("Lignes pharmacie", D.lignes) + APP.kpi("Fiches à surveiller", al.length) + "</div>" + '<div class="mv-row"><a class="gst-btn gst-btn--primary" href="#/app/logistique/D">Pharmacie & seuils</a><a class="gst-btn gst-btn--secondary" href="#/app/annuaire?f=sanitaire">Fiches sanitaires</a></div>', { ico: "heart-pulse", tone: "red" }) + alertBox + "</div>";
    }
    // Chef de groupe & commissaire
    var done = "ABCDEGIJ".split("").filter(function (L) { return c.groupes[L].open && c.groupes[L].statut === "validé"; }).length, open = "ABCDEGIJ".split("").filter(function (L) { return c.groupes[L].open; }).length;
    var kpis = '<div class="mv-g4">' +
      APP.kpi(R.versionA ? "Budget · version A" : "Budget consolidé", APP.num("d-bud", R.versionA ? R.total : R.totalLive), { unit: "F CFA", ico: "calculator", cls: "mv-kpi--brand", sub: R.versionA ? "Live : " + f(R.totalLive) + " F" : "Recalcul continu" }) +
      APP.kpi("Dépensé", APP.num("d-spent", spent), { unit: "F CFA", ico: "receipt", sub: APP.pct(spent, R.total || R.totalLive) + " du prévu", subTone: spent > R.total ? "bad" : "" }) +
      APP.kpi("Encaissé", APP.num("d-enc", R.encaisse), { unit: "F CFA", ico: "wallet", sub: R.impayes.length + " participation(s) incomplète(s)" }) +
      APP.kpi(c.modules.bus ? "Bus volant" : "Effectif", c.modules.bus ? APP.num("d-seats", c.inscriptions.length) + "<small>/ " + c.places + "</small>" : APP.effectif(c), { ico: "bus", sub: c.modules.bus ? (c.places - c.inscriptions.length) + " place(s) restante(s)" : "" }) + "</div>";
    var avancement = APP.card("Avancement des recensements", '<div class="mv-row" style="gap:18px">' + APP.ring(open ? done / open : 0, done + "/" + open) + '<p class="mv-muted" style="margin:0;flex:1;min-width:200px">' + done + " groupe(s) validé(s) sur " + open + " ouverts. Le groupe Économique consolide en continu : chaque ligne modifiée met le budget à jour.</p></div>" + groupsStrip(c, R), { ico: "package", act: '<a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/app/logistique">Logistique</a>' });
    var courbe = c.depenses.length ? APP.card("Prévu contre réel", '<div id="dash-chart"></div><div class="gst-legend"><span><i class="l-planned"></i>Prévu</span><span><i class="l-actual"></i>Réel</span></div>', { ico: "chart-line", act: '<a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/app/courbes">Détail</a>' }) : "";
    return hello + hero(c, R, '<div class="mv-row"><a class="gst-btn gst-btn--eclair gst-btn--sm" href="#/app/camps/' + c.id + '">' + ico("tent", "gst-icon--sm") + 'Fiche du camp</a><a class="gst-btn gst-btn--ghost gst-btn--sm" href="#/app/roadmap">' + ico("route", "gst-icon--sm") + "Roadmap</a></div>") + kpis +
      '<div class="mv-split"><div class="mv-stack">' + (courbe || "") + APP.card("Rétroplanning", jalons(R), { ico: "calendar" }) + "</div><div class=\"mv-stack\">" + alertBox + (r === "chef" ? APP.card("Actions rapides", '<div class="mv-grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">' +
        [["#/app/camps/nouveau", "Ouvrir un camp", "plus"], ["#/app/budget", "Valider le budget", "stamp"], ["#/app/bus", "Inscriptions", "ticket"], ["#/app/journal", "Journal", "history"]].map(function (q) { return '<a class="mv-card mv-card--tint" href="' + q[0] + '" style="padding:14px;text-decoration:none;gap:8px"><span class="mv-ico">' + ico(q[2]) + '</span><b class="mv-mono">' + q[1] + "</b></a>"; }).join("") + "</div>", { ico: "zap", tone: "yel" }) : "") + "</div></div>" + avancement;
  }, mount: function (el) {
    var c = APP.camp(), R = APP.calc(c), host = el.querySelector("#dash-chart");
    if (host) G.chartLine(host, { labels: R.courbe.labels, planned: R.courbe.prevu.map(function (v) { return Math.round(v / 1000); }), actual: R.courbe.reel.filter(function (v) { return v != null; }).map(function (v) { return Math.round(v / 1000); }).concat([]), unit: "k F CFA · cumul", every: 2, onPoint: function (i) { APP.go("#/app/courbes?p=" + i); } });
  } });

  /* ══ Alertes ═══════════════════════════════════════════════════════════ */
  APP.route("/app/notifications", { title: "Alertes", perm: "notifs", crumb: "SOCLE / NOTIFICATIONS", render: function () {
    var html = APP.campsVisibles().map(function (c) {
      var A = APP.role() === "scout" || APP.role() === "parent" ? [] : APP.alertsFor(c);
      return APP.card(esc(c.nom), A.length ? '<div class="mv-stack">' + A.map(APP.alertHtml).join("") + "</div>" : APP.empty("Aucune alerte", "Tout est sous contrôle sur ce camp pour votre rôle."), { ico: "tent", tag: c.statut.toUpperCase() });
    }).join("");
    return APP.head(".00 / ALERTES", "Alertes & validations", "Seuils critiques, jalons dépassés, validations en attente — calculés en continu, filtrés selon votre rôle.") + html;
  } });

  /* ══ Camps (M0.3) ══════════════════════════════════════════════════════ */
  APP.route("/app/camps", { title: "Camps", perm: "camps", crumb: "SOCLE / CAMPS", render: function () {
    var cards = APP.state.camps.map(function (c) {
      var cd = APP.countdown(c), T = S.TYPES[c.type], R = APP.calc(c);
      var groups = "ABCDEFGHIJ".split("").map(function (L) { var g = c.groupes[L]; return "<i" + (g.statut === "validé" || g.statut === "consolidé" || g.statut === "publié" ? ' class="is-done"' : g.open && g.statut !== "à venir" ? ' class="is-current"' : "") + "></i>"; }).join("");
      return '<a class="gst-camp mv-campcard" href="#/app/camps/' + c.id + '" style="text-decoration:none;color:inherit"><div class="gst-camp__top"><div><span class="gst-camp-type"><b>' + T.l + "</b><span>" + T.court + '</span></span><h4 class="gst-camp__name" style="margin-top:12px">' + esc(c.court) + '</h4></div><div class="gst-camp__count">' + cd.big + "<small>" + APP.ddm(c.du) + " → " + APP.ddm(c.au) + '</small></div></div><dl class="gst-spec gst-spec--inline"><div><dt class="gst-label">Lieu</dt><dd>' + esc(c.lieu) + '</dd></div><div><dt class="gst-label">Effectif</dt><dd>' + APP.effectif(c) + '</dd></div><div><dt class="gst-label">Budget</dt><dd>' + f(R.versionA ? R.total : R.totalLive) + '</dd></div></dl><div class="gst-camp__groups">' + groups + '</div><div class="mv-row mv-row--sb">' + APP.badge(c.statut) + '<span class="mv-mono mv-muted">' + Object.keys(c.modules).filter(function (k) { return c.modules[k]; }).join(" · ") + "</span></div></a>";
    }).join("");
    return APP.head(".00 / CAMPS", "Tous les camps", "Rien n'existe hors d'un camp : chaque besoin, chaque franc et chaque plat y est rattaché.", APP.role() === "chef" ? '<a class="gst-btn gst-btn--primary" href="#/app/camps/nouveau">' + ico("plus", "gst-icon--sm") + "Ouvrir un camp</a>" : "") +
      '<div class="mv-grid mv-grid--wide">' + cards + "</div>";
  } });

  APP.route("/app/camps/:id", { title: function (p) { return APP.camp(p.id).court; }, perm: "camp.view", crumb: "SOCLE / FICHE DU CAMP", render: function (p) {
    var c = APP.camp(p.id), R = APP.calc(c), T = S.TYPES[c.type];
    var units = c.unites.map(function (u) { var U = APP.unite(u); var n = c.inscriptions.filter(function (i) { var pp = APP.person(i.person); return pp && pp.unite === u; }).length; return '<div class="mv-li"><span class="mv-grp__l" style="width:36px;height:36px;font-size:1.2rem">' + u[0] + '</span><div class="mv-li__m"><b>' + esc(U.nom) + "</b><small>" + U.age + " · chef : " + esc(APP.pname(U.chef, true)) + '</small></div><span class="mv-li__v">' + n + " jeunes</span></div>"; }).join("");
    var mods = [["roadmap", "Roadmap 3D", "route"], ["inscription", "Inscription publique", "ticket"], ["bus", "Bus volant", "bus"]].map(function (m) { return '<div class="mv-li"><span class="mv-ico">' + ico(m[2]) + '</span><div class="mv-li__m"><b>' + m[1] + "</b></div>" + (c.modules[m[0]] ? '<span class="gst-badge gst-badge--success">activé</span>' : '<span class="gst-badge">désactivé</span>') + "</div>"; }).join("");
    var canEdit = APP.role() === "chef";
    return hero(c, R, '<div class="mv-row"><span class="gst-chip">' + T.niveau + ' · préparation J-' + T.prep + "</span>" + APP.badge(c.statut) + "</div>") +
      '<div class="mv-g3">' + APP.kpi("Effectif prévisionnel", APP.num("c-eff", APP.effectif(c)), { ico: "users", sub: c.inscriptions.length + " jeunes · " + c.encadrement.length + " encadrants" }) + APP.kpi("Enveloppe de départ", f(c.enveloppe), { unit: "F CFA", ico: "wallet" }) + APP.kpi("Budget consolidé", APP.num("c-live", R.totalLive), { unit: "F CFA", ico: "calculator", sub: R.totalLive > c.enveloppe ? "Au-dessus de l'enveloppe" : "Dans l'enveloppe", subTone: R.totalLive > c.enveloppe ? "bad" : "good" }) + "</div>" +
      APP.card("Rétroplanning généré", jalons(R), { ico: "calendar", tag: "SELON LE TYPE · " + T.court.toUpperCase() }) +
      '<div class="mv-g2">' + APP.card("Unités participantes", '<div class="mv-list">' + units + "</div>", { ico: "users" }) + APP.card("Modules optionnels", '<div class="mv-list">' + mods + "</div>" + (canEdit ? '<button class="gst-btn gst-btn--secondary gst-btn--sm" data-edit-mod>' + ico("sliders", "gst-icon--sm") + "Modifier</button>" : ""), { ico: "sliders" }) + "</div>" +
      APP.card("Groupes logistiques ouverts", groupsStrip(c, R), { ico: "package" }) +
      (canEdit ? '<div class="mv-row"><button class="gst-btn gst-btn--secondary" data-model>' + ico("layers", "gst-icon--sm") + "Enregistrer comme modèle de camp</button>" + (c.statut === "préparation" ? '<button class="gst-btn gst-btn--ghost" data-start>' + ico("play", "gst-icon--sm") + "Démarrer le camp</button>" : "") + "</div>" : "");
  }, mount: function (el, p) {
    var c = APP.camp(p.id);
    var b = el.querySelector("[data-edit-mod]");
    if (b) b.onclick = function () {
      var m = APP.modal('<span class="gst-tag">MODULES · ' + esc(c.court.toUpperCase()) + '</span><h4 class="gst-display-md" style="margin:10px 0">Modules optionnels</h4><div class="mv-stack">' + APP.toggle("md-roadmap", c.modules.roadmap, "Roadmap 3D") + APP.toggle("md-inscription", c.modules.inscription, "Inscription publique") + APP.toggle("md-bus", c.modules.bus, "Bus volant") + '</div><div class="mv-row" style="margin-top:18px"><button class="gst-btn gst-btn--primary" data-ok>Enregistrer</button><button class="gst-btn gst-btn--ghost" data-close>Annuler</button></div>');
      m.querySelector("[data-ok]").onclick = function () { var nv = { roadmap: m.querySelector("#md-roadmap").checked, inscription: m.querySelector("#md-inscription").checked, bus: m.querySelector("#md-bus").checked }; APP.closeDrawer(); APP.commit("modules", function () { c.modules = nv; }, { log: ["Camp " + c.court, "Modules", "", Object.keys(nv).filter(function (k) { return nv[k]; }).join(", ")] }); G.toast("Modules mis à jour", { tag: ".00 / CAMP", tone: "success" }); };
    };
    var mo = el.querySelector("[data-model]");
    if (mo) mo.onclick = function () {
      var R = APP.calc(c);
      APP.commit("modèle", function (st) { st.references.push({ id: APP.uid("ref"), nom: "Modèle — " + c.court, type: c.type, annee: +c.du.slice(0, 4), effectif: R.eff, jours: R.jours, ali: R.groupes.B ? R.groupes.B.cost : 0, tra: R.groupes.G ? R.groupes.G.cost : 0, mat: R.groupes.A ? R.groupes.A.cost : 0, autres: R.totalLive - (R.groupes.B ? R.groupes.B.cost : 0) - (R.groupes.G ? R.groupes.G.cost : 0) - (R.groupes.A ? R.groupes.A.cost : 0), source: "Modèle enregistré depuis la plateforme", modele: c.id }); }, { log: ["Base de références", "Modèle de camp", "", c.court] });
      G.toast("Modèle enregistré dans la base de références", { tag: ".00 / MÉMOIRE", tone: "success" });
    };
    var st = el.querySelector("[data-start]");
    if (st) st.onclick = function () { APP.confirm("Démarrer le camp ?", "Le camp passe en mode « en cours » : dépenses live, comptes du jour et suggestion de repas s'activent.", "Démarrer", { eclair: true }).then(function (ok) { if (ok) APP.commit("start", function () { c.statut = "en cours"; }, { log: ["Camp " + c.court, "Statut", "préparation", "en cours"] }); }); };
  } });

  /* Assistant d'ouverture (M0.3) */
  var wiz = null;
  function wizInit() {
    var T = S.TYPES.rejouissance;
    wiz = { step: 0, nom: "Camp de formation — Kpalimé 2026", type: "formation", du: "2026-11-20", au: "2026-11-22", lieu: "Kpalimé — centre Adjodogou", jeunes: 40, chefs: 8, cuisine: 3, invites: 2,
      unites: ["PIO", "ROU"], groupes: S.TYPES.formation.groupes.split(""), resp: { A: "p-komi", B: "p-abla", D: "p-enyonam", E: "p-kafui", F: "p-codjo", G: "p-yawo", H: "p-akouvi", I: "p-elom" }, enveloppe: 450000, modules: APP.clone(S.TYPES.formation.modules), modele: "" };
  }
  var STEPS = ["Identité", "Unités & effectif", "Groupes", "Responsables", "Budget", "Modules"];
  APP.route("/app/camps/nouveau", { title: "Ouvrir un camp", perm: "camps", crumb: "SOCLE / FORMULAIRE D'OUVERTURE", render: function () {
    if (APP.role() !== "chef") return APP.views.denied({ title: "Ouvrir un camp" });
    if (!wiz) wizInit();
    var w = wiz, st = w.step, body = "";
    var staff = APP.state.personnes.filter(function (p) { return p.encadrant; }).map(function (p) { return [p.id, p.prenom + " " + p.nom]; });
    if (st === 0) {
      body = '<div class="mv-form mv-form--2">' + APP.field("Nom du camp", APP.input("w-nom", w.nom), { req: true, cls: "is-full" }) +
        '<div class="is-full"><span class="gst-label">Type de camp</span><div class="mv-choice" style="margin-top:8px">' + Object.keys(S.TYPES).map(function (k) { var T = S.TYPES[k]; return '<label><input type="radio" name="w-type" value="' + k + '"' + (w.type === k ? " checked" : "") + '><span class="gst-camp-type"><b>' + T.l + "</b></span><b>" + T.court + "</b><small>" + T.duree + " · logistique " + T.niveau.toLowerCase() + " · J-" + T.prep + "</small></label>"; }).join("") + "</div></div>" +
        APP.field("Début", APP.input("w-du", w.du, { type: "date" }), { req: true }) + APP.field("Fin", APP.input("w-au", w.au, { type: "date" }), { req: true }) + APP.field("Lieu", APP.input("w-lieu", w.lieu, { ico: "map-pin" }), { req: true, cls: "is-full" }) +
        APP.field("Partir d'un modèle (base de références)", APP.select("w-modele", APP.state.references.map(function (r) { return [r.id, r.nom]; }), w.modele, { ph: "Aucun — recensement vierge" }), { cls: "is-full", help: "Un modèle reprend au moins 80 % du recensement : on ajuste l'effectif, le reste est déjà là." }) + "</div>";
    } else if (st === 1) {
      body = '<div class="mv-choice">' + APP.state.unites.map(function (u) { return '<label><input type="checkbox" name="w-u" value="' + u.id + '"' + (w.unites.indexOf(u.id) > -1 ? " checked" : "") + "><b>" + esc(u.nom) + "</b><small>" + u.age + "</small></label>"; }).join("") + '</div><div class="mv-form mv-form--3" style="margin-top:16px">' +
        APP.field("Jeunes", APP.input("w-jeunes", w.jeunes, { type: "number" })) + APP.field("Chefs", APP.input("w-chefs", w.chefs, { type: "number" })) + APP.field("Équipe cuisine", APP.input("w-cuisine", w.cuisine, { type: "number" })) + APP.field("Invités", APP.input("w-invites", w.invites, { type: "number" })) + "</div>" +
        '<p class="mv-muted" style="margin:0">Effectif prévisionnel : <b data-eff>' + (+w.jeunes + +w.chefs + +w.cuisine + +w.invites) + "</b> personnes — base de tous les calculs logistiques.</p>";
    } else if (st === 2) {
      var T = S.TYPES[w.type];
      body = '<p class="mv-muted" style="margin:0 0 12px">Pré-cochés selon le type « ' + T.court + " » — modifiables.</p>" + '<div class="mv-choice">' + "ABCDEFGHIJ".split("").map(function (L) { var m = S.GROUPES[L]; return '<label><input type="checkbox" name="w-g" value="' + L + '"' + (w.groupes.indexOf(L) > -1 ? " checked" : "") + (m.pivot ? " disabled checked" : "") + '><span class="mv-grp__l" style="width:36px;height:36px;font-size:1.2rem">' + L + "</span><b>" + m.nom + "</b><small>" + esc(m.desc) + (T.groupes.indexOf(L) > -1 ? " · prévu pour ce type" : "") + "</small></label>"; }).join("") + "</div>";
    } else if (st === 3) {
      body = '<div class="mv-form mv-form--2">' + w.groupes.map(function (L) { return APP.field("Groupe " + L + " — " + S.GROUPES[L].nom, APP.select("w-r-" + L, staff, w.resp[L] || "", { ph: "Choisir un responsable" })); }).join("") + "</div>";
    } else if (st === 4) {
      var ref = APP.state.references.filter(function (r) { return r.type === w.type; }), eff = +w.jeunes + +w.chefs + +w.cuisine + +w.invites, jours = APP.diffDays(w.du, w.au) + 1;
      var ratio = ref.length ? ref.reduce(function (s, r) { return s + (r.ali + r.tra + r.mat + r.autres) / r.effectif / r.jours; }, 0) / ref.length : 0;
      body = '<div class="mv-form mv-form--2">' + APP.field("Enveloppe budgétaire de départ", APP.input("w-env", w.enveloppe, { money: true }), { help: "Si elle est connue. Laisser 0 sinon." }) + "</div>" +
        (ratio ? '<div class="gst-hook" style="margin-top:14px">' + ico("lightbulb", "gst-icon--lg gst-hook__ico") + '<div class="gst-hook__body"><span class="gst-hook__src">Estimation automatique · base de références (' + ref.length + " camp(s) " + S.TYPES[w.type].court + ')</span><span class="gst-hook__vals"><b>' + cfa(Math.round(ratio * eff * jours / 1000) * 1000) + "</b> · " + f(Math.round(ratio)) + " F / personne / jour × " + eff + " × " + jours + ' j</span></div><div class="gst-hook__actions"><button class="gst-btn gst-btn--brand gst-btn--sm" data-use-est="' + Math.round(ratio * eff * jours / 1000) * 1000 + '">Utiliser</button></div></div>' : '<p class="mv-muted">Aucun camp de ce type dans la base de références : pas d\'estimation automatique.</p>');
    } else {
      body = '<div class="mv-stack">' + APP.toggle("w-m-roadmap", w.modules.roadmap, "Roadmap 3D — programme jour par jour") + APP.toggle("w-m-inscription", w.modules.inscription, "Inscription publique en ligne") + APP.toggle("w-m-bus", w.modules.bus, "Bus volant — inscriptions visibles") + "</div>" +
        '<div class="mv-card mv-card--tint" style="margin-top:16px"><span class="gst-tag">RÉCAPITULATIF</span><dl class="gst-spec gst-spec--rules"><dt>Camp</dt><dd>' + esc(w.nom) + "</dd><dt>Type</dt><dd>" + S.TYPES[w.type].nom + "</dd><dt>Dates</dt><dd>" + APP.dshort(w.du) + " → " + APP.dshort(w.au) + "</dd><dt>Effectif</dt><dd>" + (+w.jeunes + +w.chefs + +w.cuisine + +w.invites) + "</dd><dt>Groupes</dt><dd>" + w.groupes.join(" · ") + "</dd><dt>Enveloppe</dt><dd>" + cfa(w.enveloppe) + "</dd></dl></div>";
    }
    return APP.head(".00 / FORMULAIRE D'OUVERTURE", "Ouvrir un camp", "Créer un camp, c'est déclencher tout le reste : groupes, rétroplanning, modules.") +
      '<ol class="gst-stepper-nav mv-wizsteps" style="padding:0;margin:0">' + STEPS.map(function (s, i) { return '<li class="' + (i < st ? "is-done" : i === st ? "is-current" : "") + '"><b>.0' + (i + 1) + "</b>" + s + "</li>"; }).join("") + "</ol>" +
      APP.card(STEPS[st], body + '<div class="mv-row mv-row--sb" style="margin-top:8px"><button class="gst-btn gst-btn--ghost" data-prev' + (st === 0 ? " disabled" : "") + ">" + ico("chevron-left", "gst-icon--sm") + "Précédent</button>" + (st < 5 ? '<button class="gst-btn gst-btn--primary" data-next>Suivant' + ico("chevron-right", "gst-icon--sm") + "</button>" : '<button class="gst-btn gst-btn--eclair gst-btn--lg" data-create>' + ico("zap", "gst-icon--sm") + "Ouvrir le camp</button>") + "</div>", { tag: "ÉTAPE " + (st + 1) + " / 6" });
  }, mount: function (el) {
    if (!wiz) return;
    var w = wiz;
    function read() {
      var q = function (s) { return el.querySelector(s); };
      if (w.step === 0) { w.nom = q("#w-nom").value; var t = el.querySelector("input[name=w-type]:checked"); if (t && t.value !== w.type) { w.type = t.value; w.groupes = S.TYPES[w.type].groupes.split(""); w.modules = APP.clone(S.TYPES[w.type].modules); } w.du = q("#w-du").value; w.au = q("#w-au").value; w.lieu = q("#w-lieu").value; w.modele = q("#w-modele").value; }
      if (w.step === 1) { w.unites = Array.prototype.map.call(el.querySelectorAll("input[name=w-u]:checked"), function (i) { return i.value; }); ["jeunes", "chefs", "cuisine", "invites"].forEach(function (k) { w[k] = +q("#w-" + k).value || 0; }); }
      if (w.step === 2) { w.groupes = Array.prototype.map.call(el.querySelectorAll("input[name=w-g]:checked"), function (i) { return i.value; }); if (w.groupes.indexOf("F") < 0) w.groupes.push("F"); w.groupes.sort(); }
      if (w.step === 3) w.groupes.forEach(function (L) { var s = q("#w-r-" + L); if (s) w.resp[L] = s.value; });
      if (w.step === 4) w.enveloppe = APP.money(q("#w-env").value);
      if (w.step === 5) ["roadmap", "inscription", "bus"].forEach(function (k) { w.modules[k] = q("#w-m-" + k).checked; });
    }
    el.querySelectorAll("input[name=w-type]").forEach(function (r) { r.onchange = function () { read(); }; });
    el.querySelectorAll("#w-jeunes,#w-chefs,#w-cuisine,#w-invites").forEach(function (i) { i.oninput = function () { read(); el.querySelector("[data-eff]").textContent = +w.jeunes + +w.chefs + +w.cuisine + +w.invites; }; });
    var u = el.querySelector("[data-use-est]"); if (u) u.onclick = function () { el.querySelector("#w-env").value = u.dataset.useEst; G.toast("Estimation reprise", { tag: ".00 / RÉFÉRENCES" }); };
    var pv = el.querySelector("[data-prev]"); if (pv) pv.onclick = function () { read(); w.step = Math.max(0, w.step - 1); APP.render(true); };
    var nx = el.querySelector("[data-next]"); if (nx) nx.onclick = function () {
      read();
      if (w.step === 0 && (!w.nom || !w.du || !w.au || !w.lieu || w.au < w.du)) { G.toast("Nom, dates et lieu sont requis (la fin après le début)", { tag: ".00 / FORMULAIRE", tone: "danger" }); return; }
      if (w.step === 1 && !w.unites.length) { G.toast("Choisissez au moins une unité", { tag: ".00 / FORMULAIRE", tone: "danger" }); return; }
      w.step++; location.hash = "#/app/camps/nouveau?s=" + w.step;
    };
    var cr = el.querySelector("[data-create]"); if (cr) cr.onclick = function () {
      read();
      var id = "c" + Date.now().toString(36), T = S.TYPES[w.type];
      APP.commit("ouverture", function (st) {
        var c = { id: id, nom: w.nom, court: w.nom.replace(/^Camp de |^Camp /, "").slice(0, 30), type: w.type, du: w.du, au: w.au, lieu: w.lieu, enveloppe: w.enveloppe, inscription: 15000, places: Math.max(10, +w.jeunes), statut: "préparation", unites: w.unites,
          encadrement: st.personnes.filter(function (p) { return p.encadrant; }).slice(0, +w.chefs + +w.cuisine).map(function (p) { return p.id; }), modules: w.modules, seuilDouble: 100000, delaiAvance: 2, devise: T.international ? "XOF + EUR" : "XOF" };
        var g = {};
        "ABCDEFGHIJ".split("").forEach(function (L) {
          var open = w.groupes.indexOf(L) > -1;
          g[L] = { open: open, resp: open ? w.resp[L] || null : null, statut: open ? "en cours" : "fermé", lignes: (S.GABARITS[L] && (w.modele || true)) ? S.GABARITS[L].map(function (r) { return { id: APP.uid("l"), cat: r[0], art: r[1], mode: r[2], q: r[3], inv: !!r[4], seuil: r[5] || 0, jour: r[6] || 0, dispo: 0 }; }) : [] };
        });
        g.B.manuel = []; g.B.marge = 5; g.B.eauTech = 1.5; g.B.source = T.cuisine ? "menu" : "manuel";
        g.G.lignes = [{ id: APP.uid("l"), cat: "Véhicules", art: +w.jeunes + +w.chefs > 30 ? "bus70" : "bus30", mode: "fixe", q: 1, dispo: 0 }]; g.G.itineraires = []; g.G.chargement = {};
        g.D.respSante = w.resp.D || null; g.D.structure = ""; g.D.evacuation = ""; g.D.contacts = []; g.E.remise = ""; g.H.pointage = {}; g.H.publie = false; g.F.statut = "consolidé";
        c.groupes = g;
        c.inscriptions = []; c.programme = []; c.menu = { arrete: false, transmis: false, jours: null, cloture: APP.addDays(w.du, -30), choix: { votants: 0, selections: {}, propositions: [], mes: {} } };
        c.live = null; c.budget = { validation: "brouillon", circuit: [], ajust: [], versions: [] }; c.depenses = []; c.entrees = []; c.avances = []; c.caisse = []; c.arrets = {}; c.devis = [];
        // Effectif : jeunes non encore inscrits → encadrement + places prévisionnelles comptées comme réservations anonymes
        c.prevision = +w.jeunes + +w.invites;
        st.camps.push(c); st.camp = id; st.roles[id] = {};
        Object.keys(w.resp).forEach(function (L) { if (w.groupes.indexOf(L) > -1 && w.resp[L]) st.roles[id][w.resp[L]] = ["respgroupe:" + L]; });
      }, { log: ["Camp", "Ouverture", "", w.nom + " (" + T.court + ")"] });
      wiz = null;
      G.toast("Camp ouvert · " + w.groupes.length + " groupes logistiques créés", { tag: ".00 / OUVERTURE", tone: "success" });
      APP.go("#/app/camps/" + id);
    };
  } });

  /* ══ Annuaire (M0.2) ═══════════════════════════════════════════════════ */
  function age(n) { return APP.diffDays(n, APP.state.today) / 365.25 | 0; }
  APP.route("/app/annuaire", { title: "Annuaire", perm: "annuaire|annuaire.unite|sanitaire", crumb: "SOCLE / ANNUAIRE", render: function (p) {
    var r = APP.role(), s = APP.state.session, q = p.q.q || "", fu = p.q.u || (r === "chefunite" ? s.unite : ""), fs = p.q.f === "sanitaire";
    var list = APP.state.personnes.filter(function (x) { return !x.externe; });
    if (fu) list = list.filter(function (x) { return x.unite === fu; });
    if (q) { var n = q.toLowerCase(); list = list.filter(function (x) { return (x.prenom + " " + x.nom).toLowerCase().indexOf(n) > -1; }); }
    if (fs) list = list.filter(function (x) { return x.sanitaire.allergies.length || x.sanitaire.traitements || x.sanitaire.antecedents || x.sanitaire.regime; });
    var showSan = APP.canSanitaire();
    var rows = list.slice(0, 160).map(function (x) {
      var U = APP.unite(x.unite);
      return '<tr><td><a href="#/app/personne/' + x.id + '" class="mv-row" style="gap:10px;text-decoration:none;flex-wrap:nowrap"><span class="gst-avatar">' + APP.initials(x) + "</span><span>" + esc(x.prenom + " " + x.nom) + "</span></a></td><td>" + (U ? esc(U.nom) : "—") + '</td><td class="n">' + age(x.naissance) + " ans</td><td>" + (x.encadrant ? '<span class="gst-badge gst-badge--brand">encadrant</span>' : '<span class="gst-badge">jeune</span>') + "</td><td>" + (showSan ? (x.sanitaire.allergies.length ? '<span class="gst-badge gst-badge--danger">' + esc(x.sanitaire.allergies.join(", ")) + "</span>" : x.sanitaire.traitements ? '<span class="gst-badge gst-badge--warning">traitement</span>' : "—") : '<span class="mv-muted">' + ico("lock", "gst-icon--sm") + " restreint</span>") + '</td><td class="n">' + x.camps.length + "</td></tr>";
    }).join("");
    return APP.head(".00 / ANNUAIRE", "Personnes & unités", list.length + " personne(s). La fiche sanitaire n'est visible que par le chef de groupe et la responsable santé.", APP.can("annuaire") && r !== "chefunite" ? '<a class="gst-btn gst-btn--secondary" href="#/app/annuaire/import">' + ico("cloud-upload", "gst-icon--sm") + 'Import tableur</a><button class="gst-btn gst-btn--primary" data-new-p>' + ico("plus", "gst-icon--sm") + "Nouvelle personne</button>" : "") +
      '<div class="mv-card"><div class="mv-row">' + '<div class="gst-control" style="flex:1;min-width:220px">' + ico("search", "gst-icon--sm") + '<input id="an-q" placeholder="Rechercher par nom…" value="' + esc(q) + '" autocomplete="off"></div>' +
      APP.select("an-u", APP.state.unites.map(function (u) { return [u.id, u.nom]; }), fu, { ph: "Toutes les unités", attrs: r === "chefunite" ? " disabled" : "" }) + (showSan ? APP.toggle("an-s", fs, "Fiches à surveiller") : "") + '<span class="mv-mono mv-muted" data-took></span></div>' +
      '<div class="mv-tw"><table class="mv-t"><thead><tr><th>Nom</th><th>Unité</th><th class="n">Âge</th><th>Statut</th><th>Santé</th><th class="n">Camps</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">' + APP.empty("Aucun résultat", "Essayez un autre nom.") + "</td></tr>") + "</tbody></table></div></div>" +
      '<div class="mv-grid">' + APP.state.unites.map(function (u) { var n = APP.state.personnes.filter(function (x) { return x.unite === u.id && !x.encadrant; }).length; return '<a class="mv-card" style="text-decoration:none" href="#/app/annuaire?u=' + u.id + '"><span class="gst-tag">' + u.age + '</span><h3 class="gst-display-md" style="margin:0;font-size:1.6rem">' + esc(u.nom) + '</h3><span class="mv-mono mv-muted">' + n + " jeunes · chef " + esc(APP.pname(u.chef, true)) + "</span></a>"; }).join("") + "</div>";
  }, mount: function (el, p) {
    var t0 = performance.now(), qi = el.querySelector("#an-q");
    var took = el.querySelector("[data-took]"); if (took) took.textContent = "recherche · " + Math.max(1, Math.round(performance.now() - t0)) + " ms";
    var tm; qi.oninput = function () { clearTimeout(tm); tm = setTimeout(function () { var h = "#/app/annuaire?q=" + encodeURIComponent(qi.value) + (p.q.u ? "&u=" + p.q.u : "") + (p.q.f ? "&f=" + p.q.f : ""); history.replaceState(null, "", h); APP.render(); var n = document.getElementById("an-q"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 120); };
    var su = el.querySelector("#an-u"); if (su) su.onchange = function () { APP.go("#/app/annuaire?u=" + su.value + (qi.value ? "&q=" + encodeURIComponent(qi.value) : "")); };
    var ss = el.querySelector("#an-s"); if (ss) ss.onchange = function () { APP.go("#/app/annuaire" + (ss.checked ? "?f=sanitaire" : "")); };
    var np = el.querySelector("[data-new-p]"); if (np) np.onclick = function () { personForm(); };
  } });
  function personForm() {
    var m = APP.modal('<span class="gst-tag">ANNUAIRE · NOUVELLE FICHE</span><h4 class="gst-display-md" style="margin:10px 0">Nouvelle personne</h4><form class="mv-form mv-form--2" data-pf>' + APP.field("Prénom", APP.input("pf-pre", ""), { req: true }) + APP.field("Nom", APP.input("pf-nom", ""), { req: true }) + APP.field("Naissance", APP.input("pf-nai", "2012-01-01", { type: "date" })) + APP.field("Unité", APP.select("pf-u", APP.state.unites.map(function (u) { return [u.id, u.nom]; }), "ECL")) +
      APP.field("Contact", APP.input("pf-tel", "", { ph: "+228 …" })) + APP.field("Contact d'urgence", APP.input("pf-urg", "", { ph: "Nom · téléphone" })) + APP.field("Allergies (fiche sanitaire)", APP.input("pf-all", "", { ph: "ex. arachide" }), { cls: "is-full", help: "Visible seulement par le chef de groupe et la responsable santé." }) +
      '<div class="mv-row is-full"><button class="gst-btn gst-btn--primary" type="submit">Créer la fiche</button><button class="gst-btn gst-btn--ghost" type="button" data-close>Annuler</button></div></form>', { wide: true });
    m.querySelector("[data-pf]").onsubmit = function (e) {
      e.preventDefault(); var v = function (i) { return m.querySelector("#" + i).value.trim(); };
      if (!v("pf-pre") || !v("pf-nom")) { G.toast("Prénom et nom requis", { tag: ".00 / ANNUAIRE", tone: "danger" }); return; }
      var dup = APP.state.personnes.some(function (x) { return x.prenom.toLowerCase() === v("pf-pre").toLowerCase() && x.nom.toLowerCase() === v("pf-nom").toLowerCase() && x.naissance === v("pf-nai"); });
      if (dup) { G.toast("Doublon : cette personne existe déjà", { tag: ".00 / ANNUAIRE", tone: "danger" }); return; }
      var id = APP.uid("p");
      APP.commit("personne", function (st) { st.personnes.push({ id: id, prenom: v("pf-pre"), nom: v("pf-nom"), naissance: v("pf-nai"), unite: v("pf-u"), tel: v("pf-tel"), urgence: v("pf-urg"), sanitaire: { allergies: v("pf-all") ? v("pf-all").split(/,\s*/) : [], traitements: "", antecedents: "" }, camps: [] }); }, { log: ["Annuaire", "Nouvelle fiche", "", v("pf-pre") + " " + v("pf-nom")] });
      APP.closeDrawer(); G.toast("Fiche créée", { tag: ".00 / ANNUAIRE", tone: "success" }); APP.go("#/app/personne/" + id);
    };
  }

  APP.route("/app/annuaire/import", { title: "Import tableur", perm: "annuaire", crumb: "SOCLE / ANNUAIRE / IMPORT", render: function () {
    var ex = "prenom;nom;naissance;unite;contact_urgence\nDodji;Agbéko;2013-05-02;ECL;Mme Agbéko +228 90 11 22 33\nEyram;Kodjovi;2014-01-19;GUI;M. Kodjovi +228 91 44 55 66\nSélom;Akakpo;2012-04-09;ECL;(doublon — sera ignoré)";
    return APP.head(".00 / IMPORT EN MASSE", "Importer depuis un tableur", "Collez un export CSV (séparateur « ; ») ou générez un lot de test de 200 personnes. Les doublons (même prénom, nom et date de naissance) sont ignorés.") +
      APP.card("Données à importer", '<textarea class="mv-ta mv-mono" id="im-csv" rows="8">' + esc(ex) + '</textarea><div class="mv-row"><button class="gst-btn gst-btn--primary" data-imp>' + ico("cloud-upload", "gst-icon--sm") + 'Analyser & importer</button><button class="gst-btn gst-btn--secondary" data-gen>Générer 200 personnes (test M0.2)</button></div><div data-res></div>', { ico: "cloud-upload" });
  }, mount: function (el) {
    function run(lines) {
      var t0 = performance.now(), added = 0, dup = 0, keys = {};
      APP.state.personnes.forEach(function (x) { keys[(x.prenom + "|" + x.nom + "|" + x.naissance).toLowerCase()] = 1; });
      var news = [];
      lines.forEach(function (c) {
        var k = (c[0] + "|" + c[1] + "|" + c[2]).toLowerCase();
        if (keys[k]) { dup++; return; } keys[k] = 1; added++;
        news.push({ id: APP.uid("p"), prenom: c[0], nom: c[1], naissance: c[2] || "2012-01-01", unite: c[3] || "ECL", tel: "", urgence: c[4] || "", sanitaire: { allergies: [], traitements: "", antecedents: "" }, camps: [] });
      });
      APP.commit("import", function (st) { st.personnes = st.personnes.concat(news); }, { log: ["Annuaire", "Import tableur", "", added + " ajoutée(s), " + dup + " doublon(s)"] });
      setTimeout(function () {
        var r = document.querySelector("[data-res]");
        if (r) r.innerHTML = '<div class="gst-alert gst-alert--success"><svg class="gst-icon gst-alert__ico"><use href="#i-circle-check"/></svg><div><div class="gst-alert__title">' + added + " personne(s) importée(s) · " + dup + ' doublon(s) ignoré(s)</div><div class="gst-alert__text">Opération en ' + Math.round(performance.now() - t0) + ' ms. <a href="#/app/annuaire">Voir l\'annuaire</a></div></div><span></span></div>';
      }, 30);
    }
    el.querySelector("[data-imp]").onclick = function () {
      var rows = el.querySelector("#im-csv").value.trim().split(/\n/).slice(1).map(function (l) { return l.split(";").map(function (x) { return x.trim(); }); }).filter(function (r) { return r[0] && r[1]; });
      run(rows);
    };
    el.querySelector("[data-gen]").onclick = function () {
      var rows = [], u = ["LOU", "JEA", "ECL", "GUI", "PIO", "ROU"];
      for (var i = 0; i < 200; i++) rows.push([S.PRENOMS[i % S.PRENOMS.length], S.NOMS[(i * 7) % S.NOMS.length] + (i > 120 ? "-" + (i % 9) : ""), (2008 + (i % 10)) + "-" + String(1 + (i % 12)).padStart(2, "0") + "-" + String(1 + (i % 27)).padStart(2, "0"), u[i % 6], ""]);
      run(rows);
    };
  } });

  APP.route("/app/personne/:id", { title: function (p) { return APP.pname(p.id); }, perm: "annuaire|annuaire.unite|sanitaire", crumb: "SOCLE / FICHE PERSONNE", render: function (p) {
    var x = APP.person(p.id); if (!x) return APP.empty("Fiche introuvable", "Cette personne n'existe pas.");
    var U = APP.unite(x.unite), san = APP.canSanitaire();
    if (APP.role() === "chefunite" && x.unite !== APP.state.session.unite) return APP.views.denied({ title: "Fiche hors de votre unité" });
    var hist = x.camps.map(function (cid) { var c = APP.camp(cid); return '<div class="mv-li"><span class="mv-ico">' + ico("tent") + '</span><div class="mv-li__m"><b>' + esc(c.nom) + "</b><small>" + APP.dshort(c.du) + " → " + APP.dshort(c.au) + "</small></div>" + APP.badge(c.statut) + "</div>"; }).join("") || '<p class="mv-muted" style="margin:0">Aucun camp.</p>';
    var rolesHtml = Object.keys(APP.state.roles).map(function (cid) { var rr = APP.state.roles[cid][x.id]; return rr ? '<div class="mv-li"><div class="mv-li__m"><b>' + esc(APP.camp(cid).court) + "</b></div>" + rr.map(function (r) { var k = r.split(":")[0]; return '<span class="gst-badge gst-badge--brand">' + esc((S.ROLES[k] ? S.ROLES[k].nom : k) + (r.split(":")[1] ? " · " + r.split(":")[1] : "")) + "</span>"; }).join("") + "</div>" : ""; }).join("");
    return '<div class="mv-ph"><div class="mv-row" style="gap:16px"><span class="gst-avatar" style="width:72px;height:72px;font-size:22px">' + APP.initials(x) + '</span><div class="mv-ph__t"><span class="gst-tag gst-tag--accent">' + (U ? esc(U.nom.toUpperCase()) : "EXTERNE") + "</span><h2>" + esc(x.prenom + " " + x.nom) + "</h2><p>" + age(x.naissance) + " ans · né·e le " + APP.dlong(x.naissance) + "</p></div></div></div>" +
      '<div class="mv-g2">' + APP.card("Identité & contacts", '<dl class="gst-spec gst-spec--rules"><dt>Unité</dt><dd>' + (U ? esc(U.nom) : "—") + "</dd><dt>Contact</dt><dd>" + esc(x.tel || "—") + "</dd><dt>Urgence</dt><dd>" + esc(x.urgence || "—") + "</dd><dt>Statut</dt><dd>" + (x.encadrant ? "Encadrant" : "Jeune") + "</dd></dl>", { ico: "user" }) +
      APP.card("Fiche sanitaire", san ? '<dl class="gst-spec gst-spec--rules"><dt>Allergies</dt><dd>' + (x.sanitaire.allergies.length ? '<span class="gst-badge gst-badge--danger">' + esc(x.sanitaire.allergies.join(", ")) + "</span>" : "Aucune") + "</dd><dt>Traitements</dt><dd>" + esc(x.sanitaire.traitements || "Aucun") + "</dd><dt>Antécédents</dt><dd>" + esc(x.sanitaire.antecedents || "—") + "</dd><dt>Régime</dt><dd>" + esc(x.sanitaire.regime || "—") + "</dd></dl>" :
        '<div class="gst-empty" style="padding:20px"><span class="mv-ico mv-ico--red">' + ico("lock") + '</span><h4 class="gst-empty__title">Accès restreint</h4><p class="gst-empty__text">La fiche sanitaire n\'est visible que par le chef de groupe et la responsable santé (ENF-06).</p></div>', { ico: "heart-pulse", tone: "red", tag: "ACCÈS RESTREINT" }) + "</div>" +
      '<div class="mv-g2">' + APP.card("Historique des camps", '<div class="mv-list">' + hist + "</div>", { ico: "history" }) + APP.card("Rôles par camp", rolesHtml ? '<div class="mv-list">' + rolesHtml + "</div>" : '<p class="mv-muted" style="margin:0">Participant·e, sans rôle de gestion.</p>', { ico: "lock" }) + "</div>";
  } });

  /* ══ Base de prix (M0.4) ═══════════════════════════════════════════════ */
  var CATS = { ALI: "Alimentaire", MAT: "Matériel", TEC: "Technique", SAN: "Santé", SAL: "Salubrité", TRA: "Transport", ACT: "Activités", SOC: "Social & divers" };
  APP.CATS = CATS;
  APP.route("/app/prix", { title: "Base de prix", perm: "prix", crumb: "SOCLE / BASE DE PRIX", render: function (p) {
    var q = (p.q.q || "").toLowerCase(), cat = p.q.c || "", per = p.q.p === "1";
    var arts = APP.state.articles.filter(function (a) { return (!q || a.nom.toLowerCase().indexOf(q) > -1) && (!cat || a.cat === cat) && (!per || APP.prix(a.id).perime); });
    var nPer = APP.state.articles.filter(function (a) { return APP.prix(a.id).perime; }).length;
    var rows = arts.map(function (a) {
      var pr = APP.prix(a.id);
      return '<tr><td><a href="#/app/prix/' + a.id + '">' + esc(a.nom) + "</a></td><td>" + CATS[a.cat] + "</td><td>" + esc(a.unite) + '</td><td class="n">' + f(pr.montant) + "</td><td>" + esc(pr.marche || "") + "</td><td>" + (pr.date ? APP.dshort(pr.date) : "—") + (pr.perime ? ' <span class="mv-perime">' + ico("history", "gst-icon--sm") + "&gt; 6 mois</span>" : "") + "</td><td>" + (a.perissable ? '<span class="gst-badge gst-badge--warning">périssable</span>' : "") + "</td></tr>";
    }).join("");
    return APP.head(".00 / BASE DE PRIX", "Base de prix de référence", APP.state.articles.length + " articles. Sélectionner un article dans un recensement pré-remplit son prix le plus récent et validé.", APP.can("prix.edit") || APP.role() === "chef" ? '<button class="gst-btn gst-btn--primary" data-new-a>' + ico("plus", "gst-icon--sm") + "Nouvel article</button>" : "") +
      '<div class="mv-g3">' + APP.kpi("Articles", APP.state.articles.length, { ico: "coins", sub: "Objectif ≥ 150 — atteint" }) + APP.kpi("Prix périmés", nPer, { ico: "history", tone: nPer ? "yel" : "", sub: "Relevé de plus de 6 mois" }) + APP.kpi("Suggestions du hook", APP.state.hook.filter(function (h) { return h.statut === "suggestion"; }).length, { ico: "lightbulb", sub: '<a href="#/app/hook">Valider les suggestions</a>' }) + "</div>" +
      '<div class="mv-card"><div class="mv-row"><div class="gst-control" style="flex:1;min-width:200px">' + ico("search", "gst-icon--sm") + '<input id="px-q" placeholder="Rechercher un article…" value="' + esc(p.q.q || "") + '"></div>' + APP.select("px-c", Object.keys(CATS).map(function (k) { return [k, CATS[k]]; }), cat, { ph: "Toutes les catégories" }) + APP.toggle("px-p", per, "Périmés seulement") + "</div>" +
      '<div class="mv-tw"><table class="mv-t"><thead><tr><th>Article</th><th>Catégorie</th><th>Unité</th><th class="n">Prix (F)</th><th>Marché / fournisseur</th><th>Relevé</th><th></th></tr></thead><tbody>' + rows + "</tbody></table></div></div>";
  }, mount: function (el, p) {
    var qi = el.querySelector("#px-q"), tm;
    function go() { var h = "#/app/prix?q=" + encodeURIComponent(qi.value) + "&c=" + el.querySelector("#px-c").value + (el.querySelector("#px-p").checked ? "&p=1" : ""); history.replaceState(null, "", h); APP.render(); var n = document.getElementById("px-q"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }
    qi.oninput = function () { clearTimeout(tm); tm = setTimeout(go, 140); };
    el.querySelector("#px-c").onchange = go; el.querySelector("#px-p").onchange = go;
    var na = el.querySelector("[data-new-a]"); if (na) na.onclick = function () { APP.articleForm(); };
  } });
  APP.articleForm = function (cb, preset) {
    preset = preset || {};
    var m = APP.modal('<span class="gst-tag">BASE DE PRIX · NOUVEL ARTICLE</span><h4 class="gst-display-md" style="margin:10px 0">Nouvel article</h4><form class="mv-form mv-form--2" data-af>' + APP.field("Nom", APP.input("af-nom", preset.nom || ""), { req: true, cls: "is-full" }) + APP.field("Catégorie", APP.select("af-cat", Object.keys(CATS).map(function (k) { return [k, CATS[k]]; }), preset.cat || "MAT")) + APP.field("Unité de mesure", APP.input("af-u", "pièce")) +
      APP.field("Prix", APP.input("af-p", "", { money: true }), { req: true }) + APP.field("Marché / fournisseur", APP.input("af-m", "Marché d'Adakpamé")) + APP.field("Date du relevé", APP.input("af-d", APP.state.today, { type: "date" })) + '<div style="align-self:end">' + APP.check("af-per", false, "Périssable") + "</div>" +
      '<div class="mv-row is-full"><button class="gst-btn gst-btn--primary" type="submit">Ajouter à la base</button><button class="gst-btn gst-btn--ghost" type="button" data-close>Annuler</button></div></form>', { wide: true });
    m.querySelector("[data-af]").onsubmit = function (e) {
      e.preventDefault(); var v = function (i) { return m.querySelector("#" + i).value.trim(); };
      if (!v("af-nom") || !APP.money(v("af-p"))) { G.toast("Nom et prix requis", { tag: ".00 / BASE DE PRIX", tone: "danger" }); return; }
      var id = "a" + Date.now().toString(36);
      APP.commit("article", function (st) { st.articles.push({ id: id, nom: v("af-nom"), cat: v("af-cat"), unite: v("af-u"), perissable: m.querySelector("#af-per").checked, prix: [{ id: APP.uid("px"), montant: APP.money(v("af-p")), marche: v("af-m"), date: v("af-d"), source: "Saisie manuelle", statut: "validé" }] }); }, { log: ["Base de prix", "Nouvel article", "", v("af-nom") + " · " + v("af-p") + " F"] });
      APP.closeDrawer(); G.toast("Article ajouté à la base", { tag: ".00 / BASE DE PRIX", tone: "success" });
      if (cb) cb(id);
    };
  };
  APP.route("/app/prix/:id", { title: function (p) { var a = APP.article(p.id); return a ? a.nom : "Article"; }, perm: "prix", crumb: "SOCLE / BASE DE PRIX / FICHE", render: function (p) {
    var a = APP.article(p.id); if (!a) return APP.empty("Article introuvable", "");
    var pr = APP.prix(a.id), hist = a.prix.slice().sort(function (x, y) { return x.date < y.date ? 1 : -1; });
    var used = [];
    APP.state.camps.forEach(function (c) { "ABCDEGIJ".split("").forEach(function (L) { (c.groupes[L].lignes || []).concat(c.groupes[L].manuel || []).forEach(function (l) { if (l.art === a.id) used.push(c.court + " · groupe " + L); }); }); });
    var pts = hist.slice().reverse().map(function (h) { return h.montant; });
    return APP.head(".00 / " + CATS[a.cat].toUpperCase(), esc(a.nom), "Unité : " + esc(a.unite) + (a.perissable ? " · périssable" : ""), (APP.can("prix.edit") || APP.role() === "chef") ? '<button class="gst-btn gst-btn--primary" data-new-px>' + ico("plus", "gst-icon--sm") + "Nouveau relevé</button>" : "") +
      (pr.perime ? '<div class="gst-alert gst-alert--warning"><svg class="gst-icon gst-alert__ico"><use href="#i-history"/></svg><div><div class="gst-alert__title">Prix périmé · &gt; 6 mois</div><div class="gst-alert__text">Relevé du ' + APP.dshort(pr.date) + " — à revérifier avant usage. Signalé partout où l'article apparaît.</div></div><span></span></div>" : "") +
      '<div class="mv-g3">' + APP.kpi("Prix de référence", f(pr.montant), { unit: "F / " + esc(a.unite), cls: "mv-kpi--brand", sub: esc(pr.marche || "") }) + APP.kpi("Relevé", pr.date ? APP.dshort(pr.date) : "—", { sub: pr.perime ? "Périmé" : "Frais", subTone: pr.perime ? "bad" : "good" }) + APP.kpi("Utilisé dans", used.length + " recensement(s)") + "</div>" +
      '<div class="mv-g2">' + APP.card("Historique des prix", APP.spark(pts) + '<div class="mv-tw"><table class="mv-t"><thead><tr><th>Date</th><th class="n">Montant</th><th>Marché</th><th>Source</th><th>Statut</th></tr></thead><tbody>' + hist.map(function (h) { return "<tr><td>" + APP.dshort(h.date) + '</td><td class="n">' + f(h.montant) + "</td><td>" + esc(h.marche) + "</td><td>" + esc(h.source) + "</td><td>" + APP.badge(h.statut) + "</td></tr>"; }).join("") + "</tbody></table></div>", { ico: "history" }) +
      APP.card("Où il apparaît", used.length ? '<div class="mv-list">' + used.map(function (u) { return '<div class="mv-li"><span class="mv-ico">' + ico("package") + '</span><div class="mv-li__m"><b>' + esc(u) + "</b></div></div>"; }).join("") + "</div>" : '<p class="mv-muted" style="margin:0">Pas encore utilisé.</p>', { ico: "package" }) + "</div>";
  }, mount: function (el, p) {
    var b = el.querySelector("[data-new-px]"); if (!b) return;
    b.onclick = function () {
      var a = APP.article(p.id);
      var m = APP.modal('<span class="gst-tag">NOUVEAU RELEVÉ · ' + esc(a.nom.toUpperCase()) + '</span><form class="mv-form mv-form--2" data-npx style="margin-top:12px">' + APP.field("Montant", APP.input("np-m", APP.prix(a.id).montant, { money: true }), { req: true }) + APP.field("Date", APP.input("np-d", APP.state.today, { type: "date" })) + APP.field("Marché / fournisseur", APP.input("np-mk", APP.prix(a.id).marche || ""), { cls: "is-full" }) + '<div class="mv-row is-full"><button class="gst-btn gst-btn--primary" type="submit">Enregistrer</button><button class="gst-btn gst-btn--ghost" type="button" data-close>Annuler</button></div></form>');
      m.querySelector("[data-npx]").onsubmit = function (e) {
        e.preventDefault(); var old = APP.prix(a.id).montant, nv = APP.money(m.querySelector("#np-m").value);
        APP.commit("prix", function () { a.prix.push({ id: APP.uid("px"), montant: nv, marche: m.querySelector("#np-mk").value, date: m.querySelector("#np-d").value, source: "Relevé terrain", statut: "validé" }); }, { log: ["Base de prix · " + a.nom, "Prix", old, nv] });
        APP.closeDrawer(); G.toast("Relevé enregistré — les recensements se recalculent", { tag: ".00 / BASE DE PRIX", tone: "success" });
      };
    };
  } });

  /* ══ Journal (M0.6) ════════════════════════════════════════════════════ */
  APP.route("/app/journal", { title: "Journal", perm: "journal", crumb: "SOCLE / JOURNAL D'ACTIVITÉ", render: function (p) {
    var fc = p.q.c || "", fp = p.q.p || "", fo = (p.q.o || "").toLowerCase();
    var J = APP.state.journal.filter(function (j) { return (!fc || j.camp === fc) && (!fp || j.auteur === fp) && (!fo || j.objet.toLowerCase().indexOf(fo) > -1); });
    var auteurs = {}; APP.state.journal.forEach(function (j) { auteurs[j.auteur] = 1; });
    return APP.head(".00 / JOURNAL", "Qui a changé quoi", "Chaque modification de montant ou de quantité est enregistrée : auteur, horodatage, ancienne et nouvelle valeur. Le journal est en lecture seule — personne, pas même le chef de groupe, ne peut effacer une entrée.", '<button class="gst-btn gst-btn--secondary" data-exp>' + ico("download", "gst-icon--sm") + "Exporter</button>") +
      '<div class="mv-card"><div class="mv-row">' + APP.select("jr-c", APP.state.camps.map(function (c) { return [c.id, c.court]; }), fc, { ph: "Tous les camps" }) + APP.select("jr-p", Object.keys(auteurs).map(function (a) { return [a, APP.pname(a)]; }), fp, { ph: "Toutes les personnes" }) + APP.select("jr-o", ["Dépense", "Recensement", "Budget", "Base de prix", "Cuisine", "Inventaire", "Inscription", "Camp", "Annuaire"].map(function (o) { return [o, o]; }), p.q.o || "", { ph: "Tous les objets" }) + '<span class="gst-badge gst-badge--ink">' + ico("lock", "gst-icon--sm") + " inaltérable</span></div>" +
      '<div class="mv-tw"><table class="mv-t"><thead><tr><th>Horodatage</th><th>Auteur</th><th>Camp</th><th>Objet</th><th>Champ</th><th class="n">Avant</th><th class="n">Après</th></tr></thead><tbody>' + J.slice(0, 200).map(function (j) { return "<tr><td>" + esc(j.t.replace("T", " · ")) + "</td><td>" + esc(APP.pname(j.auteur, true)) + "</td><td>" + esc(j.camp ? APP.camp(j.camp).court : "—") + "</td><td>" + esc(j.objet) + "</td><td>" + esc(j.champ) + '</td><td class="n mv-muted"><s>' + esc(j.avant) + '</s></td><td class="n"><b>' + esc(j.apres) + "</b></td></tr>"; }).join("") + "</tbody></table></div></div>";
  }, mount: function (el) {
    ["c", "p", "o"].forEach(function (k) { el.querySelector("#jr-" + k).onchange = function () { APP.go("#/app/journal?c=" + el.querySelector("#jr-c").value + "&p=" + el.querySelector("#jr-p").value + "&o=" + encodeURIComponent(el.querySelector("#jr-o").value)); }; });
    el.querySelector("[data-exp]").onclick = function () { APP.csv("journal-gst", [["horodatage", "auteur", "camp", "objet", "champ", "avant", "après"]].concat(APP.state.journal.map(function (j) { return [j.t, APP.pname(j.auteur), j.camp, j.objet, j.champ, j.avant, j.apres]; }))); };
  } });

  /* ══ Rôles & accès (M0.1) ══════════════════════════════════════════════ */
  APP.route("/app/roles", { title: "Rôles & accès", perm: "roles", crumb: "SOCLE / RÔLES", render: function () {
    var c = APP.camp(), R = APP.state.roles[c.id] || {};
    var people = APP.state.personnes.filter(function (p) { return p.encadrant; });
    var rows = people.map(function (p) {
      var rr = R[p.id] || [];
      return '<tr><td><span class="mv-row" style="gap:10px;flex-wrap:nowrap"><span class="gst-avatar">' + APP.initials(p) + "</span>" + esc(p.prenom + " " + p.nom) + "</span></td><td>" + (rr.length ? rr.map(function (r) { var k = r.split(":")[0]; return '<span class="gst-badge gst-badge--brand">' + esc((S.ROLES[k] ? S.ROLES[k].nom : k) + (r.split(":")[1] ? " · " + r.split(":")[1] : "")) + "</span> "; }).join("") : '<span class="mv-muted">participant</span>') + '</td><td><button class="gst-btn gst-btn--ghost gst-btn--sm" data-role="' + p.id + '">Modifier</button></td></tr>';
    }).join("");
    var matrix = [["Chef de groupe", "Total"], ["Commissaire logistique", "Module 1 complet"], ["Responsable de groupe", "Son groupe"], ["Trésorier / comptable", "Module 2 complet"], ["Responsable cuisine", "Module 3 intendance"], ["Chef d'unité", "Son unité"], ["Scout / jeune", "Espace jeune"], ["Parent / tuteur", "Espace famille"], ["Public", "Lecture publique"]];
    return APP.head(".00 / RÔLES & ACCÈS", "Rôles par personne et par camp", "Un même individu peut être responsable matériel sur un camp et simple participant sur un autre. Un rôle attribué sur un camp ne donne aucun droit sur un autre camp.") +
      '<div class="mv-split">' + APP.card("Attributions · " + esc(c.court), '<div class="mv-tw"><table class="mv-t"><thead><tr><th>Personne</th><th>Rôles sur ce camp</th><th></th></tr></thead><tbody>' + rows + "</tbody></table></div>", { ico: "lock", tag: "CAMP COURANT" }) +
      APP.card("Neuf rôles", '<div class="mv-list">' + matrix.map(function (m) { return '<div class="mv-li"><div class="mv-li__m"><b>' + m[0] + '</b></div><span class="mv-li__v">' + m[1] + "</span></div>"; }).join("") + '</div><div class="gst-alert"><svg class="gst-icon gst-alert__ico"><use href="#i-shield-check"/></svg><div><div class="gst-alert__title">Testé par tentative d\'accès direct</div><div class="gst-alert__text">Connectez-vous en « Responsable de groupe » puis ouvrez <a href="#/app/depenses">#/app/depenses</a> : l\'accès est refusé.</div></div><span></span></div>', { ico: "users" }) + "</div>";
  }, mount: function (el) {
    var c = APP.camp();
    el.querySelectorAll("[data-role]").forEach(function (b) {
      b.onclick = function () {
        var pid = b.dataset.role, cur = (APP.state.roles[c.id][pid] || [])[0] || "participant";
        var opts = [["participant", "Participant"], ["chef", "Chef de groupe"], ["commissaire", "Commissaire logistique"], ["tresorier", "Trésorière"], ["cuisine", "Responsable cuisine"], ["sante", "Responsable santé"]].concat("ABCDEGHIJ".split("").map(function (L) { return ["respgroupe:" + L, "Responsable de groupe · " + L + " " + S.GROUPES[L].nom]; })).concat(APP.state.unites.map(function (u) { return ["chefunite:" + u.id, "Chef d'unité · " + u.nom]; }));
        var m = APP.modal('<span class="gst-tag">RÔLE · ' + esc(c.court.toUpperCase()) + '</span><h4 class="gst-display-md" style="margin:10px 0">' + esc(APP.pname(pid)) + "</h4>" + APP.field("Rôle sur ce camp", APP.select("rl-r", opts, cur)) + '<div class="mv-row" style="margin-top:16px"><button class="gst-btn gst-btn--primary" data-ok>Attribuer</button><button class="gst-btn gst-btn--ghost" data-close>Annuler</button></div>');
        m.querySelector("[data-ok]").onclick = function () { var v = m.querySelector("#rl-r").value; APP.closeDrawer(); APP.commit("rôle", function (st) { st.roles[c.id][pid] = v === "participant" ? [] : [v]; }, { log: ["Rôles · " + c.court, APP.pname(pid), cur, v] }); G.toast("Rôle attribué sur ce camp uniquement", { tag: ".00 / RÔLES", tone: "success" }); };
      };
    });
  } });
})();
