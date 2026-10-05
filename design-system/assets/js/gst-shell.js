/* GST GOVERNMENT — Shell de la documentation du design system.
   Barre supérieure, cadre permanent, modes Jour / Nuit / Plein soleil,
   réduction des animations, transitions M7, réticule-curseur, pied de chapitre. */
(function () {
  "use strict";
  var GST = window.GST;
  var root = document.documentElement;

  var PAGES = [
    { href: "index.html", idx: ".00", label: "Ouverture", desc: "Concept, note d'intention, chaîne de chiffrage" },
    { href: "fondations.html", idx: ".01", label: "Fondations", desc: "Couleurs, modes, typographie, grille, espacements, icônes" },
    { href: "motion.html", idx: ".02", label: "Motion", desc: "Le trait, le calcul, l'éclair — M1 → M11" },
    { href: "composants.html", idx: ".03", label: "Composants", desc: "52 composants, variantes, états, accessibilité" },
    { href: "ecrans.html", idx: ".04", label: "Écrans", desc: "Haute fidélité mobile 390 & desktop 1440" },
    { href: "roadmap.html", idx: ".05", label: "Roadmap 3D", desc: "Le Circuit du Camp — diorama et frise 2D" },
    { href: "bus.html", idx: ".06", label: "Bus volant", desc: "Le Bus du Tonnerre — inscriptions et décollage" },
    { href: "guide.html", idx: ".07", label: "Guide", desc: "Quand utiliser quoi, erreurs à éviter" }
  ];
  GST.PAGES = PAGES;
  var here = location.pathname.split("/").pop() || "index.html";
  var current = PAGES.findIndex(function (p) { return p.href === here; });
  if (current < 0) current = 0;

  /* Ligne de crête — motif tiré de la montagne du logo (approximation à
     remplacer par la vectorisation officielle de la crête). */
  GST.CREST_D = "M2 58 L20 41 L27 45 L40 27 L48 33 L61 9 L68 19 L75 15 L90 35 L98 31 L118 58";
  GST.BOLT_D = "M80 -16 L68 1 L74 2 L62 10";
  GST.lockup = function (size) {
    return '<svg viewBox="0 -18 120 78" class="doc-crest" aria-hidden="true" style="width:' + (size || 40) + 'px;height:auto;overflow:visible">' +
      '<path d="' + GST.CREST_D + '" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<path d="' + GST.BOLT_D + '" fill="none" stroke="var(--gst-eclair-deep)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  };

  function icon(id, cls) { return '<svg class="gst-icon ' + (cls || "") + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  GST.icon = icon;

  /* ── Thème & motion (persistés pour ce lecteur uniquement) ────────────── */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  GST.setTheme = function (t) {
    if (t === "jour") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", t);
    store("gst-theme", t);
    document.querySelectorAll("[data-theme-btn]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.themeBtn === t ? "true" : "false"); });
    document.querySelectorAll(".doc-theme").forEach(function (s) { s._inkUpdate && s._inkUpdate(); });
    window.dispatchEvent(new CustomEvent("gst-theme", { detail: t }));
  };
  GST.theme = function () { return root.getAttribute("data-theme") || "jour"; };
  GST.setMotion = function (reduce) {
    if (reduce) root.setAttribute("data-motion", "reduce"); else root.removeAttribute("data-motion");
    store("gst-motion", reduce ? "reduce" : "full");
    var b = document.querySelector("[data-motion-btn]");
    if (b) { b.setAttribute("aria-pressed", reduce ? "true" : "false"); b.title = reduce ? "Animations réduites" : "Animations complètes"; }
    var c = document.querySelector("[data-motion-chk]"); if (c) c.checked = !!reduce;
    window.dispatchEvent(new CustomEvent("gst-motion", { detail: reduce }));
  };

  /* ── Construction du shell ───────────────────────────────────────────── */
  function build() {
    var body = document.body;
    body.classList.add("doc");
    var overlay = body.hasAttribute("data-top-overlay");

    var frame = document.createElement("div");
    frame.className = "doc-frame"; frame.setAttribute("aria-hidden", "true");
    body.appendChild(frame);

    var skip = document.createElement("a");
    skip.className = "doc-skip"; skip.href = "#main"; skip.textContent = "Aller au contenu";
    body.insertBefore(skip, body.firstChild);

    var top = document.createElement("header");
    top.className = "doc-top" + (overlay ? " doc-top--overlay" : "");
    var t = GST.theme();
    top.innerHTML =
      '<a class="doc-brand" href="index.html" aria-label="GST Government — accueil du design system">' + GST.lockup(38) +
      '<span><b>GST GOVERNMENT</b><span class="gst-tag">Design system · v1.1</span></span></a>' +
      '<nav class="doc-nav" aria-label="Chapitres">' + PAGES.map(function (p, i) {
        return '<a href="' + p.href + '"' + (i === current ? ' aria-current="page"' : "") + '><span class="doc-nav__i">' + p.idx + "</span>" + p.label + "</a>";
      }).join("") + "</nav>" +
      '<span class="doc-top__sp"></span>' +
      '<div class="gst-seg gst-seg--sm doc-theme" role="group" aria-label="Mode d\'affichage">' +
      ["jour", "nuit", "soleil"].map(function (m) {
        var ic = m === "jour" ? "sun" : m === "nuit" ? "moon" : "sun-medium";
        var lab = m === "jour" ? "Jour" : m === "nuit" ? "Nuit" : "Soleil";
        return '<button type="button" data-theme-btn="' + m + '" aria-pressed="' + (t === m) + '" title="Mode ' + lab + '">' + icon(ic, "gst-icon--sm") + '<span class="doc-hide-sm">' + lab + "</span></button>";
      }).join("") + "</div>" +
      '<button type="button" class="gst-icon-btn doc-motion-btn" data-motion-btn aria-pressed="' + (root.getAttribute("data-motion") === "reduce") + '" aria-label="Réduire les animations">' + icon("eye-off") + "</button>" +
      '<button type="button" class="gst-icon-btn doc-menu-btn" aria-label="Ouvrir le sommaire" aria-expanded="false">' + icon("menu") + "</button>";
    body.insertBefore(top, skip.nextSibling);

    var seg = top.querySelector(".doc-theme");
    seg.setAttribute("data-manual", "");
    top.querySelectorAll("[data-theme-btn]").forEach(function (b) {
      b.addEventListener("click", function () { GST.setTheme(b.dataset.themeBtn); });
    });
    top.querySelector("[data-motion-btn]").addEventListener("click", function () {
      GST.setMotion(root.getAttribute("data-motion") !== "reduce");
    });

    /* Tiroir sommaire (mobile) */
    var scrim = document.createElement("div"); scrim.className = "gst-scrim";
    var drawer = document.createElement("aside");
    drawer.className = "gst-drawer gst-drawer--right doc-drawer";
    drawer.setAttribute("aria-label", "Sommaire"); drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = '<div class="gst-drawer__head"><span class="gst-tag">N° / Sommaire</span><button class="gst-icon-btn gst-icon-btn--ghost" aria-label="Fermer">' + icon("x") + "</button></div>" +
      '<nav class="gst-drawer__body doc-drawer__nav">' + PAGES.map(function (p, i) {
        return '<a href="' + p.href + '"' + (i === current ? ' aria-current="page"' : "") + '><span class="gst-tag">' + p.idx + '</span><b>' + p.label + "</b><small>" + p.desc + "</small></a>";
      }).join("") +
      '<div class="doc-drawer__set"><span class="gst-tag">Mode d\'affichage</span>' +
      '<div class="gst-seg doc-theme" role="group" aria-label="Mode d\'affichage">' + ["jour", "nuit", "soleil"].map(function (m) {
        return '<button type="button" data-theme-btn="' + m + '" aria-pressed="' + (t === m) + '">' + (m === "jour" ? "Jour" : m === "nuit" ? "Nuit" : "Soleil") + "</button>";
      }).join("") + "</div>" +
      '<label class="gst-toggle"><input type="checkbox" data-motion-chk' + (root.getAttribute("data-motion") === "reduce" ? " checked" : "") + '><span class="gst-toggle__track"></span><span class="gst-ui">Réduire les animations</span></label></div>' +
      "</nav>";
    body.appendChild(scrim); body.appendChild(drawer);
    drawer.querySelector(".doc-theme").setAttribute("data-manual", "");
    drawer.querySelectorAll("[data-theme-btn]").forEach(function (b) { b.addEventListener("click", function () { GST.setTheme(b.dataset.themeBtn); }); });
    drawer.querySelector("[data-motion-chk]").addEventListener("change", function (e) { GST.setMotion(e.target.checked); });
    var menuBtn = top.querySelector(".doc-menu-btn");
    function setDrawer(open) {
      drawer.classList.toggle("is-open", open); scrim.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", open ? "false" : "true"); menuBtn.setAttribute("aria-expanded", open);
      if (open) drawer.querySelector("a").focus();
    }
    menuBtn.addEventListener("click", function () { setDrawer(true); });
    scrim.addEventListener("click", function () { setDrawer(false); });
    drawer.querySelector(".gst-drawer__head button").addEventListener("click", function () { setDrawer(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setDrawer(false); });

    /* Pied de chapitre : précédent / suivant */
    if (!body.hasAttribute("data-no-footer")) {
      var prev = PAGES[current - 1], next = PAGES[current + 1];
      var foot = document.createElement("footer");
      foot.className = "doc-foot";
      foot.innerHTML =
        '<div class="doc-foot__nav">' +
        (prev ? '<a class="doc-foot__link" href="' + prev.href + '"><span class="gst-tag">← ' + prev.idx + " / Précédent</span><b>" + prev.label + "</b></a>" : "<span></span>") +
        (next ? '<a class="doc-foot__link doc-foot__link--next" href="' + next.href + '"><span class="gst-tag">' + next.idx + " / Suivant →</span><b>" + next.label + "</b></a>" : "<span></span>") +
        "</div>" +
        '<div class="doc-foot__base"><span class="gst-fleur" aria-hidden="true">⚜</span>' +
        '<span class="gst-tag">Groupe Scout Tonnerre · District Golfe · depuis 2013</span>' +
        '<span class="gst-tag">Association Scoute du Togo</span>' +
        '<span class="gst-tag">@associationscoutedutogo · @groupesscouttonnerre</span></div>';
      body.appendChild(foot);
    }

    /* Transitions M7 sur les liens internes */
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      var href = a.getAttribute("href");
      if (!/^[\w-]+\.html(#.*)?$/.test(href) || href.split("#")[0] === here && href.indexOf("#") > -1) return;
      var p = PAGES.find(function (x) { return x.href === href.split("#")[0]; });
      if (!p) return;
      e.preventDefault();
      GST.wipe(href, p.idx + " / " + p.label);
    });
  }

  /* ── Réticule-curseur (registre Ciel, pointeur fin uniquement) ────────── */
  /* v1.1 : le réticule-curseur est retiré (plus de quadrillage). Fonction conservée, inerte. */
  GST.crosshair = function (host) {
    return;
    var h = document.createElement("i"), v = document.createElement("i"), r = document.createElement("i"), lab = document.createElement("span");
    h.className = "doc-xh doc-xh--h"; v.className = "doc-xh doc-xh--v"; r.className = "doc-xh doc-xh--r"; lab.className = "doc-xh doc-xh--lab";
    [h, v, r, lab].forEach(function (n) { n.setAttribute("aria-hidden", "true"); host.appendChild(n); });
    var raf, px = 0, py = 0;
    host.addEventListener("pointermove", function (e) {
      var b = host.getBoundingClientRect(); px = e.clientX - b.left; py = e.clientY - b.top;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        h.style.transform = "translateY(" + py + "px)"; v.style.transform = "translateX(" + px + "px)";
        r.style.transform = "translate(" + (px - 6) + "px," + (py - 6) + "px)";
        lab.style.transform = "translate(" + (px + 14) + "px," + (py + 12) + "px)";
        lab.textContent = "X " + String(Math.round(px)).padStart(4, "0") + " · Y " + String(Math.round(py)).padStart(4, "0");
      });
    });
    host.addEventListener("pointerenter", function () { host.classList.add("has-xh"); });
    host.addEventListener("pointerleave", function () { host.classList.remove("has-xh"); });
  };

  /* Mise à l'échelle des maquettes desktop 1440 dans leur conteneur */
  GST.fitScreens = function () {
    document.querySelectorAll("[data-fit]").forEach(function (box) {
      var inner = box.firstElementChild; if (!inner) return;
      var w = +box.getAttribute("data-fit") || 1440;
      var s = Math.min(1, box.clientWidth / w);
      inner.style.transform = "scale(" + s + ")";
      box.style.height = inner.offsetHeight * s + "px";
    });
  };

  function init() {
    build();
    GST.setTheme(GST.theme());
    GST.wireTabs();
    document.querySelectorAll("[data-crosshair]").forEach(GST.crosshair);
    GST.fitScreens();
    addEventListener("resize", GST.fitScreens);
    GST.wipeIn().then(function () {
      GST.reveal();
      document.dispatchEvent(new CustomEvent("gst-ready"));
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
