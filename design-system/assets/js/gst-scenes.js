/* ═══════════════════════════════════════════════════════════════════════
   GST GOVERNMENT — Scènes 3D signature · v1.1
   GST3D.scenes.vitrine  : « La Crête du Tonnerre » — intro cinématique du site
                           vitrine. I. La graine (une fleur de lys pousse sur la
                           colline) · II. La tempête · III. La frappe · IV. La crête.
   GST3D.scenes.crest    : médaillon 3D de la Crête, interactif (M10).
   Scripts classiques : chaque scène reçoit THREE (chargé à la demande).
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var K = window.GST3D, W = K.world, GST = window.GST;
  var S = (K.scenes = {});

  /* ── Outils communs ──────────────────────────────────────────────────── */
  function sparks(api, n) {
    var THREE = api.THREE;
    var pos = new Float32Array(n * 3), vel = new Float32Array(n * 3);
    var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var c = document.createElement("canvas"); c.width = c.height = 32; var x = c.getContext("2d");
    var gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,250,220,1)"); gr.addColorStop(0.35, "rgba(255,210,63,.9)"); gr.addColorStop(1, "rgba(255,210,63,0)");
    x.fillStyle = gr; x.fillRect(0, 0, 32, 32);
    var m = new THREE.PointsMaterial({ size: 0.9, map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
    var pts = new THREE.Points(g, m); pts.frustumCulled = false; api.scene.add(pts);
    var life = 0;
    api.onFrame(function (dt) {
      if (life <= 0) { pts.visible = false; return; }
      life -= dt; pts.visible = true; m.opacity = Math.min(1, life * 1.4);
      for (var i = 0; i < n; i++) {
        vel[i * 3 + 1] -= 9 * dt;
        pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
      }
      g.attributes.position.needsUpdate = true;
    });
    pts.burst = function (at, power) {
      var r = W.rng((Math.random() * 1e6) | 0);
      for (var i = 0; i < n; i++) {
        pos[i * 3] = at.x; pos[i * 3 + 1] = at.y; pos[i * 3 + 2] = at.z;
        var th = r() * Math.PI * 2, ph = r() * Math.PI * 0.5, sp = (power || 10) * (0.3 + r() * 0.9);
        vel[i * 3] = Math.cos(th) * Math.cos(ph) * sp; vel[i * 3 + 1] = Math.sin(ph) * sp * 1.1 + 2; vel[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * sp;
      }
      life = 1.8;
    };
    return pts;
  }

  function camp(api, at, hFn) {
    var THREE = api.THREE, g = new THREE.Group();
    g.position.copy(at);
    var tentMats = [W.std(api, "--gst-cream"), W.std(api, "--gst-red-500"), W.std(api, "--gst-teal-200")];
    [[0, 0, 0], [2.6, 0.5, 1], [4.8, -0.4, 0], [1.2, 2.8, 2], [3.8, 2.6, 0], [-1.6, 2.2, 0]].forEach(function (t, i) {
      var tent = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.3, 4), tentMats[t[2]]);
      var y = hFn ? hFn(at.x + t[0], at.z + t[1]) - at.y : 0;
      tent.position.set(t[0], y + 0.62, t[1]); tent.rotation.y = Math.PI / 4 + i * 0.3; tent.castShadow = true; g.add(tent);
    });
    var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 4.4, 6), W.std(api, "--gst-ink"));
    mast.position.set(-2.4, 2.2, 0.4); mast.castShadow = true; g.add(mast);
    var flagGeo = new THREE.PlaneGeometry(1.4, 0.85, 8, 2); flagGeo.translate(0.7, 0, 0);
    var flag = new THREE.Mesh(flagGeo, W.std(api, "--gst-red-500", { side: THREE.DoubleSide, flatShading: false }));
    flag.position.set(-2.38, 3.95, 0.4); g.add(flag);
    var fp = flagGeo.attributes.position, base = fp.array.slice();
    var fire = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.8, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFB23F") }));
    fire.position.set(2.2, 0.4, 1.6); g.add(fire);
    var logs = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.62, 0.18, 8), W.std(api, "#5A4632")); logs.position.set(2.2, 0.08, 1.6); g.add(logs);
    var fireLight = new THREE.PointLight(new THREE.Color("#FF9A3C"), 0, 18, 1.6); fireLight.position.set(2.2, 1.2, 1.6); g.add(fireLight);
    api.onFrame(function (dt, t) {
      var U = W.wind(api), w = 0.25 + U.uWind.value;
      for (var i = 0; i < fp.count; i++) {
        var x0 = base[i * 3];
        fp.setZ(i, Math.sin(t * (4 + w * 6) - x0 * 3) * 0.16 * x0 * w);
        fp.setY(i, base[i * 3 + 1] - x0 * x0 * 0.05 * (1 - w * 0.5));
      }
      fp.needsUpdate = true; flagGeo.computeVertexNormals();
      fire.scale.set(1 + Math.sin(t * 17) * 0.12, 1 + Math.sin(t * 11 + 1) * 0.22, 1);
      fireLight.intensity = fireLight.userData.base ? fireLight.userData.base * (0.85 + Math.sin(t * 23) * 0.15) : 0;
    });
    g.userData = { flag: flag, fireLight: fireLight };
    return g;
  }
  S.camp = camp;

  /* ═══ VITRINE · La Crête du Tonnerre ═════════════════════════════════════ */
  S.vitrine = function (THREE, o) {
    var api = K.setup(THREE, o.canvas, { fov: 34 });
    api.camera.far = 1200; api.camera.updateProjectionMatrix();
    W.modern(api, { shadows: true, shadowSize: 46, fogNear: 70, fogFar: 330, hemi: 1.2 });
    var scene = api.scene, N = W.noise(41), R = W.rng(77);
    var finalMode = o.mode || "aube";
    var sky = W.sky(api, "aube"); sky.sunAz = 0.9; sky.setSunElevation(0.12);
    var stars = W.stars(api, 700);
    var wind = W.wind(api); wind.uWind.value = 0.18;

    /* Relief alentour : collines, lac, savane boisée */
    var LAKE = { x: -30, z: 20, r: 11 };
    function height(x, z) {
      var d = Math.hypot(x, z);
      if (d < 11.4) return -0.5;
      var ramp = W.smooth(11.4, 18, d);
      var h = (N.fbm(x * 0.025, z * 0.025, 4) * 0.5 + 0.5) * 16 * W.smooth(40, 140, d);
      h += (N.fbm(x * 0.09, z * 0.09, 3)) * 1.4 + 0.5;
      var dl = Math.hypot(x - LAKE.x, z - LAKE.z);
      h -= 2.6 * (1 - W.smooth(LAKE.r * 0.5, LAKE.r * 1.25, dl));
      return h * ramp;
    }
    var cGrass = new THREE.Color("#6E9B4F"), cGrass2 = new THREE.Color("#4E8A4C"), cDeep = new THREE.Color("#2E6B4E"), cSand = new THREE.Color("#D8C99A"), cRock = W.c(api, "--gst-teal-600"), cHigh = W.c(api, "--gst-teal-400");
    var terrain = W.terrain(api, { size: 420, seg: 170, shadows: true, height: height, color: function (c, y, ny, x, z) {
      var dl = Math.hypot(x - LAKE.x, z - LAKE.z);
      if (dl < LAKE.r * 1.15 && y < 0.6) { c.copy(cSand); return; }
      c.copy(cGrass).lerp(cGrass2, (N(x * 0.05, z * 0.05) * 0.5 + 0.5));
      if (ny < 0.82) c.lerp(cDeep, 0.6);
      if (y > 9) c.lerp(ny < 0.86 ? cRock : cHigh, W.smooth(9, 15, y));
    } });
    scene.add(terrain);
    var lake = W.water(api, { w: LAKE.r * 2.8, d: LAKE.r * 2.8, seg: 26, color: "#2E8F89" });
    lake.position.set(LAKE.x, -0.55, LAKE.z); scene.add(lake);

    /* Le massif : colline (0) → crête (1) */
    var mountain = W.crestMountain(api, { morph: 0, radius: 12 });
    scene.add(mountain);

    /* Végétation */
    var pines = [], broad = [];
    for (var i = 0; i < 2600 && pines.length + broad.length < 420; i++) {
      var x = (R() - 0.5) * 300, z = (R() - 0.5) * 300, d = Math.hypot(x, z);
      if (d < 15 || d > 150) continue;
      if (Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.r * 1.3) continue;
      if (Math.hypot(x - 19, z - 9) < 7) continue;
      var y = height(x, z); if (y > 12) continue;
      var item = [x, y - 0.1, z, 0.9 + R() * 0.9, R() * 6.28, 0.9 + R() * 0.4];
      (N(x * 0.04 + 9, z * 0.04) > 0.05 ? pines : broad).push(item);
    }
    var forest1 = W.pines(api, pines, "--gst-teal-600"), forest2 = W.broadleaf(api, broad, "#4F8A44");
    scene.add(forest1, forest2);
    var campG = camp(api, new THREE.Vector3(19, height(19, 9), 9), height); scene.add(campG);

    /* La fleur de lys et sa tige */
    var seed = mountain.summit(0);
    var stemCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.12, 0.6, 0.05), new THREE.Vector3(-0.08, 1.2, 0), new THREE.Vector3(0, 1.75, 0)]);
    var stem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 24, 0.07, 6, false), W.std(api, "#3F7A4E", { flatShading: false }));
    var leafG = new THREE.SphereGeometry(0.3, 8, 4); leafG.scale(1, 0.18, 0.55);
    var leaf1 = new THREE.Mesh(leafG, W.std(api, "#5C9A58")); leaf1.position.set(0.28, 0.55, 0); leaf1.rotation.z = -0.6;
    var leaf2 = new THREE.Mesh(leafG, W.std(api, "#5C9A58")); leaf2.position.set(-0.3, 0.9, 0); leaf2.rotation.z = 0.6;
    var plant = new THREE.Group(); plant.add(stem, leaf1, leaf2); plant.position.copy(seed).add(new THREE.Vector3(0, -0.05, 0));
    var fleur = W.fleur(api, { color: "#FFD23F", emissive: "#7A5B00" });
    fleur.position.set(0, 1.75, 0); fleur.scale.setScalar(0.001); plant.add(fleur);
    plant.scale.set(1, 0.001, 1); scene.add(plant);
    var fleurGlow = new THREE.PointLight(new THREE.Color("#FFE38A"), 0, 10, 1.8); fleurGlow.position.set(0, 2.1, 0.6); plant.add(fleurGlow);

    /* L'éclair planté au sommet, la cordelière céleste */
    var crestTop = mountain.summit(1);
    var bolt = W.boltSolid(api, { size: 5.6 }); bolt.position.set(crestTop.x, crestTop.y + 0.2, crestTop.z); bolt.rotation.z = 0.18; bolt.scale.setScalar(0.001); scene.add(bolt);
    var boltLight = new THREE.PointLight(new THREE.Color("#FFD23F"), 0, 34, 1.5); boltLight.position.set(crestTop.x, crestTop.y + 4, crestTop.z + 2); scene.add(boltLight);
    var halo = new THREE.Group(); halo.position.set(0, 18, -30);
    var rope = W.rope(api, { radius: 24, thick: 1.0, turns: 100, color: "#0C7873" });
    var red = new THREE.Mesh(new THREE.TorusGeometry(22, 0.3, 8, 160), W.std(api, "--gst-red-500", { flatShading: false, roughness: 0.4, emissive: new THREE.Color("#5E0F0D"), emissiveIntensity: 0.4 }));
    var hf1 = W.fleur(api, { color: "#0C7873", emissive: "#032726" }), hf2 = W.fleur(api, { color: "#0C7873", emissive: "#032726" });
    hf1.bloom(1); hf2.bloom(1); hf1.scale.setScalar(3.2); hf2.scale.setScalar(3.2); hf1.position.set(-28.5, -2, 0); hf2.position.set(28.5, -2, 0);
    halo.add(rope, red, hf1, hf2); halo.scale.setScalar(0.001); scene.add(halo);

    /* Météo */
    var clouds = W.cloudField(api, { count: 30, spread: 320, depth: 260, y: 50, yVar: 14, scale: 2.8 });
    clouds.userData.cover = 0.3; scene.add(clouds);
    var rain = W.rain(api, { area: 140, top: 70, count: 3200 }); scene.add(rain);
    var bolts = W.lightning(api); scene.add(bolts);
    var spark = sparks(api, 260);
    var birds = W.birds(api, { count: 7, scale: 1.2, speed: 0.06, path: function (t) { return new THREE.Vector3(Math.cos(t) * 60, 22 + Math.sin(t * 3) * 3, Math.sin(t) * 40 - 10); } });
    scene.add(birds);

    /* ── Caméra : orbite autour du massif, pilotée par l'intro puis le défilement ── */
    var cam = { az: 0.25, el: 0.12, r: 16, ty: 3.2 }, shake = 0, scrollP = 0, px = 0, py = 0, pxS = 0, pyS = 0;
    var target = new THREE.Vector3();
    var portrait = function () { return o.canvas.clientWidth < o.canvas.clientHeight * 1.1; };
    var FINAL = function () { return { az: 0.42, el: 0.17, r: portrait() ? 165 : 118, ty: 15 }; };
    api.onResize(function (w, h) { api.camera.setViewOffset(w, h, 0, h * (portrait() ? 0.16 : 0.1), w, h); });
    api.resize();
    function place() {
      var az = cam.az + scrollP * 1.3 + pxS * 0.06, el = cam.el - scrollP * 0.08 + pyS * 0.03, r = cam.r - scrollP * 16;
      target.set(0, cam.ty, 0);
      api.camera.position.set(r * Math.cos(el) * Math.sin(az), cam.ty + r * Math.sin(el), r * Math.cos(el) * Math.cos(az));
      if (shake > 0) api.camera.position.add(new THREE.Vector3((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake));
      api.camera.lookAt(target);
    }
    var final = false;
    api.onFrame(function (dt, t) {
      pxS += (px - pxS) * Math.min(1, dt * 3); pyS += (py - pyS) * Math.min(1, dt * 3);
      shake = Math.max(0, shake - dt * 1.6);
      place();
      rope.rotation.z += dt * 0.05; red.rotation.z -= dt * 0.03;
      if (final) {
        bolt.material.emissiveIntensity = 0.75 + Math.sin(t * 2.2) * 0.25;
        halo.position.y = 18 + Math.sin(t * 0.6) * 0.4;
      }
      // Le halo et les fleurs latérales font toujours face à la caméra (léger retard)
      var a = Math.atan2(api.camera.position.x, api.camera.position.z);
      halo.rotation.y += (a - halo.rotation.y) * Math.min(1, dt * 0.8);
      if (o.onFrame) o.onFrame(api);
    });
    o.stage.addEventListener("pointermove", function (e) { var b = o.stage.getBoundingClientRect(); px = (e.clientX - b.left) / b.width - 0.5; py = (e.clientY - b.top) / b.height - 0.5; });

    /* ── Réglages d'ambiance ──────────────────────────────────────────── */
    function ambiance(m, dur) {
      sky.setMode(m, dur);
      var night = m === "nuit", storm = m === "orage";
      GST.tween(dur || 0, function (v) {
        stars.material.opacity = W.lerp(stars.material.opacity, night ? 0.9 : 0, v);
      }, "trace");
      clouds.setTone(storm ? "#5C6A68" : night ? "#2E4B49" : m === "aube" ? "#FFE9D6" : "#FFFFFF", storm ? "#000000" : "#000000");
      campG.userData.fireLight.userData.base = night ? 40 : storm ? 14 : m === "aube" ? 10 : 0;
    }

    /* ── La séquence ─────────────────────────────────────────────────── */
    var timers = [], running = null;
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function tw(ms, fn, ease, delay) { var t = GST.tween(ms, fn, ease || "trace", delay || 0); running = t; return t; }
    function setFinal(instant) {
      final = true;
      timers.forEach(clearTimeout); timers = [];
      mountain.morph(1); plant.visible = false;
      bolt.scale.setScalar(5.6); boltLight.intensity = 60;
      halo.scale.setScalar(1);
      rain.userData.intensity = 0; wind.uWind.value = 0.22;
      clouds.userData.cover = 0.45;
      ambiance(finalMode, instant ? 0 : 1600);
      var f = FINAL();
      if (instant) { cam.az = f.az; cam.el = f.el; cam.r = f.r; cam.ty = f.ty; }
      o.onAct && o.onAct(4, "done");
      o.onDone && o.onDone();
    }
    function play() {
      final = false;
      timers.forEach(clearTimeout); timers = [];
      if (GST.reduced()) { setFinal(true); return; }
      // État initial : aube calme, colline, bouton de fleur
      mountain.morph(0); plant.visible = true; plant.scale.set(1, 0.001, 1); fleur.scale.setScalar(0.001); fleur.bloom(0);
      fleur.userData.mat.opacity = 1; fleur.userData.mat.transparent = false;
      Object.keys(fleur.userData.parts).forEach(function (k) { var p = fleur.userData.parts[k]; p.position.set(p.position.x, p.position.y, 0); p.parent.position.set(0, 0, 0); p.parent.rotation.set(0, 0, 0); p.parent.scale.setScalar(1); });
      bolt.scale.setScalar(0.001); boltLight.intensity = 0; halo.scale.setScalar(0.001);
      rain.userData.intensity = 0; wind.uWind.value = 0.15; clouds.userData.cover = 0.25;
      sky.setMode("aube", 0); sky.setSunElevation(0.1); stars.material.opacity = 0; ambiance("aube", 0);
      cam.az = 0.15; cam.el = 0.03; cam.r = 9.5; cam.ty = seed.y + 2.1;

      /* I · LA GRAINE (0 → 3,4 s) */
      o.onAct && o.onAct(1, "La graine");
      tw(2600, function (v) { plant.scale.y = Math.max(0.001, v); }, "tonnerre", 200);
      at(1300, function () { fleur.scale.setScalar(0.001); tw(1900, function (v) { fleur.scale.setScalar(0.001 + v * 0.95); fleur.bloom(v); fleurGlow.intensity = v * 12; }, "tonnerre"); });
      tw(3400, function (v) { cam.az = 0.15 + v * 0.55; cam.r = 9.5 + v * 3; sky.setSunElevation(0.1 + v * 0.12); }, "trace");

      /* II · LA TEMPÊTE (3,4 → 7 s) */
      at(3400, function () {
        o.onAct && o.onAct(2, "La tempête");
        ambiance("orage", 2600);
        clouds.userData.cover = 1;
        tw(2600, function (v) { wind.uWind.value = 0.15 + v * 0.95; rain.userData.intensity = W.smooth(0.3, 1, v) * 0.95; cam.r = 12.5 + v * 14; cam.el = 0.03 + v * 0.12; cam.az = 0.7 - v * 0.35; cam.ty = seed.y + 2.1 + v * 1.4; }, "trace");
      });
      [4700, 5900].forEach(function (ms, k) {
        at(ms, function () {
          var far = new THREE.Vector3((k ? 1 : -1) * (60 + R() * 30), 0, -70 - R() * 30);
          bolts.strike(far.clone().add(new THREE.Vector3(0, 70, 0)), far.clone().setY(height(far.x, far.z)), { light: 300, branches: 2, width: 0.3,
            onFlash: function (k2) { o.onFlash && o.onFlash(k2 * 0.25); } });
        });
      });

      /* III · LA FRAPPE (7 s) */
      at(7000, function () {
        o.onAct && o.onAct(3, "La frappe");
        var tip = plant.localToWorld(new THREE.Vector3(0, 3.1, 0));
        bolts.strike(tip.clone().add(new THREE.Vector3(6, 80, -4)), tip, { light: 1600, branches: 5, width: 0.22, onFlash: function (k2) { o.onFlash && o.onFlash(k2); } });
        shake = 0.9;
        setTimeout(function () {
          spark.burst(tip, 12);
          // La fleur se disperse en éclats dorés
          var parts = fleur.userData.parts;
          Object.keys(parts).forEach(function (k, i) {
            var p = parts[k], dir = new THREE.Vector3((R() - 0.5) * 6, 2 + R() * 4, (R() - 0.5) * 6), rot = (R() - 0.5) * 8;
            tw(1100, function (v) { p.parent.position.copy(dir.clone().multiplyScalar(v)); p.parent.rotation.z = rot * v; p.parent.scale.setScalar(1 - v); }, "tonnerre");
          });
          tw(600, function (v) { plant.scale.y = Math.max(0.001, 1 - v); fleurGlow.intensity = 30 * (1 - v); }, "snap", 200);
        }, 120);
      });

      /* IV · LA CRÊTE (7,3 → 11 s) */
      at(7300, function () {
        o.onAct && o.onAct(4, "La crête");
        shake = 1.4;
        tw(2800, function (v) { mountain.morph(v); shake = Math.max(shake, (1 - v) * 0.6); }, "tonnerre");
        var f = FINAL(), from = { az: cam.az, el: cam.el, r: cam.r, ty: cam.ty };
        tw(3600, function (v) { cam.az = W.lerp(from.az, f.az, v); cam.el = W.lerp(from.el, f.el, v); cam.r = W.lerp(from.r, f.r, v); cam.ty = W.lerp(from.ty, f.ty, v); }, "trace", 300);
      });
      at(9200, function () {
        bolts.strike(crestTop.clone().add(new THREE.Vector3(-4, 70, 3)), crestTop.clone().add(new THREE.Vector3(0, 0.4, 0)), { light: 1200, branches: 3, width: 0.25, onFlash: function (k2) { o.onFlash && o.onFlash(k2 * 0.7); } });
        tw(900, function (v) { bolt.scale.setScalar(0.001 + v * 5.6); boltLight.intensity = v * 60; }, "tonnerre", 160);
        tw(2000, function (v) { rain.userData.intensity = 0.95 * (1 - v); wind.uWind.value = 1.1 - v * 0.85; }, "trace");
        clouds.userData.cover = 0.45;
        ambiance(finalMode, 2200);
      });
      at(9700, function () {
        tw(1800, function (v) { halo.scale.setScalar(0.001 + v); rope.rotation.z = (1 - v) * -2.4; }, "tonnerre");
        o.onReveal && o.onReveal();
      });
      at(11400, function () { setFinal(false); });
    }
    /* Poses figées (banc d'essai visuel) */
    function pose(name) {
      timers.forEach(clearTimeout); timers = []; final = false;
      if (name === "graine") { mountain.morph(0); plant.visible = true; plant.scale.set(1, 1, 1); fleur.scale.setScalar(0.95); fleur.bloom(1); fleurGlow.intensity = 12; ambiance("aube", 0); sky.setSunElevation(0.2); cam.az = 0.6; cam.el = 0.03; cam.r = 12; cam.ty = seed.y + 2.1; }
      if (name === "tempete") { mountain.morph(0); plant.visible = true; plant.scale.set(1, 1, 1); fleur.scale.setScalar(0.95); fleur.bloom(1); ambiance("orage", 0); clouds.userData.cover = 1; rain.userData.intensity = 0.95; wind.uWind.value = 1.1; cam.az = 0.35; cam.el = 0.15; cam.r = 26; cam.ty = seed.y + 3.5; }
      if (name === "frappe") { pose("tempete"); var tip = plant.localToWorld(new THREE.Vector3(0, 3.1, 0)); bolts.strike(tip.clone().add(new THREE.Vector3(6, 80, -4)), tip, { light: 1600, branches: 5, width: 0.22, seq: [[0, 1]] }); }
      if (name === "crete") { plant.visible = false; mountain.morph(0.7); ambiance("orage", 0); rain.userData.intensity = 0.5; var f = FINAL(); cam.az = f.az * 0.8; cam.el = f.el; cam.r = f.r * 0.7; cam.ty = f.ty * 0.8; shake = 0; }
    }
    function skip() { if (running) running.stop(); setFinal(true); o.onReveal && o.onReveal(); }

    addEventListener("scroll", function () {
      if (GST.reduced() || !final) { scrollP = 0; return; }
      var r = o.hero.getBoundingClientRect();
      scrollP = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    }, { passive: true });
    addEventListener("resize", function () { if (final) { var f = FINAL(); cam.r = f.r; } });

    K.perf(api, function () { o.onLowPerf && o.onLowPerf(); });
    place(); api.start();
    return {
      api: api, play: play, skip: skip, _pose: pose, parts: { rain: rain, clouds: clouds, bolts: bolts, sky: sky, fog: api.scene.fog },
      setMode: function (m) { finalMode = m; if (final) ambiance(m, 900); },
      summit: function () { return K.project(api, crestTop.clone().add(new THREE.Vector3(0, 6.4, 0))); }
    };
  };

  /* ═══ Médaillon de la Crête (M10) — tourne, se laisse frapper ══════════ */
  S.crest = function (THREE, o) {
    var api = K.setup(THREE, o.canvas, { fov: 30 });
    W.modern(api, { shadows: true, shadowSize: 26, fogNear: 120, fogFar: 400, exposure: 1.1 });
    var sky = W.sky(api, o.mode || "aube"); sky.sunAz = 0.6; sky.setSunElevation(0.5);
    var crest = W.crest(api, { morph: 1 }); api.scene.add(crest);
    var U = crest.userData;
    var bolts = W.lightning(api); api.scene.add(bolts);
    var spark = sparks(api, 160);
    var clouds = new THREE.Group(); api.scene.add(clouds);
    for (var i = 0; i < 5; i++) {
      var c = W.cloud(api, { seed: i + 2, size: 1.2, length: 5, color: "#FFFFFF" }); var a = (i / 5) * Math.PI * 2;
      c.position.set(Math.cos(a) * 17, 10 + (i % 3) * 2.4, Math.sin(a) * 17); c.userData.a = a; clouds.add(c);
    }
    var rot = { y: 0, drag: false, vx: 0, lastX: 0, auto: true }, t0 = 0;
    o.canvas.addEventListener("pointerdown", function (e) { rot.drag = true; rot.lastX = e.clientX; rot.vx = 0; o.canvas.setPointerCapture(e.pointerId); });
    o.canvas.addEventListener("pointermove", function (e) { if (!rot.drag) return; var dx = e.clientX - rot.lastX; rot.lastX = e.clientX; rot.y += dx * 0.008; rot.vx = dx * 0.008; });
    o.canvas.addEventListener("pointerup", function () { rot.drag = false; });
    var cam = api.camera;
    function frame(dt, t) {
      if (!rot.drag) { rot.vx *= 0.94; rot.y += rot.vx + (GST.reduced() ? 0 : dt * 0.18); }
      crest.rotation.y = Math.sin(rot.y) * 0.55;
      U.rope.rotation.z += dt * 0.08;
      U.bolt.material.emissiveIntensity = 0.75 + Math.sin(t * 2.4) * 0.25;
      U.halo.position.y = 10 + Math.sin(t * 0.8) * 0.25;
      clouds.children.forEach(function (c) { c.userData.a += dt * 0.07; c.position.x = Math.cos(c.userData.a) * 18; c.position.z = Math.sin(c.userData.a) * 18; });
    }
    api.onFrame(frame);
    var r = o.distance || 64;
    api.onResize(function (w, h) { var p = w < h; cam.position.set(0, p ? 16 : 12, p ? r * 1.45 : r); cam.lookAt(0, p ? 8.5 : 8, 0); });
    api.resize();
    api.start();
    function strike() {
      var top = U.summit.clone().add(new THREE.Vector3(0, 0.6, 0)).applyMatrix4(crest.matrixWorld);
      U.bolt.scale.setScalar(5.2 * 1.25);
      setTimeout(function () { U.bolt.scale.setScalar(5.2); }, 260);
      spark.burst(top, 8);
      return bolts.strike(top.clone().add(new THREE.Vector3(3, 60, -2)), top, { light: 900, branches: 4, width: 0.18, onFlash: o.onFlash });
    }
    /* Intro M10 : le massif surgit, l'éclair frappe, la cordelière se referme */
    function intro() {
      if (GST.reduced()) return Promise.resolve();
      U.mountain.morph(0); U.bolt.scale.setScalar(0.001); U.halo.scale.setScalar(0.001);
      return GST.tween(1400, function (v) { U.mountain.morph(v); }, "tonnerre").finished.then(function () {
        strike(); return GST.tween(700, function (v) { U.bolt.scale.setScalar(0.001 + v * 5.2); }, "tonnerre", 120).finished;
      }).then(function () { return GST.tween(1100, function (v) { U.halo.scale.setScalar(0.001 + v); U.rope.rotation.z = (1 - v) * -2; }, "tonnerre").finished; });
    }
    return { api: api, strike: strike, intro: intro, setMode: function (m) { sky.setMode(m, 900); } };
  };
})();
