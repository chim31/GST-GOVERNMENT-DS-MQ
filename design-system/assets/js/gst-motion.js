/* ═══════════════════════════════════════════════════════════════════════
   GST GOVERNMENT — Moteur de motion « Le trait, le calcul, l'éclair »
   Vanilla JS + Web Animations API. Zéro dépendance. ~ 9 Ko minifié.

   M1  GST.traceGrid / GST.traceBox   Éclosion · contour arrondi (v1.1 : sans grille)
   M2  GST.decode                     Décodage de tag
   M3  GST.rise                       Levée Bebas
   M4  GST.odometer                   Odomètre
   M5  GST.wave                       Onde de recalcul (chaîne de chiffrage)
   M6  GST.strike                     Frappe de l'Éclair
   M7  GST.wipe                       Volet de cadre (transition de page)
   M8  GST.stamp                      Tampon de validation
   M9  GST.draw                       Courbe tracée
   M10 GST.crest                      Crête du Tonnerre
   M11 GST.syncFlush                  Synchronisation

   Lois : le trait d'abord · tout part d'un nœud · le chiffre se calcule ·
          l'éclair est rare · la beauté ne bloque jamais.
   Toute animation est interruptible et respecte prefers-reduced-motion
   (fondu 120 ms, état final immédiat).
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var root = document.documentElement;
  var GST = (window.GST = window.GST || {});
  var SVGNS = "http://www.w3.org/2000/svg";

  /* ── Tokens ──────────────────────────────────────────────────────────── */
  GST.token = function (name, el) { return getComputedStyle(el || root).getPropertyValue(name).trim(); };
  GST.ms = function (name) { var v = GST.token(name); return v ? parseFloat(v) * (v.indexOf("ms") > -1 ? 1 : 1000) : 0; };
  GST.ease = function (name) { return GST.token("--gst-ease-" + name) || "ease-out"; };
  GST.reduced = function () {
    return root.getAttribute("data-motion") === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };
  GST.wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  GST.svg = function (tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  /* Durées de référence (lues dans les tokens, avec repli). */
  function D(name, fallback) { var v = GST.ms("--gst-dur-" + name); return isNaN(v) || v === 0 && name !== "scene" && name !== "epic" ? fallback : v; }
  function S(name, fallback) { var v = GST.ms("--gst-stagger-" + name); return isNaN(v) ? fallback : v; }

  /* ── Formats ─────────────────────────────────────────────────────────── */
  var NNBSP = " ", NBSP = " ";
  GST.fmt = function (n) {
    var s = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
    return (n < 0 ? "−" : "") + s;
  };
  GST.fcfa = function (n) { return GST.fmt(n) + NBSP + "F" + NBSP + "CFA"; };

  /* ── Ressort « seat » : { stiffness 420, damping 28, mass 0.8 } ────────
     Simulé une fois, échantillonné en images-clés WAAPI (linéaires).     */
  GST.spring = function (cfg) {
    cfg = cfg || {};
    var k = cfg.stiffness || 420, c = cfg.damping || 28, m = cfg.mass || 0.8;
    var x = 0, v = 0, dt = 1 / 240, t = 0, out = [0];
    while (t < 2) {
      var a = (-k * (x - 1) - c * v) / m;
      v += a * dt; x += v * dt; t += dt;
      if (Math.round(t * 240) % 4 === 0) out.push(x);
      if (Math.abs(x - 1) < 0.0005 && Math.abs(v) < 0.005 && t > 0.1) break;
    }
    out.push(1);
    return { samples: out, duration: Math.round(t * 1000) };
  };
  var SEAT = GST.spring();
  /* Variante plus élastique pour les objets qui tombent (pins), même famille. */
  var DROP = GST.spring({ stiffness: 420, damping: 16, mass: 0.8 });
  GST.springFrames = function (fn, spring) {
    spring = spring || SEAT;
    return { frames: spring.samples.map(function (s) { return fn(s); }), duration: spring.duration };
  };
  GST.SPRING_SEAT = SEAT;
  GST.SPRING_DROP = DROP;

  /* ── Courbes en JS (pour rAF et caméras 3D) ─────────────────────────── */
  GST.bezier = function (x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; }
    function b(p1, p2) { return 3 * p2 - 6 * p1; }
    function c(p1) { return 3 * p1; }
    function calc(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) {
      if (x <= 0) return 0; if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) { var s = slope(t, x1, x2); if (Math.abs(s) < 1e-6) break; t -= (calc(t, x1, x2) - x) / s; }
      if (t < 0 || t > 1) { var lo = 0, hi = 1; t = x; for (var j = 0; j < 20; j++) { var v = calc(t, x1, x2); if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; } }
      return calc(t, y1, y2);
    };
  };
  var easeCache = {};
  GST.easeFn = function (name) {
    if (easeCache[name]) return easeCache[name];
    var m = (GST.ease(name) || "").match(/cubic-bezier\(([^)]+)\)/);
    var p = m ? m[1].split(",").map(parseFloat) : [0.16, 1, 0.3, 1];
    return (easeCache[name] = GST.bezier(p[0], p[1], p[2], p[3]));
  };
  /* Interpolation rAF : fn(progressÉasé, progressBrut). Interruptible : renvoie { stop, finished }. */
  GST.tween = function (duration, fn, easeName, delay) {
    var e = typeof easeName === "function" ? easeName : GST.easeFn(easeName || "tonnerre");
    var raf, stopped = false, resolveF;
    var finished = new Promise(function (r) { resolveF = r; });
    if (GST.reduced() || duration <= 0) { fn(1, 1); resolveF(); return { stop: function () {}, finished: finished }; }
    var t0 = performance.now() + (delay || 0);
    function step(now) {
      if (stopped) return;
      var p = Math.min(1, Math.max(0, (now - t0) / duration));
      fn(e(p), p);
      if (p < 1) raf = requestAnimationFrame(step); else resolveF();
    }
    raf = requestAnimationFrame(step);
    return { stop: function () { stopped = true; cancelAnimationFrame(raf); resolveF(); }, finished: finished };
  };

  GST.anim = function (el, frames, opts) {
    if (!el || !el.animate) return { finished: Promise.resolve(), cancel: function () {} };
    if (GST.reduced() && !(opts && opts.force)) {
      var last = Array.isArray(frames) ? frames[frames.length - 1] : null;
      var a = el.animate(last ? [Object.assign({}, last, { opacity: last.opacity != null ? last.opacity : 1 })] : frames,
        { duration: 120, fill: (opts && opts.fill) || "none", easing: "linear" });
      return a;
    }
    return el.animate(frames, Object.assign({ fill: "both" }, opts));
  };

  /* ══ M2 · Décodage de tag ═════════════════════════════════════════════ */
  var GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/.-+";
  GST.decode = function (el, text, opts) {
    opts = opts || {};
    text = text != null ? String(text) : (el.getAttribute("data-text") || el.textContent);
    el.setAttribute("data-text", text);
    if (el._decodeRaf) cancelAnimationFrame(el._decodeRaf);
    if (GST.reduced()) { el.textContent = text; return Promise.resolve(); }
    var per = opts.per != null ? opts.per : S("tight", 24);
    var lead = opts.lead != null ? opts.lead : 5;
    var start = performance.now() + (opts.delay || 0);
    var n = text.length;
    return new Promise(function (resolve) {
      function tick(now) {
        var t = now - start;
        if (t < 0) { el._decodeRaf = requestAnimationFrame(tick); return; }
        var revealed = Math.floor(t / per);
        var s = "";
        for (var i = 0; i < n; i++) {
          var ch = text[i];
          if (i < revealed || ch === " " || ch === "/" || ch === "·") s += ch;
          else if (i < revealed + lead + n) s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = s;
        if (revealed < n) el._decodeRaf = requestAnimationFrame(tick);
        else { el.textContent = text; el._decodeRaf = null; resolve(); }
      }
      el._decodeRaf = requestAnimationFrame(tick);
    });
  };

  /* ══ M3 · Levée Bebas ═════════════════════════════════════════════════ */
  GST.split = function (el) {
    if (el._split) return el._split;
    var text = el.textContent;
    el.setAttribute("aria-label", text.replace(/\s+/g, " ").trim());
    el.textContent = "";
    var letters = [];
    text.split(/(\s+)/).forEach(function (word) {
      if (/^\s+$/.test(word)) { el.appendChild(document.createTextNode(" ")); return; }
      if (!word) return;
      var mask = document.createElement("span");
      mask.className = "gst-rise__mask";
      mask.setAttribute("aria-hidden", "true");
      for (var i = 0; i < word.length; i++) {
        var l = document.createElement("span");
        l.className = "gst-rise__l";
        l.textContent = word[i];
        mask.appendChild(l);
        letters.push(l);
      }
      el.appendChild(mask);
    });
    el._split = letters;
    return letters;
  };
  GST.rise = function (el, opts) {
    opts = opts || {};
    var letters = GST.split(el);
    var st = opts.stagger != null ? opts.stagger : S("tight", 24);
    var dur = opts.duration || 720;
    var anims = letters.map(function (l, i) {
      return GST.anim(l, [
        { transform: "translateY(105%) scaleY(.92)", opacity: 1 },
        { transform: "translateY(0) scaleY(1)", opacity: 1 }
      ], { duration: dur, delay: (opts.delay || 0) + i * st, easing: GST.ease("tonnerre") });
    });
    return Promise.all(anims.map(function (a) { return a.finished; }));
  };

  /* ══ M1 · Éclosion & contour ══════════════════════════════════════════ */
  GST.drawEl = function (el, opts) {
    opts = opts || {};
    el.setAttribute("pathLength", "1");
    el.style.strokeDasharray = "1";
    var a = GST.anim(el, [{ strokeDashoffset: opts.reverse ? -1 : 1 }, { strokeDashoffset: 0 }],
      { duration: opts.duration || 600, delay: opts.delay || 0, easing: opts.easing || GST.ease("trace") });
    // Une fois tracé, le trait rend la main à son style (pointillés du « prévu », etc.)
    if (a.finished) a.finished.then(function () {
      if (opts.keep) return;
      el.style.strokeDasharray = ""; el.removeAttribute("pathLength");
      try { a.cancel(); } catch (e) {}
    });
    return a;
  };
  GST.pop = function (el, delay, spring) {
    var s = GST.springFrames(function (v) { return { transform: "scale(" + v.toFixed(4) + ")" }; }, spring);
    el.style.transformBox = "fill-box"; el.style.transformOrigin = "center";
    return GST.anim(el, s.frames, { duration: s.duration, delay: delay || 0, easing: "linear" });
  };

  /* M1 v1.1 · Éclosion — plus de quadrillage : le contenu monte en douceur,
     précédé d'un halo teal qui s'ouvre depuis le point d'origine.        */
  GST.traceGrid = function (host, opts) {
    opts = opts || {};
    var old = host.querySelector(":scope > .gst-bloom");
    if (old) old.remove();
    var content = host.querySelectorAll("[data-m1-content]");
    if (GST.reduced()) { content.forEach(function (c) { c.style.opacity = 1; }); return Promise.resolve(); }
    var cs = getComputedStyle(host);
    if (cs.position === "static") host.style.position = "relative";
    var bloom = document.createElement("i");
    bloom.className = "gst-bloom"; bloom.setAttribute("aria-hidden", "true");
    bloom.style.cssText = "position:absolute;left:" + (opts.x != null ? opts.x : 18) + "%;top:" + (opts.y != null ? opts.y : 82) + "%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;pointer-events:none;z-index:0;" +
      "background:radial-gradient(circle,color-mix(in srgb,var(--gst-brand) 34%,transparent) 0%,transparent 70%)";
    host.insertBefore(bloom, host.firstChild);
    var big = Math.max(host.clientWidth, host.clientHeight) / 14;
    GST.anim(bloom, [{ transform: "scale(.2)", opacity: 0 }, { transform: "scale(" + (big * .55).toFixed(2) + ")", opacity: 1, offset: .45 }, { transform: "scale(" + big.toFixed(2) + ")", opacity: 0 }],
      { duration: 1300, easing: GST.ease("tonnerre"), fill: "both" }).finished.then(function () { bloom.remove(); });
    content.forEach(function (c) { c.style.opacity = 0; });
    var stg = S("base", 56);
    content.forEach(function (c, k) {
      GST.anim(c, [{ opacity: 0, transform: "translateY(14px) scale(.98)", filter: "blur(4px)" }, { opacity: 1, transform: "none", filter: "blur(0)" }],
        { duration: 640, delay: 260 + k * stg, easing: GST.ease("tonnerre") });
    });
    return GST.wait(260 + content.length * stg + 640);
  };

  /* Contour arrondi qui se trace avant que le contenu n'apparaisse
     (le tracé épouse le border-radius réel de l'élément). */
  GST.traceBox = function (el, opts) {
    opts = opts || {};
    if (GST.reduced()) { el.style.opacity = 1; return Promise.resolve(); }
    var cs = getComputedStyle(el);
    if (cs.position === "static") el.style.position = "relative";
    var w = el.offsetWidth, h = el.offsetHeight, r = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, w / 2, h / 2);
    var svg = GST.svg("svg", { "aria-hidden": "true", viewBox: "0 0 " + w + " " + h });
    svg.style.cssText = "position:absolute;left:0;top:0;width:" + w + "px;height:" + h + "px;pointer-events:none;overflow:visible;z-index:2";
    var color = opts.color || "var(--gst-line-brand)";
    var p = GST.svg("rect", { x: .75, y: .75, width: w - 1.5, height: h - 1.5, rx: Math.max(0, r - .75), fill: "none", stroke: color, "stroke-width": 1.5 }, svg);
    el.appendChild(svg);
    var kids = Array.prototype.filter.call(el.children, function (c) { return c !== svg; });
    kids.forEach(function (k) { k.style.opacity = 0; });
    var d = opts.delay || 0;
    var a = GST.drawEl(p, { duration: opts.duration || 700, delay: d });
    var stg = S("base", 56);
    kids.forEach(function (k, i) {
      GST.anim(k, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
        { duration: D("slow", 420), delay: d + 320 + i * stg * 0.6, easing: GST.ease("tonnerre") });
    });
    return a.finished.then(function () {
      GST.anim(svg, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }).finished.then(function () { svg.remove(); });
    });
  };

  /* ══ M4 · Odomètre ════════════════════════════════════════════════════ */
  function buildOdo(el, str) {
    el.textContent = "";
    el.classList.add("gst-odo");
    var cols = [];
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (/\d/.test(ch)) {
        var col = document.createElement("span"); col.className = "gst-odo__col"; col.setAttribute("aria-hidden", "true");
        var strip = document.createElement("span"); strip.className = "gst-odo__strip";
        for (var r = 0; r < 30; r++) { var d = document.createElement("span"); d.textContent = r % 10; strip.appendChild(d); }
        col.appendChild(strip); el.appendChild(col);
        strip.style.transform = "translateY(-" + (10 + +ch) + "em)";
        cols.push({ strip: strip, digit: +ch });
      } else {
        var s = document.createElement("span");
        s.setAttribute("aria-hidden", "true");
        if (ch === NNBSP || ch === " ") { s.className = "gst-odo__sep"; } else s.textContent = ch;
        el.appendChild(s);
        cols.push(null);
      }
    }
    el._odo = { str: str, cols: cols };
  }
  GST.odometer = function (el, value, opts) {
    opts = opts || {};
    var format = opts.format || GST.fmt;
    var str = typeof value === "string" ? value : format(value);
    var prevVal = el._odoValue;
    el._odoValue = value;
    el.setAttribute("aria-label", (opts.label ? opts.label + " " : "") + str);
    el.setAttribute("role", "text");
    var prev = el._odo ? el._odo.str : null;
    if (prev == null || GST.reduced() || opts.instant) { buildOdo(el, str); return Promise.resolve(); }
    if (prev === str) return Promise.resolve();
    // Aligne à droite l'ancienne valeur dans la nouvelle structure
    var pad = str.length - prev.length;
    var prevDigits = prev.replace(/\D/g, ""), newDigits = str.replace(/\D/g, "");
    var padded = newDigits.length > prevDigits.length ? Array(newDigits.length - prevDigits.length + 1).join("0") + prevDigits : prevDigits.slice(-newDigits.length);
    if (pad !== 0 || prev.replace(/\d/g, "9") !== str.replace(/\d/g, "9")) buildOdo(el, str.replace(/\d/g, "0"));
    var up = typeof value === "number" && typeof prevVal === "number" ? value >= prevVal : true;
    var cols = el._odo.cols.filter(Boolean);
    var stg = opts.stagger != null ? opts.stagger : 42;
    var dur = opts.duration || 760;
    var anims = [];
    // Ton : favorable / dépassement
    var tone = opts.tone;
    if (tone === "auto") tone = up ? "bad" : "good";
    el.classList.remove("is-good", "is-bad");
    if (tone === "good" || tone === "bad") el.classList.add(tone === "good" ? "is-good" : "is-bad");
    cols.forEach(function (c, i) {
      var from = +padded[i], to = +newDigits[i];
      var a, b;
      if (from === to && i < cols.length - 2 && padded.slice(0, i + 1) === newDigits.slice(0, i + 1)) {
        c.strip.style.transform = "translateY(-" + (10 + to) + "em)"; c.digit = to; return;
      }
      if (up) { a = 10 + from; b = to >= from ? 10 + to : 20 + to; if (from === to) b = 20 + to; }
      else { a = 10 + from; b = to <= from ? 10 + to : to; if (from === to) b = to; }
      c.strip.style.transform = "translateY(-" + b + "em)";
      var an = c.strip.animate([{ transform: "translateY(-" + a + "em)" }, { transform: "translateY(-" + b + "em)" }],
        { duration: dur, delay: i * stg, easing: GST.ease("tonnerre"), fill: "backwards" });
      anims.push(an.finished.then(function () { c.strip.style.transform = "translateY(-" + (10 + to) + "em)"; }));
      c.digit = to;
    });
    el._odo.str = str;
    return Promise.all(anims).then(function () {
      setTimeout(function () { el.classList.remove("is-good", "is-bad"); }, opts.hold || 900);
    });
  };

  /* ══ M5 · Onde de recalcul ════════════════════════════════════════════
     Une hairline part du champ modifié et traverse la chaîne de chiffrage.
     Chaque nœud pulse, puis son chiffre roule (callback onArrive).        */
  function layer() {
    var l = document.getElementById("gst-motion-layer");
    if (!l) {
      l = GST.svg("svg", { id: "gst-motion-layer", class: "gst-motion-layer", "aria-hidden": "true" });
      document.body.appendChild(l);
    }
    l.setAttribute("viewBox", "0 0 " + innerWidth + " " + innerHeight);
    l.setAttribute("width", innerWidth); l.setAttribute("height", innerHeight);
    return l;
  }
  function center(el, side) {
    var r = el.getBoundingClientRect();
    if (side === "left") return [r.left, r.top + r.height / 2];
    if (side === "top") return [r.left + r.width / 2, r.top];
    if (side === "bottom") return [r.left + r.width / 2, r.bottom];
    return [r.left + r.width / 2, r.top + r.height / 2];
  }
  GST.ring = function (x, y, opts) {
    opts = opts || {};
    var L = layer();
    var size = opts.size || 10;
    var r = GST.svg("circle", { cx: x, cy: y, r: size / 2, fill: "none",
      stroke: opts.color || GST.token("--gst-brand"), "stroke-width": opts.width || 1.5 }, L);
    r.style.transformBox = "fill-box"; r.style.transformOrigin = "center";
    var a = GST.anim(r, [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(" + (opts.scale || 4) + ")", opacity: 0 }],
      { duration: opts.duration || 620, delay: opts.delay || 0, iterations: opts.iterations || 1, easing: GST.ease("tonnerre"), fill: "both" });
    a.finished.then(function () { r.remove(); });
    return a;
  };
  GST.wave = function (origin, nodes, opts) {
    opts = opts || {};
    var color = opts.color || GST.token("--gst-brand");
    if (GST.reduced()) {
      nodes.forEach(function (n, i) { opts.onArrive && opts.onArrive(i, n); });
      return Promise.resolve();
    }
    var L = layer();
    var pts = [center(origin)];
    nodes.forEach(function (n) { pts.push(center(n)); });
    var o = pts[0];
    GST.ring(o[0], o[1], { color: color, scale: 5, duration: 700 });
    var seg = opts.segment || 300, pause = opts.pause || 140;
    var paths = [];
    var chain = Promise.resolve();
    nodes.forEach(function (n, i) {
      chain = chain.then(function () {
        var a = pts[i], b = pts[i + 1];
        // Courbe douce (v1.1) : une arche de Bézier relie les deux nœuds
        var mx = a[0] + (b[0] - a[0]) / 2;
        var d = "M" + a[0] + " " + a[1] + " C" + mx + " " + a[1] + " " + mx + " " + b[1] + " " + b[0] + " " + b[1];
        var p = GST.svg("path", { d: d, stroke: color, "stroke-width": 2, fill: "none", "stroke-linecap": "round" }, L);
        paths.push(p);
        var head = GST.svg("circle", { cx: a[0], cy: a[1], r: 5, fill: color }, L);
        var len = p.getTotalLength();
        GST.tween(seg, function (v) {
          var pt = p.getPointAtLength(len * v);
          head.setAttribute("cx", pt.x); head.setAttribute("cy", pt.y);
        }, "trace");
        return GST.drawEl(p, { duration: seg, easing: GST.ease("trace") }).finished.then(function () {
          head.remove();
          n.classList.remove("is-node-pulse"); void n.offsetWidth; n.classList.add("is-node-pulse");
          GST.ring(b[0], b[1], { color: color, scale: 3.2, duration: 520 });
          opts.onArrive && opts.onArrive(i, n);
          return GST.wait(pause);
        });
      });
    });
    return chain.then(function () {
      paths.forEach(function (p, i) {
        p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: i * 40, fill: "both" }).finished.then(function () { p.remove(); });
      });
    });
  };

  /* ══ M6 · Frappe de l'Éclair ══════════════════════════════════════════ */
  GST.strike = function (card, opts) {
    opts = opts || {};
    var originEl = opts.origin || card;
    if (navigator.vibrate) { try { navigator.vibrate([24, 40, 24]); } catch (e) {} }
    card.classList.add("is-critical");
    if (GST.reduced()) return Promise.resolve();
    var r = card.getBoundingClientRect();
    var L = layer();
    // Zigzag : 5 segments tranchés qui traversent la carte de haut en bas
    var x = r.left + r.width * 0.18, y = r.top - 18, d = "M" + x + " " + y;
    var steps = 5;
    for (var i = 1; i <= steps; i++) {
      var ny = r.top + (r.height + 36) * (i / steps) - 18;
      var nx = r.left + r.width * (0.18 + 0.64 * (i / steps)) + (i % 2 ? -1 : 1) * r.width * 0.12;
      d += " L" + nx.toFixed(1) + " " + ny.toFixed(1);
    }
    var under = GST.svg("path", { d: d, stroke: GST.token("--gst-eclair-on") || "#141414", "stroke-width": 6, "stroke-linejoin": "round", "stroke-linecap": "round" }, L);
    var bolt = GST.svg("path", { d: d, stroke: GST.token("--gst-eclair"), "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round" }, L);
    var dur = 180;
    GST.drawEl(under, { duration: dur, easing: GST.ease("strike") });
    return GST.drawEl(bolt, { duration: dur, easing: GST.ease("strike") }).finished.then(function () {
      [under, bolt].forEach(function (p) {
        p.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 260, easing: "steps(4)", fill: "both" })
          .finished.then(function () { p.remove(); });
      });
      card.animate([{ transform: "translate(0,0)" }, { transform: "translate(-3px,1px)" }, { transform: "translate(2px,-1px)" }, { transform: "translate(0,0)" }],
        { duration: 180, easing: "steps(3)" });
      var c = center(originEl);
      var col = GST.token("--gst-state-warning");
      GST.ring(c[0], c[1], { color: col, size: 12, scale: 4.5, width: 3, duration: 520, iterations: 2 });
      return GST.wait(1100);
    });
  };

  /* ══ M7 · Volet de cadre ══════════════════════════════════════════════
     Le cadre teal se referme depuis les bords (34 px → plein écran),
     la destination se décode, puis la nouvelle page s'ouvre (→ cadre).   */
  function buildWipe(label) {
    var w = document.createElement("div");
    w.className = "gst-wipe"; w.setAttribute("aria-hidden", "true");
    ["top", "right", "bottom", "left"].forEach(function (s) {
      var b = document.createElement("i"); b.dataset.side = s;
      var vertical = s === "top" || s === "bottom";
      b.style.cssText = vertical
        ? s + ":0;left:0;right:0;height:50.5vh;transform-origin:" + s + " center"
        : s + ":0;top:0;bottom:0;width:50.5vw;transform-origin:center " + s;
      b.style.transformOrigin = vertical ? "center " + s : s + " center";
      w.appendChild(b);
    });
    var lab = document.createElement("div"); lab.className = "gst-wipe__label"; lab.textContent = label || "";
    w.appendChild(lab);
    document.body.appendChild(w);
    return w;
  }
  function bars(w, from, to, dur, easing) {
    var frame = parseFloat(GST.token("--gst-frame-poster")) || 34;
    var ps = [];
    w.querySelectorAll("i").forEach(function (b) {
      var vertical = b.dataset.side === "top" || b.dataset.side === "bottom";
      var full = vertical ? innerHeight * 0.505 : innerWidth * 0.505;
      var f = function (v) { return v === "frame" ? frame / full : v === "zero" ? 0 : 1; };
      var prop = vertical ? "scaleY" : "scaleX";
      ps.push(b.animate([{ transform: prop + "(" + f(from) + ")" }, { transform: prop + "(" + f(to) + ")" }],
        { duration: dur, easing: easing, fill: "both" }).finished);
    });
    return Promise.all(ps);
  }
  GST.wipe = function (href, label) {
    if (GST.reduced()) { location.href = href; return; }
    var w = buildWipe(label);
    try { sessionStorage.setItem("gst-wipe", label || "1"); } catch (e) {}
    var lab = w.querySelector(".gst-wipe__label");
    bars(w, "frame", "full", D("slow", 420), GST.ease("trace")).then(function () {
      lab.style.opacity = 1;
      GST.decode(lab, label || "", { per: 14 });
      setTimeout(function () { location.href = href; }, 260);
    });
  };
  GST.wipeIn = function () {
    var label = null;
    try { label = sessionStorage.getItem("gst-wipe"); sessionStorage.removeItem("gst-wipe"); } catch (e) {}
    if (!label || GST.reduced()) return Promise.resolve(false);
    var w = buildWipe(label);
    var lab = w.querySelector(".gst-wipe__label"); lab.style.opacity = 1;
    return GST.wait(140).then(function () {
      lab.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "both" });
      return bars(w, "full", "frame", D("slow", 420), GST.ease("tonnerre"));
    }).then(function () { return bars(w, "frame", "zero", 260, GST.ease("snap")); })
      .then(function () { w.remove(); return true; });
  };

  /* ══ M8 · Tampon de validation ════════════════════════════════════════ */
  GST.stamp = function (host, opts) {
    opts = opts || {};
    var s = document.createElement("div");
    s.className = "gst-stamp" + (opts.tone ? " gst-stamp--" + opts.tone : "");
    s.setAttribute("role", "status");
    var now = new Date();
    var date = opts.date || [now.getDate(), now.getMonth() + 1, now.getFullYear() % 100].map(function (n) { return String(n).padStart(2, "0"); }).join(".");
    s.innerHTML = '<span class="gst-stamp__big"></span><span class="gst-stamp__small"></span>';
    s.firstChild.textContent = opts.big || "VALIDÉ";
    s.lastChild.textContent = (opts.small || date) + " · ";
    var fl = document.createElement("span"); fl.className = "gst-fleur"; fl.style.color = "inherit"; fl.style.fontSize = "1.3em"; fl.textContent = "⚜"; s.lastChild.appendChild(fl);
    var cs = getComputedStyle(host);
    if (cs.position === "static") host.style.position = "relative";
    s.style.left = opts.left || "50%"; s.style.top = opts.top || "50%";
    host.appendChild(s);
    var R = "rotate(" + (opts.rotate != null ? opts.rotate : -4) + "deg)";
    var T = "translate(-50%,-50%) ";
    if (GST.reduced()) { s.style.transform = T + R; return Promise.resolve(s); }
    var a = s.animate([
      { transform: T + R + " scale(2.1)", opacity: 0, offset: 0 },
      { transform: T + R + " scale(0.94, 0.88)", opacity: 1, offset: 0.42, easing: "cubic-bezier(.2,0,0,1)" },
      { transform: T + R + " scale(1.03, 1.01)", opacity: 1, offset: 0.7 },
      { transform: T + R + " scale(1)", opacity: 1, offset: 1 }
    ], { duration: 520, easing: GST.ease("strike"), fill: "both" });
    setTimeout(function () {
      host.animate([{ transform: "translateY(0)" }, { transform: "translateY(2px)" }, { transform: "translateY(0)" }], { duration: 140, easing: "ease-out" });
    }, 220);
    return a.finished.then(function () { return s; });
  };

  /* ══ M9 · Courbe tracée ═══════════════════════════════════════════════ */
  GST.draw = function (path, opts) { return GST.drawEl(path, Object.assign({ duration: 900 }, opts)).finished; };

  /* ══ M10 · Crête du Tonnerre ══════════════════════════════════════════
     svg doit contenir : path[data-crest], path[data-bolt] (optionnel) ;
     word : élément texte Bebas à lever ; sub : élément mono à décoder.   */
  GST.crest = function (o) {
    var long = !!o.long;
    var tl = long ? { crest: 1100, bolt: 180, flash: 260, word: 760, gap: 160 } : { crest: 420, bolt: 120, flash: 140, word: 420, gap: 60 };
    if (GST.reduced()) {
      if (o.word) o.word.style.opacity = 1;
      if (o.sub) { o.sub.style.opacity = 1; }
      return Promise.resolve();
    }
    var crest = o.svg.querySelector("[data-crest]");
    var bolt = o.svg.querySelector("[data-bolt]");
    var fill = o.svg.querySelector("[data-crest-fill]");
    if (o.word) o.word.style.opacity = 0;
    if (o.sub) o.sub.style.opacity = 0;
    if (bolt) bolt.style.opacity = 0;
    if (fill) fill.style.opacity = 0;
    return GST.drawEl(crest, { duration: tl.crest, easing: GST.ease("trace") }).finished.then(function () {
      if (fill) GST.anim(fill, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: GST.ease("snap") });
      if (!bolt) return;
      bolt.style.opacity = 1;
      return GST.drawEl(bolt, { duration: tl.bolt, easing: GST.ease("strike") }).finished.then(function () {
        bolt.animate([{ opacity: 1 }, { opacity: .2 }, { opacity: 1 }], { duration: tl.flash, easing: "steps(3)" });
        if (o.onStrike) o.onStrike();
      });
    }).then(function () {
      if (o.word) { o.word.style.opacity = 1; GST.rise(o.word, { duration: tl.word, stagger: long ? 34 : 18 }); }
      return GST.wait(tl.gap + (long ? 380 : 120));
    }).then(function () {
      if (o.sub) { o.sub.style.opacity = 1; return GST.decode(o.sub, null, { per: long ? 22 : 12 }); }
    });
  };

  /* ══ M11 · Synchronisation ════════════════════════════════════════════
     indicator : .gst-sync ; list : <ul> des lignes en file.              */
  GST.syncFlush = function (indicator, list) {
    var label = indicator.querySelector(".gst-sync__label");
    indicator.classList.remove("is-offline");
    indicator.classList.add("is-pending");
    if (label) GST.decode(label, "SYNCHRONISATION");
    var items = Array.prototype.slice.call(list.children);
    var st = GST.reduced() ? 0 : 260;
    return items.reduce(function (p, li, i) {
      return p.then(function () {
        li.classList.add("is-synced");
        var box = li.querySelector(".gst-check__box");
        var cb = li.querySelector("input"); if (cb) cb.checked = true;
        if (box) GST.pop(box, 0);
        return GST.wait(st);
      });
    }, GST.wait(GST.reduced() ? 0 : 300)).then(function () {
      var anim = GST.anim(list, [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-14px)", opacity: 0 }], { duration: D("slow", 420), easing: GST.ease("tonnerre") });
      return anim.finished;
    }).then(function () {
      indicator.classList.remove("is-pending");
      if (label) GST.decode(label, "SYNCHRONISÉ");
    });
  };

  /* ── Toasts (entrée depuis le bas + tag décodé) ──────────────────────── */
  GST.toast = function (msg, opts) {
    opts = opts || {};
    var host = document.querySelector(".gst-toasts");
    if (!host) { host = document.createElement("div"); host.className = "gst-toasts"; host.setAttribute("role", "status"); host.setAttribute("aria-live", "polite"); document.body.appendChild(host); }
    var t = document.createElement("div");
    t.className = "gst-toast" + (opts.tone ? " gst-toast--" + opts.tone : "");
    t.innerHTML = '<span class="gst-tag"></span><span class="gst-toast__msg"></span><button class="gst-icon-btn gst-icon-btn--ghost" aria-label="Fermer" style="color:inherit;width:36px;height:36px"><svg class="gst-icon gst-icon--sm"><use href="#i-x"/></svg></button>';
    t.children[1].textContent = msg;
    host.appendChild(t);
    GST.anim(t, [{ transform: "translateY(24px)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: D("base", 240), easing: GST.ease("tonnerre") });
    GST.decode(t.children[0], opts.tag || ".00 / INFO");
    var close = function () {
      GST.anim(t, [{ opacity: 1 }, { opacity: 0, transform: "translateY(12px)" }], { duration: 200 }).finished.then(function () { t.remove(); });
    };
    t.querySelector("button").onclick = close;
    setTimeout(close, opts.duration || 3800);
    return t;
  };

  /* ── Indicateurs glissants (Tabs, SegmentedControl) ───────────────────── */
  GST.ink = function (container, ink, active) {
    if (!active) return;
    var cr = container.getBoundingClientRect(), ar = active.getBoundingClientRect();
    ink.style.width = ar.width + "px";
    ink.style.transform = "translateX(" + (ar.left - cr.left + container.scrollLeft) + "px)";
  };
  GST.wireTabs = function (scope) {
    (scope || document).querySelectorAll(".gst-tabs, .gst-seg").forEach(function (t) {
      if (t._wired) return; t._wired = true;
      var isTabs = t.classList.contains("gst-tabs");
      var ink = t.querySelector(isTabs ? ".gst-tabs__ink" : ".gst-seg__ind");
      if (!ink) { ink = document.createElement("span"); ink.className = isTabs ? "gst-tabs__ink" : "gst-seg__ind"; t.appendChild(ink); }
      var attr = isTabs ? "aria-selected" : "aria-pressed";
      var btns = t.querySelectorAll("button");
      var update = function () { GST.ink(t, ink, t.querySelector("[" + attr + "='true']")); };
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          if (t.hasAttribute("data-manual")) return;
          btns.forEach(function (x) { x.setAttribute(attr, x === b ? "true" : "false"); });
          update();
          t.dispatchEvent(new CustomEvent("gst-change", { detail: { value: b.dataset.value, button: b } }));
        });
      });
      if (isTabs) t.setAttribute("role", "tablist");
      requestAnimationFrame(update);
      if (document.fonts) { document.fonts.ready.then(update); document.fonts.addEventListener && document.fonts.addEventListener("loadingdone", update); }
      if ("ResizeObserver" in window) { var ro = new ResizeObserver(update); btns.forEach(function (x) { ro.observe(x); }); }
      addEventListener("resize", update);
      t._inkUpdate = update;
    });
  };

  /* ── Révélation au défilement (déclarative) ──────────────────────────────
     data-decode · data-rise · data-trace-box · data-odo="12345" ·
     data-m1-grid="cols,rows" · data-draw · data-stagger              */
  GST.reveal = function (scope) {
    var els = (scope || document).querySelectorAll("[data-decode],[data-rise],[data-trace-box],[data-odo],[data-m1-grid],[data-draw],[data-stagger]");
    var run = function (el) {
      if (el._revealed) return; el._revealed = true;
      var delay = +(el.getAttribute("data-delay") || 0);
      setTimeout(function () {
        if (el.hasAttribute("data-decode")) GST.decode(el);
        if (el.hasAttribute("data-rise")) { el.style.opacity = 1; GST.rise(el); }
        if (el.hasAttribute("data-trace-box")) GST.traceBox(el);
        if (el.hasAttribute("data-odo")) {
          var v = +el.getAttribute("data-odo");
          var fm = el.getAttribute("data-odo-format");
          var f = fm === "fcfa" ? GST.fmt : GST.fmt;
          GST.odometer(el, 0, { instant: true, format: f });
          GST.odometer(el, v, { format: f, tone: null });
        }
        if (el.hasAttribute("data-m1-grid")) {
          var cr = (el.getAttribute("data-m1-grid") || "4,3").split(",");
          GST.traceGrid(el, { cols: +cr[0], rows: +cr[1] });
        }
        if (el.hasAttribute("data-draw")) el.querySelectorAll("path,line,polyline,rect,circle").forEach(function (p, i) {
          if (!p.hasAttribute("data-nodraw")) GST.drawEl(p, { duration: 900, delay: i * 60 });
        });
        if (el.hasAttribute("data-stagger")) Array.prototype.forEach.call(el.children, function (c, i) {
          GST.anim(c, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
            { duration: D("slow", 420), delay: i * S("base", 56), easing: GST.ease("tonnerre") });
        });
      }, delay);
    };
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.bottom < 0) { io.unobserve(e.target); run(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    // Filet de sécurité : un défilement très rapide peut « sauter » un élément sans qu'il soit jamais vu
    var pending = Array.prototype.slice.call(els), tick = null;
    var sweep = function () {
      tick = null;
      pending = pending.filter(function (el) {
        if (el._revealed) return false;
        if (el.getBoundingClientRect().top < innerHeight * 0.92) { io.unobserve(el); run(el); return false; }
        return true;
      });
      if (!pending.length) removeEventListener("scroll", onScroll);
    };
    var onScroll = function () { if (!tick) tick = setTimeout(sweep, 140); };
    addEventListener("scroll", onScroll, { passive: true });
    els.forEach(function (el) {
      if (el.hasAttribute("data-rise") && !GST.reduced()) el.style.opacity = 0;
      if (el.hasAttribute("data-stagger") && !GST.reduced()) Array.prototype.forEach.call(el.children, function (c) { c.style.opacity = 0; });
      if (el.hasAttribute("data-trace-box") && !GST.reduced()) el.style.opacity = 1;
      io.observe(el);
    });
  };
})();
