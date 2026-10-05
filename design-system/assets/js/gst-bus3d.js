/* ═══════════════════════════════════════════════════════════════════════
   GST GOVERNMENT — Bus volant 3D « Le Bus du Tonnerre » · v1.1
   Un bus scout à toit ouvert (80 sièges visibles = 80 inscriptions) porté par
   une grappe de ballons : chaque inscription gonfle la grappe. Quand le bus
   est plein, la portance suffit : 3 · 2 · 1, l'éclair frappe, décollage.
   En contrebas : le sud du Togo (collines, rivière, lagune, côte du golfe de
   Guinée, Attikoumé balisé), nuages, oiseaux, ciel à l'heure réelle.

   GST3D.scenes.bus(THREE, OrbitControls, { canvas, BUS, tip, names, onFlash })
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var K = window.GST3D, W = K.world, GST = window.GST, S = K.scenes;

  S.bus = function (THREE, OrbitControls, o) {
    var BUS = o.BUS, canvas = o.canvas;
    var V = function (x, y, z) { return new THREE.Vector3(x, y, z); };
    var api = K.setup(THREE, canvas, { fov: 32 });
    api.camera.near = 0.5; api.camera.far = 1600; api.camera.updateProjectionMatrix();
    W.modern(api, { shadows: true, shadowSize: 16, fogNear: 120, fogFar: 520, hemi: 1.25 });
    api.sun.shadow.mapSize.set(1024, 1024);
    var scene = api.scene, R = W.rng(3), Nz = W.noise(17);
    var sky = W.sky(api, "jour");
    var stars = W.stars(api, 600);
    var wind = W.wind(api); wind.uWind.value = 0.25;
    var hour = (function () { var d = new Date(); return d.getHours() + d.getMinutes() / 60; })();
    sky.compose(hour, null, 0);
    var night = sky.night;
    stars.material.opacity = night * 0.9;

    /* ── Le sud du Togo, vu du ciel ───────────────────────────────────── */
    var world = new THREE.Group(); scene.add(world);
    var SEA_Z = 120, LAG = { x: 30, z: 86, r: 22 }, CAMP = V(-18, 0, 40);
    var river = [V(-120, 0, -150), V(-80, 0, -90), V(-40, 0, -40), V(-10, 0, 10), V(20, 0, 60), V(30, 0, 86)];
    var rc = new THREE.CatmullRomCurve3(river, false, "centripetal"), rs = rc.getSpacedPoints(200);
    function rd(x, z) { var m = 1e9; for (var i = 0; i < rs.length; i += 2) { var d = (rs[i].x - x) * (rs[i].x - x) + (rs[i].z - z) * (rs[i].z - z); if (d < m) m = d; } return Math.sqrt(m); }
    function height(x, z) {
      var h = 2 + Nz.fbm(x * 0.012, z * 0.012, 5) * 7;
      h += W.smooth(-110, -260, z) * (10 + Nz.ridged(x * 0.02, z * 0.02, 4) * 34);   // plateaux et monts au nord (Kpalimé)
      h *= 1 - W.smooth(SEA_Z - 40, SEA_Z, z);                                         // la côte s'abaisse
      h = W.lerp(h, -6, W.smooth(SEA_Z - 6, SEA_Z + 10, z));                           // le golfe
      var dl = Math.hypot((x - LAG.x) / 1.6, z - LAG.z); h = W.lerp(h, -3, 1 - W.smooth(LAG.r * 0.6, LAG.r * 1.1, dl));
      var d = rd(x, z); h = W.lerp(h, -2.5, 1 - W.smooth(2.5, 9, d));
      var dc = Math.hypot(x - CAMP.x, z - CAMP.z); h = W.lerp(4, h, W.smooth(6, 16, dc));
      return h;
    }
    var cG = new THREE.Color("#6E9B4F"), cG2 = new THREE.Color("#4E8A4C"), cF = new THREE.Color("#2E6B4E"), cS = new THREE.Color("#E3D3A8"), cR = W.c(api, "--gst-teal-600"), cH = W.c(api, "--gst-teal-300"), cFi = new THREE.Color("#C9B26A");
    var terrain = W.terrain(api, { size: 560, depth: 520, seg: 160, height: height, color: function (c, y, ny, x, z) {
      c.copy(cG).lerp(cG2, Nz(x * 0.03, z * 0.03) * 0.5 + 0.5);
      if (Nz(x * 0.018 + 9, z * 0.018) > 0.2) c.lerp(cF, 0.65);
      var fx = Math.floor(x / 9), fz = Math.floor(z / 6), hs = Math.abs(Math.sin(fx * 12.9898 + fz * 78.233) * 43758.5453) % 1;
      if (z > 20 && z < SEA_Z - 14 && hs > 0.62 && y < 8) c.copy(hs > 0.82 ? cFi : new THREE.Color("#8DB65E"));
      if (y < 0.4) c.copy(cS);
      if (ny < 0.82) c.lerp(cR, W.smooth(0.82, 0.55, ny));
      if (y > 18) c.lerp(cH, W.smooth(18, 34, y));
    } });
    world.add(terrain);
    var sea = W.water(api, { w: 2400, d: 1400, seg: 60, color: "#2E8F89", opacity: 1 }); sea.position.set(0, -1.4, SEA_Z + 690); world.add(sea);
    var lag = W.water(api, { w: LAG.r * 3.6, d: LAG.r * 2.4, seg: 20, color: "#5FAAA5" }); lag.position.set(LAG.x, -1.3, LAG.z); world.add(lag);
    // Rivière (ruban)
    (function () { var p = [], idx = []; for (var i = 0; i <= 200; i++) { var t = rc.getTangentAt(i / 200), n = V(-t.z, 0, t.x), w = 3 + i / 200 * 3, q = rs[i]; p.push(q.x + n.x * w, -1.2, q.z + n.z * w, q.x - n.x * w, -1.2, q.z - n.z * w); if (i < 200) { var b = i * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); } }
      var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.setIndex(idx); g.computeVertexNormals(); world.add(new THREE.Mesh(g, lag.material)); })();
    // Forêts, palmiers côtiers, villages
    var pines = [], broad = [], palms = [];
    for (var i = 0; i < 2600; i++) {
      var x = (R() - 0.5) * 520, z = (R() - 0.5) * 480 - 20, y = height(x, z);
      if (y < 0.6 || rd(x, z) < 8 || Math.hypot(x - CAMP.x, z - CAMP.z) < 14) continue;
      if (z > SEA_Z - 26 && R() < 0.5) { palms.push([x, y, z, 1.6 + R(), R() * 6]); continue; }
      if (Nz(x * 0.018 + 9, z * 0.018) > 0.2) (y > 14 ? pines : broad).push([x, y - 0.2, z, 1.8 + R() * 1.4, R() * 6]);
    }
    world.add(W.pines(api, pines, "--gst-teal-600"), W.broadleaf(api, broad, "#4F8A44"), W.palms(api, palms));
    var winMat = new THREE.MeshStandardMaterial({ color: new THREE.Color("#3A2A10"), emissive: new THREE.Color("#FFC861"), emissiveIntensity: night * 2 });
    [[60, 60, 9, "Tsévié"], [-70, 10, 7, ""], [90, 104, 12, "Lomé"], [-30, -60, 6, ""]].forEach(function (v) {
      for (var h = 0; h < v[2]; h++) {
        var a = h / v[2] * 6.28, r = 6 + (h % 3) * 4, hx = v[0] + Math.cos(a) * r, hz = v[1] + Math.sin(a) * r, hy = height(hx, hz);
        var house = new THREE.Group();
        var wall = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, 3), W.std(api, h % 2 ? "#EADFC8" : "#D9B98E")); wall.position.y = 1.2;
        var roof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.8, 4), W.std(api, ["#B5562E", "#9E1C18", "#06605E"][h % 3])); roof.rotation.y = Math.PI / 4; roof.position.y = 3.3;
        var win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), winMat); win.position.set(0, 1.3, 1.51);
        house.add(wall, roof, win); house.position.set(hx, hy, hz); house.rotation.y = a; world.add(house);
      }
    });
    // Attikoumé : camp scout balisé (tentes + faisceau rouge pulsant)
    var camp = S.camp(api, V(CAMP.x, 4, CAMP.z), null); camp.scale.setScalar(2.2); world.add(camp);
    var beacon = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 3.2, 46, 24, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color("#C42621"), transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
    beacon.position.set(CAMP.x, 27, CAMP.z); world.add(beacon);
    var ringG = new THREE.Mesh(new THREE.RingGeometry(9, 11, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color("#C42621"), transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
    ringG.rotation.x = -Math.PI / 2; ringG.position.set(CAMP.x, 4.3, CAMP.z); world.add(ringG);
    var campTag = V(CAMP.x, 12, CAMP.z);

    /* ── Le bus ───────────────────────────────────────────────────────── */
    var BUS_Y = 62;
    var rig = new THREE.Group(); rig.position.y = BUS_Y; scene.add(rig);
    var bus = new THREE.Group(); rig.add(bus);
    var L = 12.6, Wd = 4.4, Hw = 1.25;
    function roundedProfile(w, h, r) { var s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
    var teal = W.std(api, "--gst-teal-500", { flatShading: false, roughness: 0.45, metalness: 0.15 });
    var cream = W.std(api, "--gst-cream", { flatShading: false, roughness: 0.6 });
    var red = W.std(api, "--gst-red-500", { flatShading: false, roughness: 0.45 });
    var dark = W.std(api, "#1E2B2A", { flatShading: false, roughness: 0.5 });
    var glass = new THREE.MeshStandardMaterial({ color: new THREE.Color("#0C4A48"), roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.32 });
    // Caisse basse arrondie, extrudée sur la longueur
    var lowerGeo = new THREE.ExtrudeGeometry(roundedProfile(Wd, 1.5, 0.45), { depth: L - 0.8, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.3, bevelSegments: 4, curveSegments: 6 });
    lowerGeo.translate(0, 0, -(L - 0.8) / 2);
    var lower = new THREE.Mesh(lowerGeo, teal); lower.position.y = -0.75; lower.castShadow = true; bus.add(lower);
    var stripe = new THREE.Mesh(new THREE.BoxGeometry(Wd + 0.62, 0.2, L - 0.4), red); stripe.position.y = -0.35; bus.add(stripe);
    var floor = new THREE.Mesh(new THREE.BoxGeometry(Wd - 0.2, 0.12, L - 0.4), cream); floor.position.y = 0.02; floor.receiveShadow = true; bus.add(floor);
    // Vitrages et montants : on voit les sièges à travers
    var nPil = 9;
    [-1, 1].forEach(function (sx) {
      var pane = new THREE.Mesh(new THREE.BoxGeometry(0.06, Hw, L - 0.9), glass); pane.position.set(sx * (Wd / 2 + 0.05), Hw / 2, 0); bus.add(pane);
      for (var k = 0; k < nPil; k++) { var pil = new THREE.Mesh(new THREE.BoxGeometry(0.16, Hw, 0.18), teal); pil.position.set(sx * (Wd / 2 + 0.06), Hw / 2, -L / 2 + 0.5 + k * ((L - 1) / (nPil - 1))); bus.add(pil); }
      var rail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, L - 0.6, 10), cream); rail.rotation.x = Math.PI / 2; rail.position.set(sx * (Wd / 2 + 0.06), Hw + 0.08, 0); bus.add(rail);
    });
    [-1, 1].forEach(function (sz) { var rail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, Wd + 0.12, 10), cream); rail.rotation.z = Math.PI / 2; rail.position.set(0, Hw + 0.08, sz * (L / 2 - 0.3)); bus.add(rail); });
    // Avant : pare-brise, phares, calandre, pare-chocs ; arrière : feux
    var wind1 = new THREE.Mesh(new THREE.BoxGeometry(Wd - 0.2, Hw, 0.06), glass); wind1.position.set(0, Hw / 2, -L / 2 + 0.3); bus.add(wind1);
    var back = new THREE.Mesh(new THREE.BoxGeometry(Wd - 0.2, Hw, 0.12), teal); back.position.set(0, Hw / 2, L / 2 - 0.3); bus.add(back);
    var lampMat = new THREE.MeshStandardMaterial({ color: new THREE.Color("#FFF6DA"), emissive: new THREE.Color("#FFE38A"), emissiveIntensity: 0.6 + night * 2 });
    var tailMat = new THREE.MeshStandardMaterial({ color: new THREE.Color("#C42621"), emissive: new THREE.Color("#C42621"), emissiveIntensity: 0.5 + night });
    [-1, 1].forEach(function (sx) {
      var hl = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 16), lampMat); hl.rotation.x = Math.PI / 2; hl.position.set(sx * 1.45, -0.6, -L / 2 - 0.02); bus.add(hl);
      var tl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.1), tailMat); tl.position.set(sx * 1.6, -0.55, L / 2 + 0.02); bus.add(tl);
    });
    var grille = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.08), dark); grille.position.set(0, -0.7, -L / 2 - 0.03); bus.add(grille);
    [-1, 1].forEach(function (sz) { var bump = new THREE.Mesh(new THREE.BoxGeometry(Wd + 0.3, 0.28, 0.3), dark); bump.position.set(0, -1.3, sz * (L / 2 + 0.05)); bus.add(bump); });
    // Roues à enjoliveur
    var wheelG = new THREE.CylinderGeometry(0.68, 0.68, 0.46, 20); wheelG.rotateZ(Math.PI / 2);
    var hubG = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 12); hubG.rotateZ(Math.PI / 2);
    var wheels = [];
    [-1, 1].forEach(function (sx) { [-4.1, 4.1].forEach(function (z) { var wh = new THREE.Mesh(wheelG, W.std(api, "#1A1A1A", { flatShading: false })); wh.position.set(sx * (Wd / 2 + 0.05), -1.45, z); var hb = new THREE.Mesh(hubG, cream); wh.add(hb); bus.add(wh); wheels.push(wh); }); });
    // Décor ⚜ GST · TONNERRE sur les flancs
    var cv = document.createElement("canvas"); cv.width = 1024; cv.height = 160;
    var decal = new THREE.CanvasTexture(cv); decal.colorSpace = THREE.SRGBColorSpace;
    var drawDecal = function () { var g = cv.getContext("2d"); g.clearRect(0, 0, 1024, 160); g.fillStyle = "#F4F4F2"; g.font = "120px 'EB Garamond', serif"; g.fillText("⚜", 24, 124); g.font = "120px 'Bebas Neue', sans-serif"; g.fillText("GST · TONNERRE", 150, 124); decal.needsUpdate = true; };
    drawDecal(); if (document.fonts) document.fonts.ready.then(drawDecal);
    [-1, 1].forEach(function (sx) { var d = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.03), new THREE.MeshBasicMaterial({ map: decal, transparent: true })); d.position.set(sx * (Wd / 2 + 0.56), -0.86, 0.9); d.rotation.y = sx * Math.PI / 2; bus.add(d); });

    /* ── 80 sièges : 20 rangées × 4, allée centrale ───────────────────── */
    var N = BUS.seats.length, ROWS = 20;
    var seatXY = function (i) { var r = Math.floor(i / 4), c = i % 4; return [[-1.55, -0.8, 0.8, 1.55][c], -L / 2 + 0.95 + r * ((L - 1.6) / (ROWS - 1))]; };
    var baseGeo = new THREE.BoxGeometry(0.62, 0.3, 0.5); baseGeo.translate(0, 0.15, 0);
    var backGeo = new THREE.CapsuleGeometry(0.28, 0.32, 3, 8); backGeo.scale(1, 1, 0.3); backGeo.translate(0, 0.5, 0);
    var gaugeGeo = new THREE.BoxGeometry(0.1, 0.62, 0.06); gaugeGeo.translate(0, 0.31, 0);
    var seatMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    var bases = new THREE.InstancedMesh(baseGeo, seatMat, N), backs = new THREE.InstancedMesh(backGeo, seatMat, N);
    var ghostMat = new THREE.MeshStandardMaterial({ color: new THREE.Color("#C6E2E0"), transparent: true, opacity: 0.35, roughness: 0.8 });
    var ghosts = new THREE.InstancedMesh(baseGeo, ghostMat, N);
    var gauges = new THREE.InstancedMesh(gaugeGeo, W.std(api, "--gst-teal-500"), N);
    var fleurTex = (function () { var c = document.createElement("canvas"); c.width = c.height = 64; var g = c.getContext("2d"); g.fillStyle = "#F4F4F2"; g.font = "54px 'EB Garamond', serif"; g.textAlign = "center"; g.fillText("⚜", 32, 50); var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    var fleurs = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: fleurTex, transparent: true, depthWrite: false }), N);
    var hit = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 1, 0.66), new THREE.MeshBasicMaterial({ visible: false }), N);
    bases.castShadow = backs.castShadow = true;
    bus.add(bases, backs, ghosts, gauges, fleurs, hit);
    var fill = new Float32Array(N);
    var M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), VV = new THREE.Vector3(), SC = new THREE.Vector3();
    var qUp = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    var COL = { free: new THREE.Color("#F4F4F2"), occ: W.c(api, "--gst-teal-500"), res: new THREE.Color("#F4F4F2"), part: new THREE.Color("#F4F4F2"), gar: W.c(api, "--gst-teal-500") };
    function writeSeat(i) {
      var xz = seatXY(i), st = BUS.shown(i), f = fill[i];
      var c = COL[st].clone(); if (st === "res") c.set("#E4E4E1");
      bases.setColorAt(i, c); backs.setColorAt(i, c);
      var k = st === "free" ? 0.0001 : Math.max(0.0001, f);
      M4.compose(VV.set(xz[0], 0.08, xz[1]), Q.identity(), SC.set(1, k, 1)); bases.setMatrixAt(i, M4);
      M4.compose(VV.set(xz[0], 0.08, xz[1] + 0.22), Q.identity(), SC.set(1, k, 1)); backs.setMatrixAt(i, M4);
      M4.compose(VV.set(xz[0], 0.08, xz[1]), Q.identity(), SC.set(1, st === "free" ? 1 : 0.0001, 1)); ghosts.setMatrixAt(i, M4);
      var gk = st === "part" ? 0.5 * f : 0.0001;
      M4.compose(VV.set(xz[0] + 0.38, 0.08, xz[1] + 0.22), Q.identity(), SC.set(1, Math.max(0.0001, gk), 1)); gauges.setMatrixAt(i, M4);
      var fk = st === "gar" ? f : 0.0001;
      M4.compose(VV.set(xz[0], 0.42, xz[1] - 0.02), qUp, SC.set(fk, fk, fk)); fleurs.setMatrixAt(i, M4);
      M4.compose(VV.set(xz[0], 0.5, xz[1] + 0.05), Q.identity(), SC.set(1, 1, 1)); hit.setMatrixAt(i, M4);
    }
    function flush() { [bases, backs, ghosts, gauges, fleurs, hit].forEach(function (m) { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }); }
    for (i = 0; i < N; i++) { fill[i] = BUS.seats[i].etat ? 1 : 0; writeSeat(i); } flush();
    function allSeats() { for (var k = 0; k < N; k++) writeSeat(k); flush(); }

    /* ── La grappe de ballons ─────────────────────────────────────────── */
    var ANCHOR_Y = Hw + 7.5;
    var anchor = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 8, 24), dark); anchor.rotation.x = Math.PI / 2; anchor.position.y = ANCHOR_Y; rig.add(anchor);
    var ropeMat = new THREE.LineBasicMaterial({ color: new THREE.Color("#2A2A2A"), transparent: true, opacity: 0.85 });
    var corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { return V(q[0] * (Wd / 2 + 0.06), Hw + 0.1, q[1] * (L / 2 - 0.6)); });
    var ropes = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(corners.reduce(function (a, c) { return a.concat([c, V(0, ANCHOR_Y, 0)]); }, [])), ropeMat);
    rig.add(ropes);
    var NB = 22, PALB = ["#0C7873", "#C42621", "#F4F4F2", "#FFD23F", "#5FAAA5", "#0C7873", "#E0716D", "#93C8C4"];
    var balloonGeo = new THREE.SphereGeometry(1.25, 20, 14); balloonGeo.scale(1, 1.18, 1);
    var knotGeo = new THREE.ConeGeometry(0.22, 0.34, 8); knotGeo.translate(0, -1.62, 0);
    var balloons = [], strGeo = new THREE.BufferGeometry(), strPos = new Float32Array(NB * 6);
    strGeo.setAttribute("position", new THREE.BufferAttribute(strPos, 3));
    var strings = new THREE.LineSegments(strGeo, new THREE.LineBasicMaterial({ color: new THREE.Color("#4A4A4A"), transparent: true, opacity: 0.7 })); strings.frustumCulled = false; rig.add(strings);
    for (i = 0; i < NB; i++) {
      // Points de Fibonacci sur un dôme, plus serrés au centre
      var t = (i + 0.5) / NB, phi = Math.acos(1 - t * 0.95), th = i * 2.399963;
      var rr = 4.6, home = V(Math.sin(phi) * Math.cos(th) * rr, ANCHOR_Y + 5.6 + Math.cos(phi) * rr * 0.9, Math.sin(phi) * Math.sin(th) * rr * 1.25);
      var mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(PALB[i % PALB.length]), roughness: 0.28, metalness: 0.05, emissive: new THREE.Color(PALB[i % PALB.length]), emissiveIntensity: 0.05 });
      var b = new THREE.Mesh(balloonGeo, mat); b.add(new THREE.Mesh(knotGeo, mat));
      var shine = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })); shine.position.set(-0.45, 0.6, 0.85); b.add(shine);
      b.position.copy(home); b.castShadow = true;
      b.userData = { home: home, ph: R() * 6.28, sp: 0.6 + R() * 0.5, k: 1, target: 1 };
      rig.add(b); balloons.push(b);
    }
    function lift() { return BUS.count() / N; }
    function setInflation(instant) {
      var n = Math.max(6, Math.round(NB * (0.25 + 0.75 * lift())));
      balloons.forEach(function (b, k) { b.userData.target = k < n ? 1 : 0; if (instant) b.userData.k = b.userData.target; });
    }
    setInflation(true);

    /* ── Ciel, nuages, oiseaux, éclair ────────────────────────────────── */
    var clouds = W.cloudField(api, { count: 34, spread: 520, depth: 420, y: 30, yVar: 70, scale: 3 }); clouds.userData.cover = 0.6; scene.add(clouds);
    clouds.setTone(night > 0.5 ? "#2E4B49" : "#FFFFFF");
    var birdsA = W.birds(api, { count: 7, scale: 1.1, speed: 0.07, path: function (t) { return V(Math.cos(t) * 34, BUS_Y + 6 + Math.sin(t * 2) * 3, Math.sin(t) * 26); } });
    var birdsB = W.birds(api, { count: 5, scale: 0.9, speed: 0.05, seed: 8, t0: 3, path: function (t) { return V(-40 + Math.cos(t * 0.8) * 60, BUS_Y - 14 + Math.sin(t * 2.4) * 2, -30 + Math.sin(t * 0.8) * 40); } });
    scene.add(birdsA, birdsB);
    var bolts = W.lightning(api); scene.add(bolts);
    var spark = (function () { var g = new THREE.Group(); return g; })();

    /* ── Caméra & orbite ──────────────────────────────────────────────── */
    var target = V(0, BUS_Y + 5.5, 0);
    var AZ0 = 2.05, EL0 = 0.12, R0 = function () { return canvas.clientWidth < canvas.clientHeight ? 92 : 54; };
    var cam = api.camera;
    cam.position.set(Math.sin(AZ0) * Math.cos(EL0) * R0(), target.y + Math.sin(EL0) * R0(), Math.cos(AZ0) * Math.cos(EL0) * R0());
    var controls = new OrbitControls(cam, canvas);
    controls.enableDamping = true; controls.enablePan = false; controls.target.copy(target);
    controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.75; controls.minDistance = 22; controls.maxDistance = 140; controls.rotateSpeed = 0.6;
    controls.update();
    api.onResize(function (w, h) { cam.setViewOffset(w, h, w < h ? 0 : -w * 0.04, w < h ? h * 0.04 : -h * 0.02, w, h); }); api.resize();

    /* ── Survol / toucher d'un siège ──────────────────────────────────── */
    var ray = new THREE.Raycaster(), mouse = new THREE.Vector2(), hov = -1;
    var seatWorld = function (i) { var xz = seatXY(i); return bus.localToWorld(V(xz[0], 0.9, xz[1])); };
    function pick(e) { var r = canvas.getBoundingClientRect(); mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(mouse, cam); var h = ray.intersectObject(hit)[0]; return h ? h.instanceId : -1; }
    function showTip(i) {
      if (i < 0) { o.tip.classList.remove("is-on"); return; }
      var p = K.project(api, seatWorld(i)); o.tip.textContent = BUS.label(i, BUS.view === "resp"); o.tip.style.left = p.x + "px"; o.tip.style.top = p.y + "px"; o.tip.classList.add("is-on");
    }
    canvas.addEventListener("pointermove", function (e) { var i2 = pick(e); if (i2 !== hov) { hov = i2; canvas.style.cursor = i2 < 0 ? "grab" : "pointer"; } showTip(i2); });
    canvas.addEventListener("pointerleave", function () { hov = -1; showTip(-1); });
    canvas.addEventListener("click", function (e) { var i2 = pick(e); hov = i2; showTip(i2); });

    function nameTag(i, text) {
      var el = document.createElement("div"); el.className = "bus-name"; o.names.appendChild(el);
      el._seat = i; GST.decode(el, text);
      setTimeout(function () { el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" }).finished.then(function () { el.remove(); }); }, 2600);
    }
    function ripple(i) {
      var xz = seatXY(i);
      var rg = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.52, 32), new THREE.MeshBasicMaterial({ color: W.c(api, "--gst-teal-500"), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      rg.rotation.x = -Math.PI / 2; rg.position.set(xz[0], 0.12, xz[1]); bus.add(rg);
      K.tween(GST.reduced() ? 0 : 700, function (v) { rg.scale.setScalar(1 + v * 4); rg.material.opacity = 1 - v; }, "tonnerre").finished.then(function () { bus.remove(rg); });
    }
    // Un petit ballon rouge apporte l'inscription jusqu'au siège
    var pinGeo = new THREE.SphereGeometry(0.42, 14, 10); pinGeo.scale(1, 1.18, 1);
    function dropPin(i) {
      var xz = seatXY(i);
      fill[i] = 0; writeSeat(i); flush();
      var pin = new THREE.Group(); var ball = new THREE.Mesh(pinGeo, red); ball.position.y = 1.4;
      var str = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.0, 4), dark); str.position.y = 0.5;
      pin.add(ball, str); pin.position.set(xz[0], 14, xz[1]); bus.add(pin);
      var sp = GST.SPRING_DROP.samples, dur = GST.reduced() ? 0 : GST.SPRING_DROP.duration * 1.7;
      K.tween(dur, function (v, raw) { var k = sp[Math.min(sp.length - 1, Math.floor(raw * (sp.length - 1)))]; pin.position.y = 14 - k * 13.6; pin.rotation.z = Math.sin(raw * 12) * 0.2 * (1 - raw); }, function (x) { return x; }).finished.then(function () {
        K.tween(GST.reduced() ? 0 : 460, function (v) { fill[i] = v; writeSeat(i); flush(); pin.scale.setScalar(1 - v * 0.95); pin.position.y = 0.4 - v * 0.4; }, "tonnerre").finished.then(function () { bus.remove(pin); });
        ripple(i); nameTag(i, (BUS.seats[i].prenom + " " + BUS.seats[i].initiale).toUpperCase());
      });
    }
    BUS.on(function (e, i) {
      if (e === "register" && !BUS.frame.classList.contains("is-2d")) { dropPin(i); setInflation(false); }
      if (e === "pay") { writeSeat(i); flush(); ripple(i); if (BUS.view !== "public") nameTag(i, BUS.label(i).split(" · ").slice(2).join(" · ")); }
      if (e === "view" || e === "reset") { for (var k = 0; k < N; k++) fill[k] = BUS.seats[k].etat ? 1 : 0; allSeats(); setInflation(e === "reset"); }
      if (e === "full" && !BUS.frame.classList.contains("is-2d")) takeoff();
      if (e === "2d" && !i) api.resize();
    });

    /* ══ Décollage ══════════════════════════════════════════════════════ */
    var climbing = false, pump = 0;
    function takeoff() {
      if (climbing) return Promise.resolve(); climbing = true;
      var reduced = GST.reduced();
      controls.enabled = false;
      var camFrom = cam.position.clone(), tgtFrom = controls.target.clone();
      var dir = camFrom.clone().sub(tgtFrom).normalize();
      var tgtWide = V(0, BUS_Y + 10, 0), posWide = tgtWide.clone().add(dir.multiplyScalar(canvas.clientWidth < canvas.clientHeight ? 130 : 90));
      K.tween(reduced ? 0 : 1300, function (v) { controls.target.lerpVectors(tgtFrom, tgtWide, v); cam.position.lerpVectors(camFrom, posWide, v); cam.lookAt(controls.target); }, "trace");
      return BUS.countdown().then(function () {
        var top = rig.localToWorld(V(0, ANCHOR_Y + 11, 0));
        bolts.strike(top.clone().add(V(4, 90, -6)), top, { light: 1400, branches: 4, width: 0.28, onFlash: o.onFlash });
        if (navigator.vibrate) try { navigator.vibrate([40, 60, 120]); } catch (e) {}
        K.tween(reduced ? 0 : 600, function (v) { pump = v; }, "tonnerre");
        return GST.wait(reduced ? 0 : 420);
      }).then(function () {
        var y0 = rig.position.y, cy0 = controls.target.y, cp0 = cam.position.y;
        return K.tween(reduced ? 0 : 2400, function (v, raw) {
          rig.position.y = y0 + v * 140;
          if (raw < 0.5) { var dy = rig.position.y - y0; controls.target.y = cy0 + dy * 0.85; cam.position.y = cp0 + dy * 0.85; }
          cam.lookAt(controls.target);
        }, "strike").finished;
      }).then(function () { BUS.stampFull(); return GST.wait(reduced ? 0 : 1600); }).then(function () {
        var tNow = controls.target.clone(), pNow = cam.position.clone();
        rig.position.y = BUS_Y + 70;
        return K.tween(reduced ? 0 : 1900, function (v) {
          rig.position.y = BUS_Y + 70 * (1 - v); pump = 1 - v;
          controls.target.lerpVectors(tNow, tgtFrom, v); cam.position.lerpVectors(pNow, camFrom, v); cam.lookAt(controls.target);
        }, "tonnerre").finished;
      }).then(function () { controls.enabled = true; climbing = false; });
    }

    /* ── Ralenti permanent ────────────────────────────────────────────── */
    var tmp = V(0, 0, 0);
    api.onFrame(function (dt, t) {
      if (controls.enabled) controls.update();
      var red2 = GST.reduced();
      if (!red2) {
        rig.rotation.z = Math.sin(t * Math.PI * 2 / 6) * 0.03; rig.rotation.x = Math.sin(t * Math.PI * 2 / 7.5) * 0.018;
        if (!climbing) rig.position.y = BUS_Y + Math.sin(t * 0.9) * 0.45;
        world.position.x = Math.sin(t * 0.03) * 24; world.position.z = Math.cos(t * 0.024) * 16 - t * 0.0;
      }
      // Ballons : flottent, s'entrechoquent doucement, gonflent selon les inscriptions
      balloons.forEach(function (b, k) {
        var u = b.userData;
        u.k += (u.target - u.k) * Math.min(1, dt * 2.2);
        var s = Math.max(0.001, u.k) * (1 + pump * 0.14 + Math.sin(t * 2 + u.ph) * 0.015);
        b.scale.set(s, s * (1 + Math.sin(t * 1.7 + u.ph) * 0.02), s);
        b.visible = u.k > 0.02;
        var sway = red2 ? 0 : 1;
        b.position.set(u.home.x + Math.sin(t * u.sp + u.ph) * 0.35 * sway, u.home.y + Math.sin(t * u.sp * 1.3 + u.ph) * 0.3 * sway + pump * 1.2, u.home.z + Math.cos(t * u.sp + u.ph) * 0.35 * sway);
        b.rotation.z = Math.sin(t * u.sp + u.ph) * 0.12 * sway; b.rotation.x = Math.cos(t * u.sp * 0.8 + u.ph) * 0.1 * sway;
        var kk = k * 6, bot = b.position.clone().add(V(0, -1.62 * s, 0));
        if (!b.visible) bot.set(0, ANCHOR_Y, 0);
        strPos[kk] = 0; strPos[kk + 1] = ANCHOR_Y; strPos[kk + 2] = 0; strPos[kk + 3] = bot.x; strPos[kk + 4] = bot.y; strPos[kk + 5] = bot.z;
      });
      strGeo.attributes.position.needsUpdate = true;
      wheels.forEach(function (wh) { wh.rotation.x += dt * 0.6; });
      var pk = (t * 0.5) % 1; ringG.scale.setScalar(0.7 + pk * 1.2); ringG.material.opacity = 0.75 * (1 - pk);
      o.names.querySelectorAll(".bus-name").forEach(function (el) { var p = K.project(api, seatWorld(el._seat)); el.style.transform = "translate(" + p.x + "px," + (p.y - 14) + "px) translate(-50%,-100%)"; });
      if (hov > -1) { var p = K.project(api, seatWorld(hov)); o.tip.style.left = p.x + "px"; o.tip.style.top = p.y + "px"; }
      if (o.campTag) { tmp.copy(campTag).add(world.position); var pc = K.project(api, tmp); o.campTag.style.transform = "translate(" + pc.x.toFixed(1) + "px," + pc.y.toFixed(1) + "px) translate(-50%,-100%)"; o.campTag.classList.toggle("is-hidden", pc.behind); }
    });
    K.perf(api, function () { o.onLowPerf && o.onLowPerf(); });
    api.start();
    return { api: api, takeoff: takeoff, rig: rig };
  };
})();
