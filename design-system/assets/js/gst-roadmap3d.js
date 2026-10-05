/* ═══════════════════════════════════════════════════════════════════════
   GST GOVERNMENT — Roadmap 3D « Le Circuit du Camp » · v1.1
   Une carte vivante du Camp de Réjouissance 2026 : chaîne de montagnes et
   Mont Tonnerre au nord, rivière jusqu'au lac Togo, forêts, champs, villages,
   camps scouts, voie ferrée avec ponts, 14 gares et un train à vapeur.
   Saisons (4, calendrier togolais), cycle jour / nuit continu, météo
   automatique : soleil, nuages, vent, pluie, orage, harmattan, arc-en-ciel.

   GST3D.scenes.roadmap(THREE, OrbitControls, { canvas, RM, tags, landmarks, onHud })
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var K = window.GST3D, W = K.world, GST = window.GST;
  var S = K.scenes;

  var PAL = {
    "pluies":        { g1: "#4E9A4A", g2: "#2F8045", forest: "#24603A", f1: "#7DAF4E", f2: "#5E8F3A", rock: "#5F7D6E", high: "#8FB09A", peak: "#E7F2F1", sand: "#CFC09A", leaf: "#2F7A3C", leaf2: "#3E8E3A", water: "#2E8F89" },
    "petite-seche":  { g1: "#7DA858", g2: "#5E9450", forest: "#356F3E", f1: "#C9B26A", f2: "#8DB65E", rock: "#6E8478", high: "#9DB3A2", peak: "#F4F4F2", sand: "#D8C99A", leaf: "#3E7E3E", leaf2: "#5E9440", water: "#2E8F89" },
    "petite-pluies": { g1: "#5FA552", g2: "#3E8E4A", forest: "#2A6A3C", f1: "#9DBE55", f2: "#6FA048", rock: "#617F70", high: "#93B39C", peak: "#E7F2F1", sand: "#D2C59C", leaf: "#357F3C", leaf2: "#4E9A3E", water: "#2B8A84" },
    "harmattan":     { g1: "#C2AE72", g2: "#A99A5C", forest: "#6E7A44", f1: "#D9C38A", f2: "#B89F5E", rock: "#8F8670", high: "#B9AE90", peak: "#EDE3CC", sand: "#E3D3A8", leaf: "#7A8A4A", leaf2: "#9C9A52", water: "#4E9A8F" }
  };
  var WX = {
    soleil:    { cover: 0.22, wind: 0.14, rain: 0, over: null, wk: 0, dust: 0, storm: 0, label: "Ensoleillé", ico: "sun" },
    nuageux:   { cover: 0.85, wind: 0.32, rain: 0, over: "couvert", wk: 0.6, dust: 0, storm: 0, label: "Nuageux", ico: "cloud" },
    vent:      { cover: 0.5, wind: 1.0, rain: 0, over: null, wk: 0, dust: 0.55, storm: 0, label: "Grand vent", ico: "wind" },
    pluie:     { cover: 1, wind: 0.45, rain: 0.75, over: "couvert", wk: 0.95, dust: 0, storm: 0, label: "Pluie", ico: "cloud-rain" },
    orage:     { cover: 1, wind: 1.1, rain: 1, over: "orage", wk: 1, dust: 0, storm: 1, label: "Orage", ico: "cloud-lightning" },
    harmattan: { cover: 0.12, wind: 0.55, rain: 0, over: "harmattan", wk: 0.85, dust: 1, storm: 0, label: "Harmattan", ico: "wind" }
  };
  var AUTO = {
    "pluies": [["nuageux", 14], ["pluie", 18], ["orage", 14], ["pluie", 10], ["soleil", 16], ["nuageux", 12]],
    "petite-seche": [["soleil", 20], ["nuageux", 14], ["vent", 12], ["soleil", 16], ["pluie", 10], ["soleil", 14]],
    "petite-pluies": [["nuageux", 12], ["pluie", 16], ["soleil", 16], ["orage", 10], ["nuageux", 12]],
    "harmattan": [["harmattan", 22], ["vent", 12], ["harmattan", 18], ["soleil", 10]]
  };
  var TEMP = { "pluies": 26, "petite-seche": 25, "petite-pluies": 26, "harmattan": 29 };

  S.roadmap = function (THREE, OrbitControls, o) {
    var RM = o.RM, C = window.GST_DATA.CARTE, N = RM.N;
    var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
    var api = K.setup(THREE, o.canvas, { fov: 34 });
    api.camera.near = 1; api.camera.far = 1600; api.camera.updateProjectionMatrix();
    W.modern(api, { shadows: true, shadowSize: 150, fogNear: 220, fogFar: 640, hemi: 1.2 });
    api.sun.shadow.mapSize.set(2048, 2048); api.sun.shadow.camera.far = 600;
    var scene = api.scene, Nz = W.noise(23), R = W.rng(9);
    var sky = W.sky(api, "jour");
    var stars = W.stars(api, 900);
    var wind = W.wind(api);
    var season = o.season || "petite-seche", P = PAL[season];

    /* ── Tracé de la voie (centripète, passe par les 14 gares) ────────── */
    var ctrl = C.stations.map(function (p) { return V(p[0], 0, p[1]); });
    ctrl.unshift(V(-104, 0, 64)); ctrl.push(V(30, 0, 30));
    var curve = new THREE.CatmullRomCurve3(ctrl, false, "centripetal");
    var NS = 900, samp = curve.getSpacedPoints(NS), L = curve.getLength();
    var river = new THREE.CatmullRomCurve3(C.riviere.map(function (p) { return V(p[0], 0, p[1]); }), false, "centripetal");
    var NR = 320, rs = river.getSpacedPoints(NR);
    /* Plus proche échantillon : recherche grossière (pas de 8) puis affinée */
    function nearest(arr, x, z) {
      var m = 1e18, k = 0, n = arr.length, i, dx, dz, d;
      for (i = 0; i < n; i += 8) { dx = arr[i].x - x; dz = arr[i].z - z; d = dx * dx + dz * dz; if (d < m) { m = d; k = i; } }
      var lo = Math.max(0, k - 10), hi = Math.min(n - 1, k + 10);
      for (i = lo; i <= hi; i++) { dx = arr[i].x - x; dz = arr[i].z - z; d = dx * dx + dz * dz; if (d < m) { m = d; k = i; } }
      return [Math.sqrt(m), k];
    }
    var stU = C.stations.map(function (p) {
      var best = 1e9, bu = 0; for (var i = 0; i <= NS; i++) { var d = Math.hypot(samp[i].x - p[0], samp[i].z - p[1]); if (d < best) { best = d; bu = i / NS; } } return bu;
    });

    /* ── Relief ──────────────────────────────────────────────────────── */
    var LAKE_Y = -0.6;
    function base(x, z) {
      var h = 1.4 + Nz.fbm(x * 0.017, z * 0.017, 4) * 5;
      var north = W.smooth(-36, -80, z);
      h += north * (5 + Nz.ridged(x * 0.03 + 3, z * 0.03, 5) * 32);
      var dm = Math.hypot(x - C.sommet.x, z - C.sommet.z) / 34; if (dm < 1) h += 30 * Math.pow(1 - dm, 1.7);
      h += W.smooth(-80, -125, x) * (4 + Nz.fbm(x * 0.05, z * 0.05, 3) * 7);
      h += W.smooth(95, 140, x) * (3 + Nz.fbm(x * 0.05 + 7, z * 0.05, 3) * 6);
      h += W.smooth(78, 120, z) * 3;
      var dl = Math.hypot((x - C.lac.x) / 1.15, z - C.lac.z);
      h = W.lerp(h, -2.6, 1 - W.smooth(C.lac.r * 0.7, C.lac.r * 1.3, dl));
      return h;
    }
    // Hauteur de la voie : relief lissé le long du tracé, jamais sous l'eau
    var trackH = samp.map(function (p) { return base(p.x, p.z); });
    for (var pass = 0; pass < 3; pass++) {
      var tmpH = trackH.slice();
      for (var i = 0; i <= NS; i++) { var a = 0, n = 0; for (var k = -30; k <= 30; k++) { var j = Math.min(NS, Math.max(0, i + k)); a += tmpH[j]; n++; } trackH[i] = a / n; }
    }
    trackH = trackH.map(function (h) { return Math.max(1.0, h + 0.3); });
    // Rivière : descend toujours vers le lac
    var riverY = rs.map(function (p) { return base(p.x, p.z); });
    for (i = 1; i <= NR; i++) riverY[i] = Math.min(riverY[i - 1], riverY[i]);
    riverY = riverY.map(function (h, i) { return Math.max(LAKE_Y + 0.15 * (1 - i / NR), h - 1.2); });
    function riverW(k) { return 2.4 + (k / NR) * 2.6; }
    var stH = stU.map(function (u) { return trackH[Math.round(u * NS)]; });
    function height(x, z) {
      var h = base(x, z);
      var t = nearest(samp, x, z), th = trackH[t[1]];
      h = W.lerp(th - 0.25, h, W.smooth(3.4, 10, t[0]));
      for (var s = 0; s < C.stations.length; s++) {
        var ds = Math.hypot(x - C.stations[s][0], z - C.stations[s][1]);
        if (ds < 12) h = W.lerp(stH[s] - 0.2, h, W.smooth(5, 12, ds));
      }
      var r = nearest(rs, x, z), rw = riverW(r[1]);
      h = W.lerp(h, riverY[r[1]] - 1.4, 1 - W.smooth(rw * 0.55, rw * 1.7, r[0]));
      return h;
    }
    var forestMask = function (x, z) { return Nz(x * 0.024 + 50, z * 0.024 - 20) * 0.7 + Nz(x * 0.07, z * 0.07) * 0.3; };
    var fieldMask = function (x, z) { var m = 0; C.villages.forEach(function (v) { m = Math.max(m, 1 - W.smooth(14, 34, Math.hypot(x - v.x, z - v.z))); }); return m; };
    var trackD = function (x, z) { return nearest(samp, x, z)[0]; };
    var riverD = function (x, z) { var r = nearest(rs, x, z); return r[0] - riverW(r[1]); };
    var lakeD = function (x, z) { return Math.hypot((x - C.lac.x) / 1.15, z - C.lac.z) - C.lac.r; };
    var cache = {};
    function colorFn(c, y, ny, x, z) {
      var key = (x * 10 | 0) + ":" + (z * 10 | 0);
      var m = cache[key] || (cache[key] = { td: trackD(x, z), rd: riverD(x, z), ld: lakeD(x, z), fm: forestMask(x, z), fl: fieldMask(x, z) });
      var cc = new THREE.Color();
      c.set(P.g1).lerp(cc.set(P.g2), Nz(x * 0.05, z * 0.05) * 0.5 + 0.5);
      if (m.fl > 0.1) { var fx = Math.floor(x / 6.5), fz = Math.floor(z / 4.5), hsh = Math.abs(Math.sin(fx * 12.9898 + fz * 78.233) * 43758.5453) % 1; if (hsh > 0.35 && m.fl > hsh * 0.6) c.set(hsh > 0.68 ? P.f1 : P.f2); }
      if (m.fm > 0.18 && y < 17) c.lerp(cc.set(P.forest), 0.55);
      if (m.td < 3.2) c.lerp(cc.set("#A89A7E"), 0.7);
      if (m.rd < 1.2 || (m.ld < 2.5 && y < 0.6)) c.set(P.sand);
      if (ny < 0.82) c.lerp(cc.set(P.rock), W.smooth(0.82, 0.55, ny));
      if (y > 12) c.lerp(cc.set(P.high), W.smooth(12, 24, y) * (ny > 0.6 ? 1 : 0.6));
      if (y > 30) c.lerp(cc.set(P.peak), W.smooth(30, 42, y) * (ny > 0.55 ? 1 : 0.3));
      var shade = 0.94 + (Math.abs(Math.sin(x * 3.1 + z * 1.7)) * 0.08);
      c.multiplyScalar(shade);
    }
    var terrain = W.terrain(api, { size: 440, depth: 330, seg: 230, shadows: true, height: height, color: colorFn });
    scene.add(terrain);

    /* ── Eau : lac et rivière ─────────────────────────────────────────── */
    var lake = W.water(api, { w: C.lac.r * 2.9, d: C.lac.r * 2.6, seg: 30, color: P.water, opacity: 0.9 });
    lake.position.set(C.lac.x, LAKE_Y, C.lac.z); scene.add(lake);
    var rPos = [], rIdx = [];
    for (i = 0; i <= NR; i++) {
      var tg = river.getTangentAt(i / NR), nr = V(-tg.z, 0, tg.x), w = riverW(i) * 0.95, p = rs[i], y = riverY[i] - 0.45;
      rPos.push(p.x + nr.x * w, y, p.z + nr.z * w, p.x - nr.x * w, y, p.z - nr.z * w);
      if (i < NR) { var b = i * 2; rIdx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
    }
    var rGeo = new THREE.BufferGeometry(); rGeo.setAttribute("position", new THREE.Float32BufferAttribute(rPos, 3)); rGeo.setIndex(rIdx); rGeo.computeVertexNormals();
    var rMat = lake.material.clone(); rMat.onBeforeCompile = lake.material.onBeforeCompile;
    var riverMesh = new THREE.Mesh(rGeo, rMat); scene.add(riverMesh);
    // Pirogues sur le lac
    var boats = [];
    for (i = 0; i < 4; i++) {
      var boat = new THREE.Group();
      var hull = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.25, 4.4, 6, 1), W.std(api, "#6B4A2E")); hull.rotation.z = Math.PI / 2; hull.scale.set(1, 1, 0.55);
      var man = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.5, 2, 6), W.std(api, i % 2 ? "--gst-red-500" : "--gst-teal-500")); man.position.set(0.6, 0.6, 0);
      boat.add(hull, man); boat.userData = { a: i * 1.6, r: 6 + i * 2.2 };
      scene.add(boat); boats.push(boat);
    }

    /* ── Végétation ──────────────────────────────────────────────────── */
    var pines = [], broad = [], palms = [], rocks = [], shrubs = [];
    for (var gx = -150; gx < 150; gx += 3.1) for (var gz = -110; gz < 110; gz += 3.1) {
      var x = gx + (R() - 0.5) * 2.6, z = gz + (R() - 0.5) * 2.6;
      if (trackD(x, z) < 5) continue;
      if (riverD(x, z) < 1.8 || lakeD(x, z) < 1.5) continue;
      var near = false; for (var s2 = 0; s2 < C.stations.length; s2++) if (Math.hypot(x - C.stations[s2][0], z - C.stations[s2][1]) < 11) { near = true; break; }
      if (near) continue;
      var vill = false; C.villages.forEach(function (v) { if (Math.hypot(x - v.x, z - v.z) < 12) vill = true; }); if (vill) continue;
      var y2 = height(x, z), fm = forestMask(x, z), sc = 0.8 + R() * 0.9, rot = R() * 6.28;
      if (y2 > 26) { if (R() < 0.05) rocks.push([x, y2, z, 1 + R() * 1.6, rot]); continue; }
      if (lakeD(x, z) < 10 && R() < 0.35) { palms.push([x, y2 - 0.1, z, 0.9 + R() * 0.5, rot]); continue; }
      if (fm > 0.18) { (y2 > 10 || R() < 0.45 ? pines : broad).push([x, y2 - 0.15, z, sc * (y2 > 10 ? 1.15 : 1), rot, 0.9 + R() * 0.4]); continue; }
      if (fieldMask(x, z) > 0.2) { if (R() < 0.05) palms.push([x, y2, z, 0.9 + R() * 0.4, rot]); continue; }
      var rr = R();
      if (rr < 0.05) broad.push([x, y2 - 0.1, z, sc, rot]);
      else if (rr < 0.08) shrubs.push([x, y2, z, 0.6 + R() * 0.6, rot]);
      else if (rr < 0.085) rocks.push([x, y2, z, 0.6 + R(), rot]);
    }
    var gPines = W.pines(api, pines, P.leaf), gBroad = W.broadleaf(api, broad, P.leaf2), gPalms = W.palms(api, palms), gRocks = W.rocks(api, rocks, "#8C8C84");
    var shrubGeo = new THREE.IcosahedronGeometry(0.7, 0); shrubGeo.scale(1, 0.7, 1); shrubGeo.translate(0, 0.35, 0);
    var shrubMat = W.sway(api, W.std(api, P.leaf2), 0.2);
    var gShrubs = new THREE.InstancedMesh(shrubGeo, shrubMat, Math.max(1, shrubs.length));
    (function () { var m = new THREE.Matrix4(), q = new THREE.Quaternion(); shrubs.forEach(function (p, i) { q.setFromAxisAngle(V(0, 1, 0), p[4]); m.compose(V(p[0], p[1], p[2]), q, V(p[3], p[3], p[3])); gShrubs.setMatrixAt(i, m); }); gShrubs.count = shrubs.length; })();
    var flora = new THREE.Group(); flora.add(gPines, gBroad, gPalms, gRocks, gShrubs); scene.add(flora);

    /* ── Villages, camps, lieux ───────────────────────────────────────── */
    var nightGlow = [];   // matériaux émissifs allumés la nuit
    var winMat = new THREE.MeshStandardMaterial({ color: new THREE.Color("#3A2A10"), emissive: new THREE.Color("#FFC861"), emissiveIntensity: 0 });
    nightGlow.push(winMat);
    function house(x, z, rot, roofCol, big) {
      var g = new THREE.Group(), y = height(x, z);
      var wall = new THREE.Mesh(new THREE.BoxGeometry(big ? 6 : 2.6, big ? 2.6 : 1.9, big ? 3.2 : 2.4), W.std(api, R() < 0.5 ? "#EADFC8" : "#D9B98E"));
      wall.position.y = (big ? 2.6 : 1.9) / 2; wall.castShadow = true; wall.receiveShadow = true;
      var roofG = new THREE.ConeGeometry(big ? 4.4 : 2.1, big ? 1.8 : 1.5, 4); roofG.rotateY(Math.PI / 4); roofG.scale(big ? 1.4 : 1, 1, big ? 0.85 : 1);
      var roof = new THREE.Mesh(roofG, W.std(api, roofCol)); roof.position.y = (big ? 2.6 : 1.9) + (big ? 0.9 : 0.75); roof.castShadow = true;
      var win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), winMat); win.position.set(0, 1.0, (big ? 1.61 : 1.21));
      g.add(wall, roof, win); g.position.set(x, y - 0.05, z); g.rotation.y = rot;
      scene.add(g); return g;
    }
    C.villages.forEach(function (v, vi) {
      for (var h = 0; h < v.n; h++) {
        var a = h / v.n * Math.PI * 2 + vi, r = 5 + (h % 3) * 3.4;
        house(v.x + Math.cos(a) * r, v.z + Math.sin(a) * r, a + Math.PI / 2, ["#B5562E", "#9E1C18", "#B08D57", "#06605E"][h % 4]);
      }
    });
    // École d'Attikoumé (J.05) : long bâtiment, toit teal
    var school = house(C.stations[4][0] + 9, C.stations[4][1] + 6, 0.3, "--gst-teal-600", true);
    // Camps scouts autour de certaines gares
    var tentMats = [W.std(api, "--gst-cream"), W.std(api, "--gst-red-500"), W.std(api, "--gst-teal-200"), W.std(api, "#E8D48A")];
    var tentWin = new THREE.MeshStandardMaterial({ color: new THREE.Color("#2A2010"), emissive: new THREE.Color("#FFB84D"), emissiveIntensity: 0 }); nightGlow.push(tentWin);
    C.camps.forEach(function (si, k) {
      var cx = C.stations[si][0], cz = C.stations[si][1];
      for (var t = 0; t < 7; t++) {
        var a = t * 0.9 + k * 2, r = 7.5 + (t % 3) * 1.6, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
        if (trackD(x, z) < 4) continue;
        var tent = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.35, 4), tentMats[(t + k) % 4]);
        tent.position.set(x, height(x, z) + 0.6, z); tent.rotation.y = a; tent.castShadow = true; scene.add(tent);
        var tw = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), tentWin); tw.position.set(0, -0.2, 0.62); tw.rotation.x = -0.28; tent.add(tw);
      }
    });
    // Feux de camp (J.13 cercle du feu, J.07 bivouac)
    var fires = [];
    [[12, 0, 9], [6, -6, 6]].forEach(function (f) {
      var si = f[0], x = C.stations[si][0] + f[1], z = C.stations[si][1] + f[2], y = height(x, z);
      var logs = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.25, 8), W.std(api, "#5A4632")); logs.position.set(x, y + 0.1, z); scene.add(logs);
      var stones = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.3, 5, 10), W.std(api, "#8A8A84")); stones.rotation.x = Math.PI / 2; stones.position.set(x, y + 0.15, z); scene.add(stones);
      var flame = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.4, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFB23F"), transparent: true, opacity: 0.95 })); flame.position.set(x, y + 0.85, z); scene.add(flame);
      var light = new THREE.PointLight(new THREE.Color("#FF9A3C"), 0, 30, 1.5); light.position.set(x, y + 2.4, z); scene.add(light);
      fires.push({ flame: flame, light: light });
    });
    // Amphithéâtre (J.12) : gradins en arc
    (function () {
      var x = C.stations[11][0] - 9, z = C.stations[11][1] - 7, y = height(x, z);
      for (var r = 0; r < 3; r++) {
        var step = new THREE.Mesh(new THREE.CylinderGeometry(5 + r * 2.2, 5 + r * 2.2, 0.6 + r * 0.6, 24, 1, true, Math.PI * 0.15, Math.PI * 0.7), W.std(api, "#C9C2B0", { side: THREE.DoubleSide }));
        step.position.set(x, y + 0.3 + r * 0.3, z); scene.add(step);
      }
    })();
    // Stade scout (J.11) : piste ovale
    (function () {
      var x = C.stations[10][0] + 4, z = C.stations[10][1] - 13, y = height(x, z);
      var track = new THREE.Mesh(new THREE.TorusGeometry(7, 1.1, 3, 40), W.std(api, "#B5562E")); track.rotation.x = Math.PI / 2; track.scale.set(1.5, 1, 1); track.position.set(x, y + 0.05, z); scene.add(track);
      var field = new THREE.Mesh(new THREE.CircleGeometry(6.2, 32), W.std(api, "#5FA552")); field.rotation.x = -Math.PI / 2; field.scale.set(1.5, 1, 1); field.position.set(x, y + 0.08, z); scene.add(field);
    })();
    // Ponton de Togoville (J.04)
    (function () {
      var x = C.stations[3][0] + 14, z = C.stations[3][1] + 8;
      var deck = new THREE.Mesh(new THREE.BoxGeometry(2, 0.3, 12), W.std(api, "#8A6A44")); deck.position.set(x, LAKE_Y + 0.6, z); deck.rotation.y = -0.9; scene.add(deck);
    })();

    /* ── Voie : ballast, traverses, rails, ponts ──────────────────────── */
    var tY = function (u) { var f = u * NS, i0 = Math.floor(f), i1 = Math.min(NS, i0 + 1); return W.lerp(trackH[i0], trackH[Math.min(NS, i1)], f - i0); };
    var bp = [], bi = [], WB = 1.9;
    for (i = 0; i <= NS; i++) {
      var tt = curve.getTangentAt(i / NS), nn = V(-tt.z, 0, tt.x), pp = samp[i], yy = trackH[i];
      [[WB + 0.9, yy - 0.7], [WB, yy + 0.2], [-WB, yy + 0.2], [-WB - 0.9, yy - 0.7]].forEach(function (q) { bp.push(pp.x + nn.x * q[0], q[1], pp.z + nn.z * q[0]); });
      if (i < NS) { var c0 = i * 4, c1 = c0 + 4; for (var e = 0; e < 3; e++) bi.push(c0 + e, c1 + e, c0 + e + 1, c0 + e + 1, c1 + e, c1 + e + 1); }
    }
    var ballastGeo = new THREE.BufferGeometry(); ballastGeo.setAttribute("position", new THREE.Float32BufferAttribute(bp, 3)); ballastGeo.setIndex(bi); ballastGeo.computeVertexNormals();
    var ballast = new THREE.Mesh(ballastGeo, W.std(api, "#9A9286", { side: THREE.DoubleSide })); ballast.receiveShadow = true; scene.add(ballast);
    var nSleep = Math.floor(L / 1.15);
    var sleepers = new THREE.InstancedMesh(new THREE.BoxGeometry(2.9, 0.18, 0.42), W.std(api, "#5A4632"), nSleep);
    (function () { var m = new THREE.Matrix4(), q = new THREE.Quaternion(); for (var s3 = 0; s3 < nSleep; s3++) { var u = (s3 + 0.5) / nSleep, p = curve.getPointAt(u), t = curve.getTangentAt(u); q.setFromAxisAngle(V(0, 1, 0), Math.atan2(t.x, t.z)); m.compose(V(p.x, tY(u) + 0.3, p.z), q, V(1, 1, 1)); sleepers.setMatrixAt(s3, m); } })();
    sleepers.receiveShadow = true; scene.add(sleepers);
    var railMat = W.std(api, "#5C5C5C", { flatShading: false, metalness: 0.6, roughness: 0.4 });
    var rails = [-0.75, 0.75].map(function (off) {
      var pts = []; for (var r2 = 0; r2 <= NS; r2 += 2) { var t = curve.getTangentAt(r2 / NS), p = samp[r2]; pts.push(V(p.x - t.z * off, trackH[r2] + 0.45, p.z + t.x * off)); }
      var m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), NS, 0.11, 4, false), railMat); scene.add(m); return m;
    });
    // Ponts : là où la voie enjambe la rivière
    var bridgeMat = W.std(api, "#B9B2A2"), bridgeDark = W.std(api, "#7C7468");
    var onBridge = samp.map(function (p) { return riverD(p.x, p.z) < 2.8; });
    for (i = 0; i <= NS; i++) if (onBridge[i]) {
      var t2 = curve.getTangentAt(i / NS), p2 = samp[i];
      var deck = new THREE.Mesh(new THREE.BoxGeometry(5, 0.6, (L / NS) * 1.05), bridgeMat);
      deck.position.set(p2.x, trackH[i] - 0.1, p2.z); deck.rotation.y = Math.atan2(t2.x, t2.z); deck.castShadow = true; scene.add(deck);
      if (i % 6 === 0) [-2.2, 2.2].forEach(function (off) {
        var n2 = V(-t2.z, 0, t2.x), top = trackH[i], bot = height(p2.x, p2.z) - 1;
        var pil = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, top - bot, 6), bridgeDark); pil.position.set(p2.x + n2.x * off, (top + bot) / 2, p2.z + n2.z * off); scene.add(pil);
        var post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), bridgeDark); post.position.set(p2.x + n2.x * off, top + 0.7, p2.z + n2.z * off); scene.add(post);
      });
    }

    /* ── Gares ────────────────────────────────────────────────────────── */
    function signTex(txt) {
      var c = document.createElement("canvas"); c.width = 256; c.height = 128; var g = c.getContext("2d");
      var draw = function () {
        g.fillStyle = "#F4F4F2"; g.beginPath(); g.roundRect ? g.roundRect(4, 4, 248, 120, 22) : g.rect(4, 4, 248, 120); g.fill();
        g.fillStyle = "#06605E"; g.font = "86px 'Bebas Neue', 'Arial Narrow', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 128, 70);
        tex.needsUpdate = true;
      };
      var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; draw(); if (document.fonts) document.fonts.ready.then(draw);
      return tex;
    }
    var stations = [];
    for (i = 0; i < N; i++) {
      var u = stU[i], sp = curve.getPointAt(u), st = curve.getTangentAt(u), sn = V(-st.z, 0, st.x);
      var g = new THREE.Group(), side = (i % 2 ? -1 : 1);
      g.position.set(sp.x + sn.x * 4.6 * side, stH[i] - 0.05, sp.z + sn.z * 4.6 * side);
      g.rotation.y = Math.atan2(st.x, st.z) + (side < 0 ? Math.PI : 0);
      var mats = { plat: W.std(api, "#D8D2C4", { transparent: true }), wall: W.std(api, "--gst-cream", { transparent: true }), roof: W.std(api, "--gst-teal-500", { transparent: true }),
        flag: W.std(api, "--gst-teal-400", { side: THREE.DoubleSide, flatShading: false, transparent: true }), dark: W.std(api, "--gst-ink", { transparent: true }) };
      var plat = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.6, 9), mats.plat); plat.position.y = 0.3; plat.receiveShadow = true; plat.castShadow = true;
      var wall = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 3.8), mats.wall); wall.position.set(0.1, 1.7, -1.4); wall.castShadow = true;
      var rs2 = new THREE.Shape(); rs2.moveTo(-1.9, 0); rs2.lineTo(1.9, 0); rs2.lineTo(0, 1.5); rs2.closePath();
      var roofGeo = new THREE.ExtrudeGeometry(rs2, { depth: 4.6, bevelEnabled: false }); roofGeo.translate(0, 0, -2.3); roofGeo.rotateY(Math.PI / 2);
      var roof = new THREE.Mesh(roofGeo, mats.roof); roof.position.set(0.1, 2.8, -1.4); roof.castShadow = true;
      var door = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.4), winMat); door.position.set(1.41, 1.3, -1.4); door.rotation.y = Math.PI / 2;
      var signM = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({ map: signTex(RM.j(i)), transparent: true, side: THREE.DoubleSide }));
      signM.position.set(1.0, 2.0, 2.4); signM.rotation.y = Math.PI / 2;
      var post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 5), mats.dark); post1.position.set(1.0, 1.0, 1.4);
      var post2 = post1.clone(); post2.position.z = 3.4;
      var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 6, 6), mats.dark); mast.position.set(-1.1, 3.6, 3.4);
      var fg = new THREE.PlaneGeometry(1.8, 1.1, 10, 3); fg.translate(0.9, 0, 0);
      var flag = new THREE.Mesh(fg, mats.flag); flag.position.set(-1.1, 6.0, 3.4); flag.rotation.y = -Math.PI / 2;
      var beam = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 26, 24, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color("#E0716D"), transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      beam.position.y = 13;
      var halo = new THREE.Mesh(new THREE.RingGeometry(3.4, 4.2, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color("#C42621"), transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }));
      halo.rotation.x = -Math.PI / 2; halo.position.y = 0.65;
      var hit = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 11), new THREE.MeshBasicMaterial({ visible: false })); hit.position.y = 3; hit.userData.station = i;
      g.add(plat, wall, roof, door, signM, post1, post2, mast, flag, beam, halo, hit);
      scene.add(g);
      var fpos = fg.attributes.position;
      stations.push({ g: g, mats: mats, flag: flag, fbase: fpos.array.slice(), beam: beam, halo: halo, hit: hit, p: g.position.clone(), solid: 1, sign: signM });
    }
    function setStation(i, s0, animate) {
      var Sx = stations[i];
      Sx.mats.roof.color.set(s0 === "now" ? "#C42621" : s0 === "past" ? "#0C7873" : "#E7F2F1");
      Sx.mats.flag.color.set(s0 === "now" ? "#C42621" : "#2E8F89");
      Sx.beam.visible = Sx.halo.visible = s0 === "now";
      Sx.flag.visible = s0 !== "future";
      var target = s0 === "future" ? 0.38 : 1;
      var from = Sx.solid;
      var fn = function (v) { var a = W.lerp(from, target, v); Sx.solid = a; Object.keys(Sx.mats).forEach(function (k) { var m = Sx.mats[k]; m.opacity = a; m.transparent = a < 0.99; m.depthWrite = a > 0.6; }); Sx.sign.material.opacity = Math.max(0.5, a); };
      if (animate && !GST.reduced()) K.tween(700, fn, "tonnerre"); else fn(1);
      var fy = s0 === "now" ? 6.0 : 3.4;
      if (animate && s0 === "now" && !GST.reduced()) K.tween(1100, function (v) { Sx.flag.position.y = W.lerp(3.4, 6.0, v); }, "tonnerre", 500);
      else Sx.flag.position.y = fy;
    }
    for (i = 0; i < N; i++) setStation(i, RM.state(i), false);

    /* ── Train à vapeur ───────────────────────────────────────────────── */
    var cv = document.createElement("canvas"); cv.width = 256; cv.height = 96;
    var decal = new THREE.CanvasTexture(cv); decal.colorSpace = THREE.SRGBColorSpace;
    var drawDecal = function () { var g2 = cv.getContext("2d"); g2.fillStyle = "#0C7873"; g2.fillRect(0, 0, 256, 96); g2.fillStyle = "#F4F4F2"; g2.font = "64px 'EB Garamond', serif"; g2.fillText("⚜", 16, 72); g2.font = "60px 'Bebas Neue', sans-serif"; g2.fillText("GST", 112, 72); decal.needsUpdate = true; };
    drawDecal(); if (document.fonts) document.fonts.ready.then(drawDecal);
    var cars = [], wheelsAll = [];
    var wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.2, 12); wheelGeo.rotateZ(Math.PI / 2);
    var wheelMat = W.std(api, "#2A2A2A", { flatShading: false, metalness: 0.4 });
    function wheels(g, zs, y, x) { zs.forEach(function (z) { [-x, x].forEach(function (xx) { var wh = new THREE.Mesh(wheelGeo, wheelMat); wh.position.set(xx, y, z); g.add(wh); wheelsAll.push(wh); }); }); }
    var loco = new THREE.Group();
    (function () {
      var chassis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 4.6), W.std(api, "#2A2A2A")); chassis.position.y = 0.75;
      var boilerG = new THREE.CylinderGeometry(0.72, 0.72, 2.9, 14); boilerG.rotateX(Math.PI / 2);
      var boiler = new THREE.Mesh(boilerG, W.std(api, "--gst-teal-500", { flatShading: false, roughness: 0.5, metalness: 0.2 })); boiler.position.set(0, 1.6, 0.75); boiler.castShadow = true;
      var front = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.35, 14), W.std(api, "#1E2B2A", { flatShading: false })); front.rotation.x = Math.PI / 2; front.position.set(0, 1.6, 2.3);
      var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 6), new THREE.MeshStandardMaterial({ color: new THREE.Color("#FFF1C2"), emissive: new THREE.Color("#FFD23F"), emissiveIntensity: 0.4 })); lamp.position.set(0, 2.25, 2.4); nightGlow.push(lamp.material);
      var chim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.9, 10), W.std(api, "#1E2B2A", { flatShading: false })); chim.position.set(0, 2.55, 1.6);
      var dome = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), W.std(api, "#C9A227", { metalness: 0.6, roughness: 0.3, flatShading: false })); dome.position.set(0, 2.25, 0.5);
      var cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.7, 1.6), W.std(api, "--gst-teal-700")); cab.position.set(0, 1.95, -1.25); cab.castShadow = true;
      var cabRoof = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.16, 1.9), W.std(api, "#1E2B2A")); cabRoof.position.set(0, 2.88, -1.25);
      var stripe = new THREE.Mesh(new THREE.BoxGeometry(1.84, 0.16, 1.64), W.std(api, "--gst-red-500")); stripe.position.set(0, 1.45, -1.25);
      var catcher = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.8, 4), W.std(api, "--gst-red-500")); catcher.rotation.x = Math.PI / 2; catcher.rotation.y = Math.PI / 4; catcher.scale.set(1, 1, 0.6); catcher.position.set(0, 0.7, 2.6);
      [-1, 1].forEach(function (sd) { var d = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.5), new THREE.MeshBasicMaterial({ map: decal })); d.position.set(sd * 0.91, 2.05, -1.25); d.rotation.y = sd * Math.PI / 2; loco.add(d); });
      loco.add(chassis, boiler, front, lamp, chim, dome, cab, cabRoof, stripe, catcher);
      wheels(loco, [1.5, 0.3, -0.9], 0.5, 0.82);
      loco.userData.chim = chim;
    })();
    cars.push(loco); scene.add(loco);
    ["--gst-teal-300", "--gst-cream", "--gst-red-500", "--gst-teal-200", "#E8D48A", "--gst-teal-600"].forEach(function (tok) {
      var w2 = new THREE.Group();
      var body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.4, 3.6), W.std(api, tok)); body.position.y = 1.5; body.castShadow = true;
      var roofG2 = new THREE.CylinderGeometry(1.0, 1.0, 3.7, 14, 1, false, 0, Math.PI); roofG2.rotateZ(Math.PI / 2); roofG2.rotateY(Math.PI / 2); roofG2.scale(0.88, 0.35, 1);
      var roof2 = new THREE.Mesh(roofG2, W.std(api, "#1E2B2A", { flatShading: false })); roof2.position.y = 2.2;
      [-1, 1].forEach(function (sd) { var wn = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), winMat); wn.position.set(sd * 0.86, 1.75, 0); wn.rotation.y = sd * Math.PI / 2; w2.add(wn); });
      var under = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 3.4), W.std(api, "#2A2A2A")); under.position.y = 0.72;
      w2.add(body, roof2, under); wheels(w2, [1.1, -1.1], 0.5, 0.78);
      cars.push(w2); scene.add(w2);
    });
    var CARLEN = 4.3 / L, trainU = 0.0001, trainSpeed = 0;
    function placeTrain(u) {
      trainSpeed = Math.abs(u - trainU) * L; trainU = u;
      cars.forEach(function (c, k) {
        var uk = Math.max(0.0001, u - k * CARLEN), p = curve.getPointAt(uk), q = curve.getPointAt(Math.min(1, uk + 0.0015));
        var y = tY(uk) + 0.45, y2 = tY(Math.min(1, uk + 0.0015)) + 0.45;
        c.position.set(p.x, y, p.z); c.lookAt(q.x, y2, q.z);
      });
    }
    // Fumée : bouffées qui montent et suivent le vent
    var puffTex = (function () { var c = document.createElement("canvas"); c.width = c.height = 64; var x = c.getContext("2d"); var gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(0.6, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
    var puffs = []; for (i = 0; i < 26; i++) { var sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0, color: new THREE.Color("#F4F4F2") })); sp2.userData.life = 0; scene.add(sp2); puffs.push(sp2); }
    var puffClock = 0, puffI = 0;

    /* ── Météo, ciel, faune ───────────────────────────────────────────── */
    var clouds = W.cloudField(api, { count: 40, spread: 620, depth: 460, y: 132, yVar: 34, scale: 4.2 }); scene.add(clouds);
    var rainCenter = V(0, 0, 0);
    var rain = W.rain(api, { area: 220, top: 110, count: 5200, center: rainCenter }); scene.add(rain);
    var dust = W.dust(api, { area: 260, count: 900, top: 26, size: 0.5, color: "#D9C38A" }); scene.add(dust);
    var bolts = W.lightning(api); scene.add(bolts);
    var flock1 = W.birds(api, { count: 9, scale: 1.6, speed: 0.04, path: function (t) { return V(Math.cos(t) * 90, 34 + Math.sin(t * 2) * 5, Math.sin(t) * 55); } });
    var flock2 = W.birds(api, { count: 5, scale: 1.4, speed: 0.06, seed: 4, t0: 2, path: function (t) { return V(60 + Math.cos(t * 1.3) * 30, 22 + Math.sin(t * 3) * 3, 40 + Math.sin(t * 1.3) * 22); } });
    scene.add(flock1, flock2);
    var moon = new THREE.Mesh(new THREE.SphereGeometry(16, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFF6DA"), fog: false, transparent: true, opacity: 0 }));
    scene.add(moon);
    // Arc-en-ciel : 6 bandes concentriques translucides
    var rainbow = new THREE.Group();
    ["#E0716D", "#F2A65A", "#FFD23F", "#7DAF4E", "#5FAAA5", "#7A6FB0"].forEach(function (c, k) {
      var m = new THREE.Mesh(new THREE.TorusGeometry(160 - k * 4.2, 2.1, 4, 90, Math.PI), new THREE.MeshBasicMaterial({ color: new THREE.Color(c), transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
      rainbow.add(m);
    });
    rainbow.position.set(30, -20, -260); scene.add(rainbow);
    var rainbowK = 0, rainbowT = 0;

    var hourMode = o.hourMode || "auto", hour = 12, targetHour = 12, wxMode = "auto", wxName = "soleil", wxT = 0, wxStep = 0;
    var cur = { cover: 0.25, wind: 0.15, rain: 0, over: null, wk: 0, dust: 0, storm: 0 };
    var lastStorm = 0, prevWet = false;
    function realHour() { var d = new Date(); return d.getHours() + d.getMinutes() / 60; }
    function hourFor(m) { return m === "auto" ? realHour() : m === "jour" ? 11.5 : m === "aube" ? 6.6 : m === "crepuscule" ? 18.1 : m === "nuit" ? 22.5 : hour; }
    targetHour = hour = hourFor(hourMode);
    function pickWeather(name) {
      var wasWet = wxName === "pluie" || wxName === "orage";
      wxName = name;
      if (wasWet && (name === "soleil" || name === "nuageux")) { rainbowT = 16; }
      hud();
    }
    function hud() {
      if (!o.onHud) return;
      var W0 = WX[wxName], hh = Math.floor(((hour % 24) + 24) % 24), mm = Math.floor((hour - Math.floor(hour)) * 60);
      var t = TEMP[season] + (sky.daylight ? sky.daylight(hour) * 5 - 3 : 0) - (wxName === "pluie" || wxName === "orage" ? 3 : 0);
      o.onHud({ weather: wxName, label: W0.label, ico: W0.ico, auto: wxMode === "auto", hour: String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0"),
        temp: Math.round(t), wind: Math.round(6 + cur.wind * 38), season: season, rainbow: rainbowK > 0.2 });
    }

    /* ── Étiquettes HTML ──────────────────────────────────────────────── */
    o.tags.innerHTML = stations.map(function (_, k) { return '<div class="rm-tag" data-t="' + k + '"><span>' + RM.j(k) + "</span><i></i></div>"; }).join("");
    var tagEls = Array.prototype.slice.call(o.tags.children);
    var LANDS = [{ p: V(C.sommet.x, 0, C.sommet.z), t: "Mont Tonnerre" }, { p: V(C.lac.x, 0, C.lac.z), t: "Lac Togo" }]
      .concat(C.villages.map(function (v) { return { p: V(v.x, 0, v.z), t: v.nom }; }));
    LANDS.forEach(function (l) { l.p.y = height(l.p.x, l.p.z) + (l.t === "Mont Tonnerre" ? 4 : 6); });
    if (o.landmarks) o.landmarks.innerHTML = LANDS.map(function (l) { return '<div class="rm-land"><span>' + l.t + "</span></div>"; }).join("");
    var landEls = o.landmarks ? Array.prototype.slice.call(o.landmarks.children) : [];
    function refreshTags() {
      tagEls.forEach(function (el, k) {
        var s0 = RM.state(k);
        el.classList.toggle("is-now", s0 === "now"); el.classList.toggle("is-sel", RM.st.sel === k); el.classList.toggle("is-past", s0 === "past");
        el.querySelector("span").textContent = s0 === "now" ? RM.j(k) + " · Aujourd'hui" : RM.j(k) + " · " + C.lieux[k];
      });
    }
    refreshTags();

    /* ── Caméra & contrôles ───────────────────────────────────────────── */
    var portrait = function () { return o.canvas.clientWidth < o.canvas.clientHeight; };
    var HOME = function () { return { t: V(-6, 4, -12), az: 0.2, pol: 1.17, d: portrait() ? 360 : 236 }; };
    var cam = api.camera, controls = new OrbitControls(cam, o.canvas);
    controls.enableDamping = true; controls.dampingFactor = 0.07; controls.screenSpacePanning = false;
    controls.minDistance = 38; controls.maxDistance = 420; controls.minPolarAngle = 0.3; controls.maxPolarAngle = 1.3;
    controls.zoomSpeed = 0.8; controls.rotateSpeed = 0.6;
    function sph(t, az, pol, d) { return V(t.x + d * Math.sin(pol) * Math.sin(az), t.y + d * Math.cos(pol), t.z + d * Math.sin(pol) * Math.cos(az)); }
    var H0 = HOME(); controls.target.copy(H0.t); cam.position.copy(sph(H0.t, H0.az, H0.pol, H0.d)); controls.update();
    api.onResize(function (w, h) { cam.clearViewOffset(); });
    var camTween = null;
    function flyTo(tgt, dist, dur, pol) {
      if (camTween) camTween.stop();
      var fromT = controls.target.clone(), fromP = cam.position.clone();
      var dir = fromP.clone().sub(fromT).normalize();
      if (pol != null) { var az = Math.atan2(dir.x, dir.z); dir = V(Math.sin(pol) * Math.sin(az), Math.cos(pol), Math.sin(pol) * Math.cos(az)); }
      var toP = tgt.clone().add(dir.multiplyScalar(dist));
      controls.enabled = false;
      camTween = K.tween(dur != null ? dur : 1100, function (v) { controls.target.lerpVectors(fromT, tgt, v); cam.position.lerpVectors(fromP, toP, v); var lift = Math.sin(v * Math.PI) * dist * 0.18; cam.position.y += lift; cam.lookAt(controls.target); }, "trace");
      camTween.finished.then(function () { controls.enabled = true; controls.update(); });
    }

    /* ── Interaction ──────────────────────────────────────────────────── */
    var ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), hover = null, downAt = 0, downXY = [0, 0];
    var hits = stations.map(function (s4) { return s4.hit; });
    function pick(e) {
      var r = o.canvas.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mouse, cam);
      var h = ray.intersectObjects(hits, false)[0];
      return h ? h.object.userData.station : null;
    }
    o.canvas.addEventListener("pointermove", function (e) { var k = pick(e); if (k !== hover) { hover = k; o.canvas.style.cursor = k == null ? "grab" : "pointer"; tagEls.forEach(function (el, j) { el.classList.toggle("is-hover", j === k); }); } });
    o.canvas.addEventListener("pointerdown", function (e) { downAt = performance.now(); downXY = [e.clientX, e.clientY]; });
    o.canvas.addEventListener("pointerup", function (e) { if (performance.now() - downAt < 300 && Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]) < 6) { var k = pick(e); if (k != null) RM.select(k); } });
    o.canvas.addEventListener("dblclick", function () { RM.emit("recenter"); });
    o.canvas.addEventListener("keydown", function (e) { if (e.key === "Enter" && RM.st.sel == null) RM.select(RM.st.today); });

    RM.on(function (ev, a) {
      if (ev === "select") {
        refreshTags();
        if (a == null) { var h = HOME(); flyTo(h.t, h.d * 0.9, 1100, h.pol); }
        else { var c = stations[a].p.clone(); c.y += 2; flyTo(c, portrait() ? 70 : 58, 1200, 0.95); }
      }
      if (ev === "recenter") { var s5 = stations[RM.st.today]; flyTo(s5.p.clone(), 90, 1200, 0.9); }
      if (ev === "advance") {
        var from = a.from, to = a.to;
        if (to < from) { for (var k = 0; k < N; k++) setStation(k, RM.state(k), false); placeTrain(stU[to]); refreshTags(); return; }
        var u0 = trainU, u1 = stU[to];
        setStation(from, "past", true);
        setStation(to, "future", false);
        K.tween(GST.reduced() ? 0 : Math.min(4200, 1400 + (u1 - u0) * L * 12), function (v) { placeTrain(u0 + (u1 - u0) * v); }, "tonnerre").finished.then(function () { setStation(to, "now", true); refreshTags(); });
        if (RM.st.sel == null) { var mid = stations[to].p.clone().lerp(stations[from].p, 0.4); flyTo(mid, 120, 1600, 0.88); }
      }
      if (ev === "view" && a === "3d") api.resize();
    });

    /* ── Saison ───────────────────────────────────────────────────────── */
    function setSeason(id) {
      if (!PAL[id]) return;
      season = id; P = PAL[id];
      terrain.userData.recolor(colorFn);
      gPines.userData.leafMat.color.set(P.leaf); gBroad.userData.leafMat.color.set(P.leaf2); shrubMat.color.set(P.leaf2);
      lake.material.color.set(P.water); rMat.color.set(P.water);
      wxStep = 0; wxT = 0; if (wxMode === "auto") pickWeather(AUTO[season][0][0]);
      hud();
    }

    /* ── Boucle ───────────────────────────────────────────────────────── */
    var proj = V(0, 0, 0);
    var hudClock = 0;
    api.onFrame(function (dt, t) {
      if (controls.enabled) {
        controls.update();
        controls.target.x = Math.max(-110, Math.min(110, controls.target.x)); controls.target.z = Math.max(-80, Math.min(85, controls.target.z));
      }
      // Heure
      if (hourMode === "cycle") targetHour += dt * 0.45; else if (hourMode === "auto") targetHour = realHour(); else targetHour = hourFor(hourMode);
      var dh = ((targetHour - hour) % 24 + 36) % 24 - 12;
      hour += hourMode === "cycle" ? dh : dh * Math.min(1, dt * 1.2);
      // Météo automatique
      if (wxMode === "auto" && !GST.reduced()) {
        wxT += dt; var seq = AUTO[season];
        if (wxT > seq[wxStep % seq.length][1]) { wxT = 0; wxStep++; pickWeather(seq[wxStep % seq.length][0]); }
      }
      var T = WX[wxName], kk = Math.min(1, dt * 0.45);
      cur.cover += (T.cover - cur.cover) * kk; cur.wind += (T.wind - cur.wind) * kk; cur.rain += (T.rain - cur.rain) * kk * 1.4; cur.dust += (T.dust - cur.dust) * kk; cur.storm += (T.storm - cur.storm) * kk;
      if (T.over !== cur.over) { cur.wk -= dt * 0.5; if (cur.wk <= 0.01) { cur.wk = 0; cur.over = T.over; } }
      else cur.wk += (T.wk - cur.wk) * kk;
      sky.compose(hour, cur.over, cur.wk);
      var night = sky.night;
      wind.uWind.value = cur.wind; wind.uDir.value.set(1, 0.25).normalize();
      clouds.userData.cover = cur.cover;
      var dark = Math.max(cur.storm, cur.over === "couvert" ? cur.wk * 0.5 : 0);
      clouds.setTone(new THREE.Color("#FFFFFF").lerp(new THREE.Color("#4E5E5C"), dark).lerp(new THREE.Color("#2E4B49"), night * 0.75), "#000000");
      rain.userData.intensity = cur.rain; rainCenter.set(controls.target.x, 0, controls.target.z);
      dust.userData.intensity = cur.dust;
      stars.material.opacity = night * (1 - cur.cover * 0.7) * 0.95;
      moon.material.opacity = night * (1 - cur.cover * 0.6);
      moon.position.copy(cam.position).add(V(-180, 260, -420));
      // Orage : éclairs sur les crêtes
      if (cur.storm > 0.6 && t - lastStorm > 2.2 + Math.random() * 4 && !GST.reduced()) {
        lastStorm = t;
        var x = -100 + Math.random() * 200, z = -78 + Math.random() * 60, y = height(x, z);
        bolts.strike(V(x + 8, 150, z - 10), V(x, y, z), { light: 2500, branches: 4, width: 0.5, depth: 7, onFlash: function (k) { if (o.onFlash) o.onFlash(k * 0.35); } });
      }
      // Arc-en-ciel après la pluie, de jour
      if (rainbowT > 0) rainbowT -= dt;
      var rbTarget = rainbowT > 0 && night < 0.3 && cur.rain < 0.2 ? 0.5 : 0;
      rainbowK += (rbTarget - rainbowK) * Math.min(1, dt * 0.6);
      rainbow.visible = rainbowK > 0.01; rainbow.children.forEach(function (m) { m.material.opacity = rainbowK * 0.55; });
      rainbow.lookAt(cam.position.x, rainbow.position.y, cam.position.z);
      // Lumières de nuit
      nightGlow.forEach(function (m) { m.emissiveIntensity = 0.15 + night * 2.2; });
      fires.forEach(function (f, k) { var fl = 0.85 + Math.sin(t * 19 + k) * 0.1 + Math.sin(t * 7.3) * 0.05; f.flame.scale.set(1 + Math.sin(t * 13 + k) * 0.1, fl * (1.1 - cur.rain * 0.6), 1); f.light.intensity = (10 + night * 160) * fl * (1 - cur.rain * 0.7); });
      // Pirogues
      boats.forEach(function (b2, k) { b2.userData.a += dt * 0.05 * (k % 2 ? 1 : -1); b2.position.set(C.lac.x + Math.cos(b2.userData.a) * b2.userData.r, LAKE_Y + 0.25 + Math.sin(t * 1.4 + k) * 0.08 * (1 + cur.wind), C.lac.z + Math.sin(b2.userData.a) * b2.userData.r * 0.8); b2.rotation.y = -b2.userData.a + (k % 2 ? 0 : Math.PI); b2.rotation.z = Math.sin(t * 1.2 + k) * 0.05 * (1 + cur.wind * 2); });
      // Drapeaux des gares
      stations.forEach(function (s6, k) {
        var fp = s6.flag.geometry.attributes.position, b0 = s6.fbase, wv = 0.3 + cur.wind;
        for (var q = 0; q < fp.count; q++) { var x0 = b0[q * 3]; fp.setZ(q, Math.sin(t * (4 + wv * 5) - x0 * 2.6 + k) * 0.18 * x0 * wv); }
        fp.needsUpdate = true;
        if (s6.beam.visible) { var pk = (t * 0.6) % 1; s6.halo.scale.setScalar(0.7 + pk * 0.9); s6.halo.material.opacity = 0.7 * (1 - pk); s6.beam.material.opacity = 0.08 + night * 0.14; }
        proj.copy(s6.p); proj.y += 9;
        var pr = K.project(api, proj), el = tagEls[k];
        el.style.transform = "translate(" + pr.x.toFixed(1) + "px," + pr.y.toFixed(1) + "px) translate(-50%,-100%)";
        var dist = cam.position.distanceTo(s6.p);
        el.classList.toggle("is-hidden", pr.behind || !(RM.state(k) === "now" || RM.st.sel === k || hover === k || dist < 150));
        el.classList.toggle("is-small", dist > 110 && RM.state(k) !== "now");
      });
      LANDS.forEach(function (l, k) { if (!landEls[k]) return; var pr = K.project(api, l.p); landEls[k].style.transform = "translate(" + pr.x.toFixed(1) + "px," + pr.y.toFixed(1) + "px) translate(-50%,-100%)"; landEls[k].classList.toggle("is-hidden", pr.behind); });
      // Fumée du train
      puffClock += dt * (0.8 + Math.min(4, trainSpeed * 0.6));
      if (puffClock > 0.18) {
        puffClock = 0; var pf = puffs[puffI++ % puffs.length], cp = new THREE.Vector3(); loco.userData.chim.getWorldPosition(cp);
        pf.position.copy(cp).add(V(0, 0.5, 0)); pf.userData.life = 1; pf.scale.setScalar(1);
      }
      puffs.forEach(function (pf) {
        if (pf.userData.life <= 0) { pf.material.opacity = 0; return; }
        pf.userData.life -= dt * 0.38;
        pf.position.y += dt * (2.2 - cur.rain); pf.position.x += dt * (1 + cur.wind * 7); pf.position.z += dt * cur.wind * 1.6;
        pf.scale.setScalar(1 + (1 - pf.userData.life) * 4.5); pf.material.opacity = pf.userData.life * 0.75;
        pf.material.color.set(night > 0.5 ? "#9AB0AD" : "#F4F4F2");
      });
      wheelsAll.forEach(function (wh) { wh.rotation.x -= trainSpeed * dt * 2.4; });
      trainSpeed *= 0.9;
      var nowMs = performance.now(); if (nowMs - hudClock > 900) { hudClock = nowMs; hud(); }
    });

    /* ── Intro : descente à travers les nuages, la voie se trace ──────── */
    function intro() {
      var reduced = GST.reduced(), h = HOME();
      var finalP = sph(h.t, h.az, h.pol, h.d), startP = sph(h.t, h.az + 0.5, 0.18, 520);
      controls.enabled = false;
      cars.forEach(function (c) { c.visible = false; });
      stations.forEach(function (s7) { s7.g.scale.setScalar(0.001); });
      ballastGeo.setDrawRange(0, 0); sleepers.count = 0; rails.forEach(function (r) { r.geometry.setDrawRange(0, 0); });
      var full = ballastGeo.index.count, rfull = rails[0].geometry.index.count;
      K.tween(reduced ? 0 : 2600, function (v) { cam.position.lerpVectors(startP, finalP, v); controls.target.copy(h.t); cam.lookAt(h.t); }, "trace").finished.then(function () { controls.enabled = true; controls.update(); });
      K.tween(reduced ? 0 : 1800, function (v) { ballastGeo.setDrawRange(0, Math.floor(v * full / 3) * 3); rails.forEach(function (r) { r.geometry.setDrawRange(0, Math.floor(v * rfull / 3) * 3); }); sleepers.count = Math.floor(v * nSleep); }, "trace", reduced ? 0 : 900);
      var sp3 = GST.SPRING_SEAT.samples;
      stations.forEach(function (s8, k) { K.tween(reduced ? 0 : GST.SPRING_SEAT.duration, function (v, raw) { var q = sp3[Math.min(sp3.length - 1, Math.floor(raw * (sp3.length - 1)))]; s8.g.scale.setScalar(Math.max(0.001, q)); }, function (x) { return x; }, reduced ? 0 : 1300 + k * 90); });
      setTimeout(function () {
        cars.forEach(function (c) { c.visible = true; });
        K.tween(reduced ? 0 : 2400, function (v) { placeTrain(Math.max(0.0001, stU[RM.st.today] * v)); }, "tonnerre");
      }, reduced ? 0 : 2400);
      placeTrain(0.0001);
    }

    K.perf(api, function () { o.onLowPerf && o.onLowPerf(); });
    api.start(); intro(); hud();
    var ctl = {
      api: api,
      setSeason: setSeason,
      setWeather: function (m) { wxMode = m; if (m === "auto") { wxT = 0; pickWeather(AUTO[season][wxStep % AUTO[season].length][0]); } else pickWeather(m); },
      setHourMode: function (m) { hourMode = m; if (m === "cycle") targetHour = hour; hud(); },
      home: function () { RM.select(null); },
      _pose: function (opts) { if (opts.season) setSeason(opts.season); if (opts.weather) { wxMode = opts.weather; wxName = opts.weather; var T0 = WX[wxName]; cur = { cover: T0.cover, wind: T0.wind, rain: T0.rain, over: T0.over, wk: T0.wk, dust: T0.dust, storm: T0.storm }; } if (opts.hour != null) { hourMode = "fixe"; hour = targetHour = opts.hour; } if (opts.rainbow) rainbowT = 30, rainbowK = 0.5; if (opts.cam) { if (camTween) camTween.stop(); var h0 = HOME(); var tg0 = opts.cam.t || h0.t; controls.target.copy(tg0); cam.position.copy(sph(tg0, opts.cam.az != null ? opts.cam.az : h0.az, opts.cam.pol || h0.pol, opts.cam.d || h0.d)); controls.enabled = true; controls.update(); } }
    };
    ctl.setSeason(season);
    return ctl;
  };
})();
