/* GST GOVERNMENT — Composants graphiques (Chart ligne, barres jumelles).
   Axes hairline, graduations en tags mono, aucune grille pleine.
   Prévu = teal pointillé · Réel = rouge plein + voile léger · points = disques 9 px.
   Info-bulle = mini fiche technique. Barres arrondies. Jamais de dégradé. */
(function () {
  "use strict";
  var GST = window.GST;
  var S = GST.svg;

  /* ── Chart ligne : prévu / réel (M9) ───────────────────────────────────
     o = { labels:[], planned:[], actual:[], unit:"k F CFA", max, onPoint(i) } */
  GST.chartLine = function (host, o) {
    host.innerHTML = "";
    host.style.position = "relative";
    var W = 640, H = 300, L = 54, R = 16, T = 18, B = 34;
    var n = o.labels.length;
    var max = o.max || Math.ceil(Math.max.apply(null, o.planned.concat(o.actual)) / 1000) * 1000;
    var x = function (i) { return L + (W - L - R) * (i / (n - 1)); };
    var y = function (v) { return T + (H - T - B) * (1 - v / max); };
    var svg = S("svg", { viewBox: "0 0 " + W + " " + H, class: "gst-chart", role: "img", "aria-label": o.aria || "Courbe de dépense cumulée, prévu contre réel" }, host);
    // Graduations
    var ticks = o.ticks || 5;
    for (var k = 0; k <= ticks; k++) {
      var v = (max / ticks) * k, yy = y(v);
      if (k > 0) S("line", { x1: L, y1: yy, x2: L + 6, y2: yy, class: "axis" }, svg);
      var t = S("text", { x: L - 8, y: yy + 3, "text-anchor": "end", class: "tick-label" }, svg);
      t.textContent = GST.fmt(v);
    }
    o.labels.forEach(function (lab, i) {
      if (i % (o.every || 1)) return;
      S("line", { x1: x(i), y1: H - B, x2: x(i), y2: H - B + 5, class: "axis" }, svg);
      var t = S("text", { x: x(i), y: H - B + 18, "text-anchor": "middle", class: "tick-label" }, svg);
      t.textContent = lab;
    });
    S("line", { x1: L, y1: H - B, x2: W - R, y2: H - B, class: "axis" }, svg);
    S("line", { x1: L, y1: T, x2: L, y2: H - B, class: "axis" }, svg);
    var unit = S("text", { x: L, y: 10, class: "tick-label" }, svg); unit.textContent = (o.unit || "").toUpperCase();
    var cursor = S("line", { x1: 0, y1: T, x2: 0, y2: H - B, class: "cursor", opacity: 0 }, svg);
    var path = function (arr) { return arr.map(function (v, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); }).join(" "); };
    S("path", { d: path(o.actual) + " L" + x(n - 1).toFixed(1) + " " + (H - B) + " L" + x(0).toFixed(1) + " " + (H - B) + " Z", class: "area" }, svg);
    var pp = S("path", { d: path(o.planned), class: "planned" }, svg);
    var ap = S("path", { d: path(o.actual), class: "actual" }, svg);
    var pts = o.actual.map(function (v, i) {
      var r = S("circle", { cx: x(i), cy: y(v), r: 4.5, class: "pt", tabindex: 0, role: "button",
        "aria-label": o.labels[i] + " — réel " + GST.fmt(v) + ", prévu " + GST.fmt(o.planned[i]) }, svg);
      return r;
    });
    var tip = document.createElement("div");
    tip.className = "gst-chart-tip";
    tip.setAttribute("aria-hidden", "true");
    host.appendChild(tip);
    function show(i, pin) {
      var hb = host.getBoundingClientRect(), sb = svg.getBoundingClientRect();
      var sx = sb.width / W, sy = sb.height / H;
      cursor.setAttribute("x1", x(i)); cursor.setAttribute("x2", x(i)); cursor.setAttribute("opacity", 1);
      pts.forEach(function (p, j) { p.classList.toggle("is-active", j === i); });
      var d = o.actual[i] - o.planned[i], pct = (d / o.planned[i]) * 100;
      tip.innerHTML = '<span class="gst-tag">' + o.labels[i] + " / " + (o.tipTitle || "CUMUL") + "</span>" +
        '<dl class="gst-spec"><dt>Prévu</dt><dd>' + GST.fmt(o.planned[i]) + "</dd><dt>Réel</dt><dd>" + GST.fmt(o.actual[i]) +
        '</dd><dt>Écart</dt><dd class="' + (d > 0 ? "gst-accent" : "") + '">' + (d > 0 ? "+" : "") + GST.fmt(d) + " · " + (pct > 0 ? "+" : "") + pct.toFixed(1).replace(".", ",") + " %</dd></dl>";
      var px = (x(i) * sx) + (sb.left - hb.left), py = (y(o.actual[i]) * sy) + (sb.top - hb.top);
      tip.style.left = Math.min(hb.width - 200, Math.max(0, px + 14)) + "px";
      tip.style.top = Math.max(0, py - 90) + "px";
      tip.classList.add("is-on");
      if (pin && o.onPoint) o.onPoint(i);
    }
    function hide() { tip.classList.remove("is-on"); cursor.setAttribute("opacity", 0); pts.forEach(function (p) { p.classList.remove("is-active"); }); }
    pts.forEach(function (p, i) {
      p.addEventListener("mouseenter", function () { show(i); });
      p.addEventListener("focus", function () { show(i); });
      p.addEventListener("click", function () { show(i, true); });
      p.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(i, true); }
        if (e.key === "ArrowRight" && pts[i + 1]) pts[i + 1].focus();
        if (e.key === "ArrowLeft" && pts[i - 1]) pts[i - 1].focus();
      });
    });
    svg.addEventListener("mouseleave", hide);
    function play() {
      pts.forEach(function (p) { p.style.opacity = 0; });
      GST.draw(pp, { duration: 700 });
      // Le réel « rattrape » le prévu : tracé plus lent, départ décalé
      GST.draw(ap, { duration: 1300, delay: 260 });
      pts.forEach(function (p, i) {
        setTimeout(function () { p.style.opacity = 1; GST.pop(p, 0); }, GST.reduced() ? 0 : 260 + (1300 * i) / (n - 1));
      });
    }
    play();
    return { play: play, show: show, hide: hide, svg: svg };
  };

  /* ── Barres jumelles : taux de proposition (A) vs sélection (B) ──────── */
  GST.rateBars = function (host, items, o) {
    o = o || {};
    host.innerHTML = items.map(function (it) {
      return '<div class="gst-rate"><span class="gst-rate__name">' + it.nom + '</span><div class="gst-rate__bars">' +
        '<div class="gst-rate__bar gst-rate__bar--a"><i style="width:' + it.a + '%;transform:scaleX(0)"></i><span>' + it.a + ' %</span></div>' +
        '<div class="gst-rate__bar gst-rate__bar--b"><i style="width:' + it.b + '%;transform:scaleX(0)"></i><span>' + it.b + " %</span></div></div></div>";
    }).join("");
    var bars = host.querySelectorAll("i");
    var stg = GST.reduced() ? 0 : 56;
    bars.forEach(function (b, i) { setTimeout(function () { b.style.transform = "scaleX(1)"; }, 60 + Math.floor(i / 2) * stg); });
  };
})();
