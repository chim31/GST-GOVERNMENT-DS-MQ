/* ═══════════════════════════════════════════════════════════════════════
   GST GOVERNMENT — Kit 3D « Monde vivant » · v1.1
   Complète gst-3d.js (diorama papier) pour le registre Ciel : relief organique,
   ciel en dégradé avec soleil, nuages en volume, pluie, vent, éclairs ramifiés,
   oiseaux, fleur de lys et Crête du Tonnerre en 3D.

   Langage : low-poly à facettes franches (flatShading), palette = tokens,
   lumière hémisphérique + soleil, brouillard atmosphérique. Script classique :
   chaque fonction reçoit `api` (GST3D.setup) qui porte THREE.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var K = window.GST3D, GST = window.GST;
  var W = (K.world = {});

  /* ── Hasard déterministe & bruit de simplexe 2D ────────────────────── */
  W.rng = function (seed) { var s = seed || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
  W.noise = function (seed) {
    var r = W.rng(seed || 7), perm = new Uint8Array(512), p = [], i;
    for (i = 0; i < 256; i++) p[i] = i;
    for (i = 255; i > 0; i--) { var j = (r() * (i + 1)) | 0, t = p[i]; p[i] = p[j]; p[j] = t; }
    for (i = 0; i < 512; i++) perm[i] = p[i & 255];
    var G = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
    var F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
    function c(h, x, y) { var t = 0.5 - x * x - y * y; if (t < 0) return 0; t *= t; var g = G[h & 7]; return t * t * (g[0] * x + g[1] * y); }
    var n2 = function (x, y) {
      var s = (x + y) * F2, i = Math.floor(x + s), j = Math.floor(y + s), t = (i + j) * G2;
      var x0 = x - (i - t), y0 = y - (j - t), i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
      var x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      var ii = i & 255, jj = j & 255;
      return 70 * (c(perm[ii + perm[jj]], x0, y0) + c(perm[ii + i1 + perm[jj + j1]], x1, y1) + c(perm[ii + 1 + perm[jj + 1]], x2, y2));
    };
    n2.fbm = function (x, y, oct) { var a = 0, amp = 0.5, f = 1; for (var k = 0; k < (oct || 4); k++) { a += amp * n2(x * f, y * f); f *= 2.03; amp *= 0.5; } return a; };
    n2.ridged = function (x, y, oct) { var a = 0, amp = 0.5, f = 1; for (var k = 0; k < (oct || 4); k++) { var v = 1 - Math.abs(n2(x * f, y * f)); a += amp * v * v; f *= 2.1; amp *= 0.5; } return a; };
    return n2;
  };
  W.smooth = function (a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  W.lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ── Rendu « moderne » : tons filmiques, lumière hémisphérique ──────── */
  W.modern = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var r = api.renderer;
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = o.exposure || 1.05;
    if (o.shadows) { r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; }
    api.amb.intensity = o.ambient != null ? o.ambient : 0.35;
    var hemi = new THREE.HemisphereLight(0xffffff, 0x0c3a38, o.hemi != null ? o.hemi : 1.4);
    api.scene.add(hemi); api.hemi = hemi;
    api.sun.intensity = o.sun != null ? o.sun : 2.4;
    if (o.shadows) {
      api.sun.castShadow = true; var sc = api.sun.shadow.camera, e = o.shadowSize || 40;
      sc.left = -e; sc.right = e; sc.top = e; sc.bottom = -e; sc.near = 1; sc.far = 260;
      api.sun.shadow.mapSize.set(1024, 1024); api.sun.shadow.bias = -0.0004; api.sun.shadow.normalBias = 0.18;
    }
    api.scene.fog = new THREE.Fog(0xffffff, o.fogNear || 90, o.fogFar || 340);
    return api;
  };
  W.std = function (api, color, extra) {
    var THREE = api.THREE;
    var c = typeof color === "string" && color.indexOf("--") === 0 ? K.col(THREE, color) : new THREE.Color(color);
    return new THREE.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: 0.92, metalness: 0 }, extra || {}));
  };
  W.c = function (api, tok) { return K.col(api.THREE, tok); };

  /* ── Ciel en dégradé (registre Ciel v1.1) : zénith → horizon + soleil ── */
  W.SKIES = {
    jour:   { top: "#5FAAA5", mid: "#C6E2E0", hor: "#F4F4F2", sun: "#FFF1C2", fog: "#DCEEEC", hemiS: "#E7F2F1", hemiG: "#2E5E3E", sunI: 2.6, hemiI: 1.25, exp: 1.05, sunEl: 0.85 },
    aube:   { top: "#06605E", mid: "#E0716D", hor: "#FFD9A0", sun: "#FFD23F", fog: "#F1C7A9", hemiS: "#FFE2C2", hemiG: "#3B2A2A", sunI: 2.2, hemiI: 1.0, exp: 1.08, sunEl: 0.14 },
    nuit:   { top: "#020F0F", mid: "#063F3E", hor: "#0C5552", sun: "#E7F2F1", fog: "#0A3634", hemiS: "#6FA8A4", hemiG: "#03201F", sunI: 0.55, hemiI: 0.55, exp: 1.25, sunEl: 0.6 },
    orage:  { top: "#121C1C", mid: "#2E4442", hor: "#5C6F6C", sun: "#C9C9C6", fog: "#46595A", hemiS: "#8A9A98", hemiG: "#1A2524", sunI: 0.35, hemiI: 0.75, exp: 1.1, sunEl: 0.5 },
    couvert:{ top: "#7E9C9A", mid: "#B9CBC9", hor: "#E4E4E1", sun: "#FAFAF8", fog: "#CFDAD8", hemiS: "#E4ECEB", hemiG: "#3A4A40", sunI: 1.1, hemiI: 1.35, exp: 1.0, sunEl: 0.7 },
    harmattan:{ top: "#C9B48A", mid: "#E6D3AE", hor: "#F2E6CF", sun: "#FFF1C2", fog: "#E9D9BB", hemiS: "#F5E8CC", hemiG: "#6B4F2A", sunI: 1.6, hemiI: 1.2, exp: 1.0, sunEl: 0.55 }
  };
  W.sky = function (api, mode) {
    var THREE = api.THREE;
    var u = { top: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, hor: { value: new THREE.Color() },
      sunCol: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0.4, 0.5, -0.7).normalize() }, sunSize: { value: 0.9994 }, haze: { value: 0 } };
    var mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, uniforms: u, fog: false,
      vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position = p.xyww; }",
      fragmentShader: "uniform vec3 top; uniform vec3 mid; uniform vec3 hor; uniform vec3 sunCol; uniform vec3 sunDir; uniform float sunSize; uniform float haze; varying vec3 vD;" +
        "void main(){ float h = vD.y; vec3 c = h > 0.0 ? mix(mix(hor, mid, smoothstep(0.0, 0.18, h)), top, smoothstep(0.16, 0.75, h)) : mix(hor, mid*0.9, smoothstep(0.0,-0.3,h));" +
        " float d = dot(normalize(vD), normalize(sunDir)); c += sunCol * (pow(max(d,0.0), 24.0) * 0.35 + pow(max(d,0.0), 3.0) * 0.12) * (1.0 - haze*0.7);" +
        " c = mix(c, sunCol, smoothstep(sunSize, sunSize + 0.0004, d) * (1.0 - haze));" +
        " gl_FragColor = vec4(c, 1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}"
    });
    var sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), mat);
    sky.frustumCulled = false; sky.renderOrder = -10;
    api.scene.add(sky);
    api.onFrame(function () { sky.position.copy(api.camera.position); });
    var cur = null;
    function apply(m, k, from) {
      var S = W.SKIES[m];
      ["top", "mid", "hor"].forEach(function (key) { var c = new THREE.Color(S[key]); if (from) u[key].value.copy(from[key]).lerp(c, k); else u[key].value.copy(c); });
      var sc = new THREE.Color(S.sun); if (from) u.sunCol.value.copy(from.sun).lerp(sc, k); else u.sunCol.value.copy(sc);
      if (api.scene.fog) { var fc = new THREE.Color(S.fog); if (from) api.scene.fog.color.copy(from.fog).lerp(fc, k); else api.scene.fog.color.copy(fc); }
      if (api.hemi) {
        var hs = new THREE.Color(S.hemiS), hg = new THREE.Color(S.hemiG);
        if (from) { api.hemi.color.copy(from.hs).lerp(hs, k); api.hemi.groundColor.copy(from.hg).lerp(hg, k); api.hemi.intensity = W.lerp(from.hi, S.hemiI, k); }
        else { api.hemi.color.copy(hs); api.hemi.groundColor.copy(hg); api.hemi.intensity = S.hemiI; }
      }
      var si = from ? W.lerp(from.si, S.sunI, k) : S.sunI; api.sun.intensity = si * (sky.sunScale || 1);
      api.sun.color.copy(from ? from.sc.clone().lerp(new THREE.Color(S.sun), k) : new THREE.Color(S.sun));
      api.renderer.toneMappingExposure = from ? W.lerp(from.exp, S.exp, k) : S.exp;
      var el = from ? W.lerp(from.el, S.sunEl, k) : S.sunEl;
      sky.setSunElevation(el);
    }
    sky.setSunElevation = function (el, az) {
      az = az != null ? az : (sky.sunAz != null ? sky.sunAz : 0.7);
      var d = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
      u.sunDir.value.copy(d);
      api.sun.position.copy(d.clone().multiplyScalar(120));
      sky.sunEl = el;
    };
    sky.snapshot = function () {
      return { top: u.top.value.clone(), mid: u.mid.value.clone(), hor: u.hor.value.clone(), sun: u.sunCol.value.clone(),
        fog: api.scene.fog ? api.scene.fog.color.clone() : new THREE.Color(), hs: api.hemi ? api.hemi.color.clone() : new THREE.Color(),
        hg: api.hemi ? api.hemi.groundColor.clone() : new THREE.Color(), hi: api.hemi ? api.hemi.intensity : 1, si: api.sun.intensity / (sky.sunScale || 1),
        sc: api.sun.color.clone(), exp: api.renderer.toneMappingExposure, el: sky.sunEl || 0.6 };
    };
    sky.setMode = function (m, dur) {
      if (!W.SKIES[m]) return;
      sky.mode = m;
      if (cur) cur.stop();
      var from = sky.snapshot();
      if (!dur || GST.reduced()) { apply(m); return { finished: Promise.resolve() }; }
      cur = GST.tween(dur, function (v) { apply(m, v, from); }, "trace");
      return cur;
    };
    /* Composition continue : heure du jour (0–24) puis surcouche météo.
       over ∈ {couvert, orage, harmattan} · wk ∈ [0,1] (part de la météo). */
    function snapOf(name) {
      var S = W.SKIES[name];
      return { top: new THREE.Color(S.top), mid: new THREE.Color(S.mid), hor: new THREE.Color(S.hor), sun: new THREE.Color(S.sun), fog: new THREE.Color(S.fog),
        hs: new THREE.Color(S.hemiS), hg: new THREE.Color(S.hemiG), hi: S.hemiI, si: S.sunI, exp: S.exp };
    }
    var SN = {}; Object.keys(W.SKIES).forEach(function (k) { SN[k] = snapOf(k); });
    function mix(a, b, k) {
      return { top: a.top.clone().lerp(b.top, k), mid: a.mid.clone().lerp(b.mid, k), hor: a.hor.clone().lerp(b.hor, k), sun: a.sun.clone().lerp(b.sun, k), fog: a.fog.clone().lerp(b.fog, k),
        hs: a.hs.clone().lerp(b.hs, k), hg: a.hg.clone().lerp(b.hg, k), hi: W.lerp(a.hi, b.hi, k), si: W.lerp(a.si, b.si, k), exp: W.lerp(a.exp, b.exp, k) };
    }
    sky.hourSnap = function (h) {
      h = ((h % 24) + 24) % 24;
      if (h < 5) return SN.nuit;
      if (h < 6.5) return mix(SN.nuit, SN.aube, W.smooth(5, 6.5, h));
      if (h < 8.5) return mix(SN.aube, SN.jour, W.smooth(6.5, 8.5, h));
      if (h < 16.5) return SN.jour;
      if (h < 18.3) return mix(SN.jour, SN.aube, W.smooth(16.5, 18.3, h));
      if (h < 19.8) return mix(SN.aube, SN.nuit, W.smooth(18.3, 19.8, h));
      return SN.nuit;
    };
    sky.daylight = function (h) { h = ((h % 24) + 24) % 24; return W.smooth(5.2, 7.5, h) * (1 - W.smooth(17.6, 19.6, h)); };
    sky.compose = function (h, over, wk) {
      var a = sky.hourSnap(h), dl = sky.daylight(h);
      if (over && wk > 0) {
        var o = SN[over];
        if (dl < 1) o = mix(SN.nuit, o, 0.35 + dl * 0.65);
        a = mix(a, o, wk);
      }
      u.top.value.copy(a.top); u.mid.value.copy(a.mid); u.hor.value.copy(a.hor); u.sunCol.value.copy(a.sun);
      if (api.scene.fog) api.scene.fog.color.copy(a.fog);
      if (api.hemi) { api.hemi.color.copy(a.hs); api.hemi.groundColor.copy(a.hg); api.hemi.intensity = a.hi; }
      api.sun.intensity = a.si * (1 - (over === "orage" ? wk * 0.6 : over === "couvert" ? wk * 0.35 : 0));
      api.sun.color.copy(a.sun);
      api.renderer.toneMappingExposure = a.exp;
      u.haze.value = over === "harmattan" ? wk * 0.6 : over ? wk * 0.85 : 0;
      // Course du soleil : lever 6 h à l'est, zénith 12 h, coucher 18 h ; la nuit, la lune prend le relais
      var t = (h - 6) / 12, el = Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 1.15 + 0.06;
      if (dl < 0.02) el = 0.75;
      sky.setSunElevation(el, (dl < 0.02 ? 2.4 : -1.2 + Math.min(1, Math.max(0, t)) * 2.4));
      sky.night = 1 - dl;
    };
    sky.uniforms = u; sky.mode = mode || "jour";
    apply(sky.mode);
    return sky;
  };

  /* Étoiles rondes (nuit) */
  W.stars = function (api, n) {
    var THREE = api.THREE, pos = new Float32Array(n * 3), r = W.rng(3);
    for (var i = 0; i < n; i++) {
      var th = r() * Math.PI * 2, ph = 0.08 + r() * 1.3, R = 420;
      pos[i * 3] = R * Math.cos(ph) * Math.cos(th); pos[i * 3 + 1] = R * Math.sin(ph); pos[i * 3 + 2] = R * Math.cos(ph) * Math.sin(th);
    }
    var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var c = document.createElement("canvas"); c.width = c.height = 32; var x = c.getContext("2d");
    var gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.8)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = gr; x.fillRect(0, 0, 32, 32);
    var m = new THREE.PointsMaterial({ size: 3.2, sizeAttenuation: false, map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: false, opacity: 0 });
    var pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = -9;
    api.scene.add(pts);
    api.onFrame(function (dt, t) { pts.position.copy(api.camera.position); pts.rotation.y = t * 0.004; });
    return pts;
  };

  /* ── Matériau « au vent » : les sommets ondulent selon leur hauteur ──── */
  W.windU = null;
  W.wind = function (api) {
    if (!api.windU) {
      var THREE = api.THREE;
      api.windU = { uTime: { value: 0 }, uWind: { value: 0.3 }, uDir: { value: new THREE.Vector2(1, 0.3).normalize() } };
      api.onFrame(function (dt) { api.windU.uTime.value += dt; });
    }
    return api.windU;
  };
  W.sway = function (api, mat, amount) {
    var U = W.wind(api);
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uTime = U.uTime; sh.uniforms.uWind = U.uWind; sh.uniforms.uDir = U.uDir;
      sh.vertexShader = "uniform float uTime; uniform float uWind; uniform vec2 uDir;\n" + sh.vertexShader.replace("#include <begin_vertex>",
        "#include <begin_vertex>\n" +
        "#ifdef USE_INSTANCING\n vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);\n#else\n vec3 ip = vec3(modelMatrix[3][0], 0.0, modelMatrix[3][2]);\n#endif\n" +
        " float hh = max(position.y, 0.0) * " + (amount || 0.18).toFixed(3) + ";" +
        " float ph = uTime * (1.4 + uWind * 2.6) + ip.x * 0.35 + ip.z * 0.27;" +
        " float s = (sin(ph) * 0.55 + sin(ph * 2.3 + 1.7) * 0.25 + 0.6) * uWind;" +
        " transformed.x += uDir.x * s * hh; transformed.z += uDir.y * s * hh;");
    };
    mat.customProgramCacheKey = function () { return "sway" + (amount || 0.18); };
    return mat;
  };

  /* ── Relief organique : grille déplacée, facettes et couleurs par face ── */
  W.terrain = function (api, o) {
    var THREE = api.THREE;
    var size = o.size || 100, seg = o.seg || 120;
    var geo = new THREE.PlaneGeometry(size, o.depth || size, seg, Math.round(seg * (o.depth || size) / size));
    geo.rotateX(-Math.PI / 2);
    var p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), z = p.getZ(i);
      if (o.jitter) { var jx = (Math.sin(i * 12.9898) * 43758.5453) % 1, jz = (Math.sin(i * 78.233) * 12345.678) % 1; x += jx * o.jitter; z += jz * o.jitter; p.setX(i, x); p.setZ(i, z); }
      p.setY(i, o.height(x, z));
    }
    geo = geo.toNonIndexed(); geo.computeVertexNormals();
    var pos = geo.attributes.position, nor = geo.attributes.normal;
    var col = new Float32Array(pos.count * 3), c = new THREE.Color();
    for (var f = 0; f < pos.count; f += 3) {
      var y = (pos.getY(f) + pos.getY(f + 1) + pos.getY(f + 2)) / 3;
      var cx = (pos.getX(f) + pos.getX(f + 1) + pos.getX(f + 2)) / 3, cz = (pos.getZ(f) + pos.getZ(f + 1) + pos.getZ(f + 2)) / 3;
      var ny = (nor.getY(f) + nor.getY(f + 1) + nor.getY(f + 2)) / 3;
      o.color(c, y, ny, cx, cz);
      for (var k = 0; k < 3; k++) { col[(f + k) * 3] = c.r; col[(f + k) * 3 + 1] = c.g; col[(f + k) * 3 + 2] = c.b; }
    }
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    var mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, metalness: 0 }));
    mesh.receiveShadow = !!o.shadows;
    mesh.userData.recolor = function (fn) {
      for (var f = 0; f < pos.count; f += 3) {
        var y = (pos.getY(f) + pos.getY(f + 1) + pos.getY(f + 2)) / 3;
        var cx = (pos.getX(f) + pos.getX(f + 1) + pos.getX(f + 2)) / 3, cz = (pos.getZ(f) + pos.getZ(f + 1) + pos.getZ(f + 2)) / 3;
        var ny = (nor.getY(f) + nor.getY(f + 1) + nor.getY(f + 2)) / 3;
        (fn || o.color)(c, y, ny, cx, cz);
        for (var k = 0; k < 3; k++) { col[(f + k) * 3] = c.r; col[(f + k) * 3 + 1] = c.g; col[(f + k) * 3 + 2] = c.b; }
      }
      geo.attributes.color.needsUpdate = true;
    };
    return mesh;
  };

  /* Eau : plan à facettes animées (vaguelettes), légèrement brillant */
  W.water = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var geo = new THREE.PlaneGeometry(o.w || 40, o.d || 40, o.seg || 28, o.seg || 28); geo.rotateX(-Math.PI / 2);
    var mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(o.color || "#2E8F89"), flatShading: true, roughness: 0.25, metalness: 0.1, transparent: true, opacity: o.opacity || 0.88 });
    var U = W.wind(api);
    mat.onBeforeCompile = function (sh) {
      sh.uniforms.uTime = U.uTime; sh.uniforms.uWind = U.uWind;
      sh.vertexShader = "uniform float uTime; uniform float uWind;\n" + sh.vertexShader.replace("#include <begin_vertex>",
        "#include <begin_vertex>\n transformed.y += (sin(position.x*0.9 + uTime*1.6) * 0.5 + cos(position.z*1.1 + uTime*1.3) * 0.5) * (0.06 + uWind*0.18);");
    };
    var m = new THREE.Mesh(geo, mat); m.receiveShadow = true;
    return m;
  };

  /* ── Végétation instanciée, au vent ─────────────────────────────────── */
  function instanced(api, geo, mat, list, s0) {
    var THREE = api.THREE;
    var mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
    var m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    list.forEach(function (p, i) {
      var k = (p[3] || 1) * (s0 || 1); s.set(k, k * (p[5] || 1), k);
      q.setFromAxisAngle(up, p[4] != null ? p[4] : i * 2.39);
      m.compose(v.set(p[0], p[1], p[2]), q, s); mesh.setMatrixAt(i, m);
    });
    mesh.count = list.length;
    mesh.castShadow = true;
    return mesh;
  }
  W.pines = function (api, list, color) {
    var THREE = api.THREE;
    var parts = [], h = 0;
    [[0.95, 1.3, 0.55], [0.75, 1.1, 1.15], [0.52, 0.95, 1.7]].forEach(function (c) { var g = new THREE.ConeGeometry(c[0], c[1], 7); g.translate(0, c[2], 0); parts.push(g); });
    var trunk = new THREE.CylinderGeometry(0.12, 0.16, 0.6, 5); trunk.translate(0, 0.3, 0);
    var leaves = mergeGeos(THREE, parts);
    var mat = W.sway(api, W.std(api, color || "--gst-teal-600"), 0.12);
    var g = new THREE.Group();
    g.add(instanced(api, leaves, mat, list), instanced(api, trunk, W.std(api, "#4A3A2A"), list));
    g.userData.leafMat = mat;
    return g;
  };
  W.broadleaf = function (api, list, color) {
    var THREE = api.THREE;
    var crown = new THREE.IcosahedronGeometry(0.9, 0); crown.scale(1, 0.85, 1); crown.translate(0, 1.55, 0);
    var crown2 = new THREE.IcosahedronGeometry(0.6, 0); crown2.translate(0.45, 1.2, 0.25);
    var trunk = new THREE.CylinderGeometry(0.1, 0.16, 1.1, 5); trunk.translate(0, 0.55, 0);
    var mat = W.sway(api, W.std(api, color || "--gst-teal-500"), 0.1);
    var g = new THREE.Group();
    g.add(instanced(api, mergeGeos(THREE, [crown, crown2]), mat, list), instanced(api, trunk, W.std(api, "#5A4632"), list));
    g.userData.leafMat = mat;
    return g;
  };
  /* Palmier : tronc courbe + 6 palmes */
  W.palms = function (api, list) {
    var THREE = api.THREE, parts = [];
    var trunk = new THREE.CylinderGeometry(0.09, 0.15, 2.6, 5, 4); trunk.translate(0, 1.3, 0);
    var tp = trunk.attributes.position; for (var i = 0; i < tp.count; i++) { var y = tp.getY(i); tp.setX(i, tp.getX(i) + Math.pow(y / 2.6, 2) * 0.45); }
    for (var k = 0; k < 6; k++) {
      var f = new THREE.ConeGeometry(0.22, 1.6, 3); f.rotateZ(-Math.PI / 2 - 0.5); f.translate(0.75, -0.2, 0); f.rotateY(k * Math.PI / 3); f.translate(0.45, 2.6, 0); parts.push(f);
    }
    var mat = W.sway(api, W.std(api, "#1F6F4A"), 0.16);
    var g = new THREE.Group();
    g.add(instanced(api, mergeGeos(THREE, parts), mat, list), instanced(api, trunk, W.std(api, "#7A5E3C"), list));
    return g;
  };
  W.rocks = function (api, list, color) {
    var THREE = api.THREE;
    var g = new THREE.DodecahedronGeometry(0.6, 0); g.scale(1, 0.6, 0.9);
    return instanced(api, g, W.std(api, color || "#8A8A8A"), list);
  };
  function mergeGeos(THREE, geos) {
    var total = 0; geos = geos.map(function (g) { return g.index ? g.toNonIndexed() : g; });
    geos.forEach(function (g) { total += g.attributes.position.count; });
    var pos = new Float32Array(total * 3), o = 0;
    geos.forEach(function (g) { pos.set(g.attributes.position.array, o); o += g.attributes.position.array.length; });
    var out = new THREE.BufferGeometry(); out.setAttribute("position", new THREE.BufferAttribute(pos, 3)); out.computeVertexNormals();
    return out;
  }
  W.merge = mergeGeos;

  /* ── Nuages en volume : grappes d'icosaèdres facettés ───────────────── */
  W.cloud = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var r = W.rng(o.seed || 1), g = new THREE.Group();
    var mat = o.material || new THREE.MeshStandardMaterial({ color: new THREE.Color(o.color || "#FFFFFF"), flatShading: true, roughness: 1, transparent: true, opacity: 1 });
    var n = o.puffs || 7, L = o.length || 6;
    for (var i = 0; i < n; i++) {
      var t = n === 1 ? 0.5 : i / (n - 1), rad = (o.size || 1.6) * (0.55 + Math.sin(t * Math.PI) * 0.65) * (0.8 + r() * 0.4);
      var m = new THREE.Mesh(new THREE.IcosahedronGeometry(rad, 1), mat);
      m.position.set((t - 0.5) * L + (r() - 0.5) * 0.6, rad * 0.35 + r() * 0.5, (r() - 0.5) * 1.6);
      m.scale.y = 0.72;
      g.add(m);
    }
    g.userData.mat = mat;
    return g;
  };
  /* Ciel nuageux : un ensemble de nuages qui dérivent avec le vent */
  W.cloudField = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var r = W.rng(o.seed || 9), field = new THREE.Group(), list = [];
    var mat = new THREE.MeshStandardMaterial({ color: new THREE.Color("#FFFFFF"), flatShading: true, roughness: 1, transparent: true, opacity: 0.96, emissive: new THREE.Color("#000000") });
    for (var i = 0; i < (o.count || 14); i++) {
      var c = W.cloud(api, { seed: i + 3, material: mat, puffs: 5 + ((r() * 4) | 0), size: 1.4 + r() * 1.4, length: 5 + r() * 6 });
      c.position.set((r() - 0.5) * (o.spread || 160), (o.y || 26) + r() * (o.yVar || 10), (r() - 0.5) * (o.depth || 120));
      c.scale.setScalar(o.scale || 1.6);
      c.userData.v = 0.6 + r() * 0.8; c.userData.base = c.scale.x;
      field.add(c); list.push(c);
    }
    field.userData = { mat: mat, list: list, cover: 1 };
    var half = (o.spread || 160) / 2;
    api.onFrame(function (dt) {
      var U = W.wind(api), sp = 1.2 + U.uWind.value * 9;
      list.forEach(function (c, i) {
        c.position.x += U.uDir.value.x * sp * c.userData.v * dt; c.position.z += U.uDir.value.y * sp * c.userData.v * dt * 0.4;
        if (c.position.x > half) c.position.x = -half; if (c.position.x < -half) c.position.x = half;
        var vis = (i / list.length) < field.userData.cover;
        var target = vis ? c.userData.base : 0.001;
        var s = c.scale.x + (target - c.scale.x) * Math.min(1, dt * 1.5);
        c.scale.setScalar(s); c.visible = s > 0.01;
      });
    });
    field.setTone = function (col, emissive) { mat.color.set(col); if (emissive) mat.emissive.set(emissive); };
    return field;
  };

  /* ── Pluie : segments obliques qui tombent avec le vent ─────────────── */
  W.rain = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var n = o.count || 2600, area = o.area || 90, top = o.top || 50;
    var pos = new Float32Array(n * 6), spd = new Float32Array(n), r = W.rng(11);
    for (var i = 0; i < n; i++) {
      var x = (r() - 0.5) * area, y = r() * top, z = (r() - 0.5) * area;
      pos.set([x, y, z, x, y - 0.9, z], i * 6); spd[i] = 34 + r() * 18;
    }
    var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var m = new THREE.LineBasicMaterial({ color: new THREE.Color(o.color || "#C6E2E0"), transparent: true, opacity: 0, depthWrite: false });
    var lines = new THREE.LineSegments(g, m); lines.frustumCulled = false;
    lines.userData.intensity = 0;
    var center = o.center || new THREE.Vector3();
    api.onFrame(function (dt) {
      var I = lines.userData.intensity;
      m.opacity += ((I > 0 ? 0.55 : 0) - m.opacity) * Math.min(1, dt * 3);
      lines.visible = m.opacity > 0.01;
      if (!lines.visible) return;
      var U = W.wind(api), wx = U.uDir.value.x * U.uWind.value * 14, wz = U.uDir.value.y * U.uWind.value * 14;
      var active = Math.floor(n * I);
      g.setDrawRange(0, active * 2);
      for (var i = 0; i < active; i++) {
        var k = i * 6, d = spd[i] * dt;
        pos[k] += wx * dt; pos[k + 2] += wz * dt; pos[k + 1] -= d;
        if (pos[k + 1] < (o.floor || 0)) { pos[k] = center.x + (r() - 0.5) * area; pos[k + 1] = top; pos[k + 2] = center.z + (r() - 0.5) * area; }
        pos[k + 3] = pos[k] - wx * 0.05; pos[k + 4] = pos[k + 1] - 1.1; pos[k + 5] = pos[k + 2] - wz * 0.05;
      }
      g.attributes.position.needsUpdate = true;
    });
    return lines;
  };

  /* Feuilles / poussière portées par le vent (harmattan, rafales) */
  W.dust = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var n = o.count || 400, area = o.area || 80, pos = new Float32Array(n * 3), r = W.rng(5), ph = new Float32Array(n);
    for (var i = 0; i < n; i++) { pos[i * 3] = (r() - 0.5) * area; pos[i * 3 + 1] = 0.5 + r() * (o.top || 12); pos[i * 3 + 2] = (r() - 0.5) * area; ph[i] = r() * 6.28; }
    var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var m = new THREE.PointsMaterial({ color: new THREE.Color(o.color || "#C9B48A"), size: o.size || 0.25, transparent: true, opacity: 0, depthWrite: false });
    var pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.userData.intensity = 0;
    api.onFrame(function (dt, t) {
      m.opacity += (pts.userData.intensity * 0.8 - m.opacity) * Math.min(1, dt * 2);
      pts.visible = m.opacity > 0.01; if (!pts.visible) return;
      var U = W.wind(api), s = 3 + U.uWind.value * 16;
      for (var i = 0; i < n; i++) {
        pos[i * 3] += U.uDir.value.x * s * dt; pos[i * 3 + 2] += U.uDir.value.y * s * dt; pos[i * 3 + 1] += Math.sin(t * 2 + ph[i]) * dt * 0.8;
        if (pos[i * 3] > area / 2) pos[i * 3] = -area / 2; if (pos[i * 3] < -area / 2) pos[i * 3] = area / 2;
        if (pos[i * 3 + 2] > area / 2) pos[i * 3 + 2] = -area / 2; if (pos[i * 3 + 2] < -area / 2) pos[i * 3 + 2] = area / 2;
      }
      g.attributes.position.needsUpdate = true;
    });
    return pts;
  };

  /* ── Éclair ramifié procédural + flash de lumière ───────────────────── */
  function zig(THREE, a, b, disp, depth, out, r) {
    if (depth === 0) { out.push([a, b]); return; }
    var m = a.clone().lerp(b, 0.5 + (r() - 0.5) * 0.12);
    var len = a.distanceTo(b);
    m.x += (r() - 0.5) * disp * len; m.z += (r() - 0.5) * disp * len; m.y += (r() - 0.5) * disp * len * 0.25;
    zig(THREE, a, m, disp * 0.92, depth - 1, out, r); zig(THREE, m, b, disp * 0.92, depth - 1, out, r);
  }
  W.lightning = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var group = new THREE.Group(); group.visible = false;
    var core = new THREE.MeshBasicMaterial({ color: new THREE.Color("#FFFDF0"), transparent: true, opacity: 1, fog: false, depthWrite: false });
    var glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(o.glow || "#FFD23F"), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, fog: false, depthWrite: false });
    var flash = new THREE.PointLight(new THREE.Color("#FFF1C2"), 0, 160, 1.4);
    api.scene.add(flash);
    var seed = 1;
    function segTube(segs, rad, mat) {
      var path = new THREE.CurvePath();
      segs.forEach(function (s) { path.add(new THREE.LineCurve3(s[0], s[1])); });
      return new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(8, segs.length), rad, 4, false), mat);
    }
    group.strike = function (from, to, opts) {
      opts = opts || {};
      group.children.slice().forEach(function (c) { c.geometry.dispose(); group.remove(c); });
      var r = W.rng(seed += 17), main = [];
      zig(THREE, from.clone(), to.clone(), 0.35, opts.depth || 6, main, r);
      var w = opts.width || 0.12;
      group.add(segTube(main, w, core), segTube(main, w * 4.5, glow));
      // Ramifications
      for (var b = 0; b < (opts.branches != null ? opts.branches : 4); b++) {
        var s = main[(main.length * (0.15 + r() * 0.5)) | 0][1].clone();
        var dir = to.clone().sub(from).multiplyScalar(0.18 + r() * 0.2); dir.x += (r() - 0.5) * from.distanceTo(to) * 0.4; dir.z += (r() - 0.5) * 6;
        var br = []; zig(THREE, s, s.clone().add(dir), 0.45, 4, br, r);
        group.add(segTube(br, w * 0.5, core), segTube(br, w * 2.4, glow));
      }
      flash.position.copy(to).add(new THREE.Vector3(0, 6, 0));
      if (GST.reduced()) return Promise.resolve();
      var seq = opts.seq || [[0, 1], [70, 0], [130, 1], [210, 0.25], [260, 1], [520, 0]];
      return new Promise(function (res) {
        seq.forEach(function (st, i) {
          setTimeout(function () {
            group.visible = st[1] > 0; core.opacity = st[1]; glow.opacity = 0.35 * st[1];
            flash.intensity = st[1] * (opts.light || 900);
            if (opts.onFlash) opts.onFlash(st[1]);
            if (i === seq.length - 1) res();
          }, st[0]);
        });
      });
    };
    group.flash = flash;
    return group;
  };

  /* ── Oiseaux : vol en V, battements d'ailes, virages inclinés ───────── */
  W.birds = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var flock = new THREE.Group(), birds = [], r = W.rng(o.seed || 21);
    var mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(o.color || "#141414"), flatShading: true, side: THREE.DoubleSide, roughness: 0.8 });
    var body = new THREE.ConeGeometry(0.12, 0.7, 4); body.rotateX(Math.PI / 2);
    var wingG = new THREE.BufferGeometry();
    wingG.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -0.15, 0, 0, 0.22, 0.95, 0.05, -0.05], 3)); wingG.computeVertexNormals();
    for (var i = 0; i < (o.count || 9); i++) {
      var b = new THREE.Group();
      b.add(new THREE.Mesh(body, mat));
      var wl = new THREE.Mesh(wingG, mat), wr = new THREE.Mesh(wingG, mat); wr.scale.x = -1;
      b.add(wl, wr);
      var row = Math.ceil(i / 2), side = i % 2 ? 1 : -1;
      b.userData = { wl: wl, wr: wr, off: new THREE.Vector3(side * row * 1.3, (r() - 0.5) * 0.4, row * 1.4), ph: r() * 6.28, sp: 9 + r() * 3 };
      b.scale.setScalar(o.scale || 1);
      flock.add(b); birds.push(b);
    }
    var path = o.path || function (t) { return new THREE.Vector3(Math.cos(t) * 36, 18 + Math.sin(t * 2) * 3, Math.sin(t) * 24); };
    var T = o.t0 || 0, speed = o.speed || 0.05, lead = new THREE.Vector3(), next = new THREE.Vector3(), q = new THREE.Quaternion(), m4 = new THREE.Matrix4();
    api.onFrame(function (dt) {
      T += dt * speed;
      lead.copy(path(T)); next.copy(path(T + 0.02));
      var dir = next.clone().sub(lead).normalize();
      m4.lookAt(next, lead, new THREE.Vector3(0, 1, 0)); q.setFromRotationMatrix(m4);
      birds.forEach(function (b, i) {
        var u = b.userData;
        var off = u.off.clone().applyQuaternion(q);
        b.position.copy(lead).add(off);
        b.quaternion.copy(q);
        var flap = Math.sin(api.t * u.sp + u.ph);
        var glide = Math.sin(api.t * 0.7 + u.ph) > 0.55 ? 0.15 : 1;
        u.wl.rotation.z = flap * 0.75 * glide; u.wr.rotation.z = -flap * 0.75 * glide;
        b.position.y += Math.sin(api.t * 1.3 + u.ph) * 0.15;
      });
    });
    return flock;
  };

  /* ── Formes : chemins SVG → THREE.Shape (M L C Q Z, absolus) ────────── */
  W.shapeFromPath = function (THREE, d, mirror) {
    var s = new THREE.Shape(), tok = d.match(/[MLCQZ]|-?\d*\.?\d+/g), i = 0, cmd, sx = mirror ? -1 : 1;
    function n() { return parseFloat(tok[i++]); }
    while (i < tok.length) {
      if (/[MLCQZ]/.test(tok[i])) cmd = tok[i++];
      if (cmd === "M") s.moveTo(sx * n(), n());
      else if (cmd === "L") s.lineTo(sx * n(), n());
      else if (cmd === "C") s.bezierCurveTo(sx * n(), n(), sx * n(), n(), sx * n(), n());
      else if (cmd === "Q") s.quadraticCurveTo(sx * n(), n(), sx * n(), n());
      else if (cmd === "Z") { s.closePath(); }
    }
    return s;
  };

  /* Fleur de lys (même tracé que le glyphe ⚜, dessiné pour le web) */
  W.FLEUR = {
    center: "M-0.13 0.08 C-0.42 0.42 -0.36 0.98 0 1.42 C0.36 0.98 0.42 0.42 0.13 0.08 Z",
    side: "M0.1 0.1 C0.12 0.62 0.5 0.92 0.82 0.78 C1.04 0.68 1.02 0.36 0.8 0.32 C0.66 0.3 0.6 0.44 0.7 0.5 C0.55 0.52 0.36 0.36 0.32 0.08 Z",
    band: "M-0.46 -0.05 L0.46 -0.05 Q0.52 -0.05 0.52 0.01 L0.52 0.05 Q0.52 0.11 0.46 0.11 L-0.46 0.11 Q-0.52 0.11 -0.52 0.05 L-0.52 0.01 Q-0.52 -0.05 -0.46 -0.05 Z",
    low: "M-0.12 -0.05 C-0.14 -0.3 -0.06 -0.46 0 -0.58 C0.06 -0.46 0.14 -0.3 0.12 -0.05 Z",
    lowSide: "M0.1 -0.06 C0.3 -0.06 0.46 -0.18 0.52 -0.42 C0.38 -0.32 0.24 -0.28 0.1 -0.26 Z"
  };
  /* Renvoie un groupe dont chaque pièce est extrudée et pivotable (pour l'éclosion). */
  W.fleur = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var depth = o.depth || 0.16;
    var mat = o.material || new THREE.MeshStandardMaterial({ color: new THREE.Color(o.color || "#FFD23F"), roughness: 0.35, metalness: 0.45, flatShading: false, emissive: new THREE.Color(o.emissive || "#3A2A00"), emissiveIntensity: 0.6 });
    var ex = { depth: depth, bevelEnabled: true, bevelThickness: depth * 0.45, bevelSize: 0.035, bevelSegments: 3, curveSegments: 18 };
    var g = new THREE.Group(), parts = {};
    function part(name, d, mirror, pivot) {
      var geo = new THREE.ExtrudeGeometry(W.shapeFromPath(THREE, d, mirror), ex);
      geo.translate(-pivot[0], -pivot[1], -depth / 2);
      var m = new THREE.Mesh(geo, mat); m.position.set(pivot[0], pivot[1], 0); m.castShadow = true;
      var holder = new THREE.Group(); holder.add(m); g.add(holder); parts[name] = m; return m;
    }
    part("center", W.FLEUR.center, false, [0, 0.08]);
    part("right", W.FLEUR.side, false, [0.2, 0.08]);
    part("left", W.FLEUR.side, true, [-0.2, 0.08]);
    part("band", W.FLEUR.band, false, [0, 0.03]);
    part("low", W.FLEUR.low, false, [0, -0.05]);
    part("lowR", W.FLEUR.lowSide, false, [0.1, -0.06]);
    part("lowL", W.FLEUR.lowSide, true, [-0.1, -0.06]);
    g.userData.parts = parts; g.userData.mat = mat;
    /* Éclosion : 0 = bouton fermé, 1 = fleur ouverte */
    g.bloom = function (k) {
      var e = Math.min(1, Math.max(0, k));
      var c = W.smooth(0, 0.55, e), s = W.smooth(0.25, 1, e), l = W.smooth(0.1, 0.7, e);
      parts.center.scale.set(0.25 + c * 0.75, 0.15 + c * 0.85, 0.6 + c * 0.4);
      parts.right.rotation.z = (1 - s) * 1.25; parts.left.rotation.z = -(1 - s) * 1.25;
      parts.right.scale.setScalar(0.05 + s * 0.95); parts.left.scale.setScalar(0.05 + s * 0.95);
      parts.band.scale.set(0.2 + l * 0.8, 1, 1);
      ["low", "lowR", "lowL"].forEach(function (n) { parts[n].scale.setScalar(0.05 + l * 0.95); });
    };
    return g;
  };

  /* Éclair du logo : zigzag extrudé, aplat Éclair lumineux */
  W.boltSolid = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var pts = [[0.05, 1], [0.58, 1], [0.38, 0.6], [0.7, 0.6], [0.12, -0.12], [0.3, 0.42], [-0.02, 0.42]];
    var s = new THREE.Shape(); pts.forEach(function (p, i) { var x = p[0] - 0.34, y = p[1]; if (i) s.lineTo(x, y); else s.moveTo(x, y); }); s.closePath();
    var geo = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 2 });
    geo.translate(0.22, 0.12, -0.07); // la pointe basse de l'éclair devient l'origine
    var mat = new THREE.MeshStandardMaterial({ color: new THREE.Color("#FFD23F"), emissive: new THREE.Color("#FFB800"), emissiveIntensity: 0.9, roughness: 0.4, metalness: 0.1 });
    var m = new THREE.Mesh(geo, mat); m.scale.setScalar(o.size || 4);
    return m;
  };

  /* Corde scoute : 3 brins torsadés autour d'un cercle (cordelière du logo) */
  W.rope = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var R = o.radius || 10, r = o.thick || 0.42, turns = o.turns || 64, g = new THREE.Group();
    var mat = o.material || W.std(api, o.color || "#0C7873", { flatShading: false, roughness: 0.75 });
    for (var k = 0; k < 3; k++) {
      var ph = (k / 3) * Math.PI * 2;
      var curve = new THREE.Curve();
      curve.getPoint = (function (ph) {
        return function (t, out) {
          out = out || new THREE.Vector3();
          var a = t * Math.PI * 2, tw = a * turns + ph;
          var rr = R + Math.cos(tw) * r * 0.55;
          return out.set(Math.cos(a) * rr, Math.sin(a) * rr, Math.sin(tw) * r * 0.55);
        };
      })(ph);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, turns * 10, r * 0.5, 6, true), mat));
    }
    return g;
  };

  /* ═══ La Crête du Tonnerre en 3D ════════════════════════════════════════
     Massif du logo : pic principal frappé par l'éclair, épaulements à droite,
     second sommet à gauche. morph(0) = colline douce (où pousse la fleur),
     morph(1) = crête escarpée. Couleurs par face selon altitude et pente.   */
  W.CREST_PEAKS = [
    { x: -0.6, z: 0.2, h: 11.5, w: 7.2 }, { x: -5.4, z: 1.6, h: 7.2, w: 5.2 }, { x: 4.4, z: -0.6, h: 8.4, w: 5.0 },
    { x: 7.6, z: 1.8, h: 4.6, w: 3.8 }, { x: -2.2, z: -5.2, h: 6.6, w: 5.4 }, { x: 2.6, z: 4.6, h: 3.8, w: 4.0 },
    { x: -8.2, z: -1.4, h: 3.4, w: 3.4 }, { x: 5.2, z: -5.0, h: 4.4, w: 3.8 }
  ];
  W.crestMountain = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var R = o.radius || 12, rings = o.rings || 46, segs = o.segs || 120, N = W.noise(o.seed || 13);
    var verts = [], hill = [], crest = [], idx = [];
    for (var i = 0; i <= rings; i++) {
      var rr = (i / rings) * R;
      for (var j = 0; j < segs; j++) {
        var th = (j / segs) * Math.PI * 2 + (i % 2 ? Math.PI / segs : 0);
        var jit = i > 0 && i < rings ? 0.07 : 0;
        var x = Math.cos(th) * rr + (N(i * 3.1, j * 1.7) * jit), z = Math.sin(th) * rr + (N(j * 2.3, i * 1.9) * jit);
        verts.push(x, z);
        var d = Math.hypot(x, z), edge = 1 - W.smooth(R * 0.72, R, d);
        hill.push((2.8 * Math.exp(-Math.pow(d / 5.2, 2)) + 0.25 * N.fbm(x * 0.2, z * 0.2, 2)) * edge);
        var mx = 0, sum = 0;
        W.CREST_PEAKS.forEach(function (pk) {
          var dd = Math.hypot(x - pk.x, z - pk.z) / pk.w, v = dd < 1 ? pk.h * Math.pow(1 - dd, 1.55) : 0;
          mx = Math.max(mx, v); sum += v;
        });
        var hc = mx + (sum - mx) * 0.18 + 2.2 * Math.exp(-Math.pow(d / 8.5, 2));
        hc += (N.ridged(x * 0.36, z * 0.36, 4) - 0.32) * 1.9 * W.smooth(1, 6, hc);
        crest.push(Math.max(0, hc) * edge);
      }
    }
    for (i = 0; i < rings; i++) for (j = 0; j < segs; j++) {
      var a = i * segs + j, b = i * segs + (j + 1) % segs, c = (i + 1) * segs + j, dd2 = (i + 1) * segs + (j + 1) % segs;
      idx.push(a, b, c, b, dd2, c);
    }
    // Géométrie non indexée : 3 sommets par face (facettes franches)
    var F = idx.length, pos = new Float32Array(F * 3), col = new Float32Array(F * 3);
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    var cTok = {
      deep: W.c(api, "--gst-teal-700"), base: new THREE.Color("#3E8A62"), mid: W.c(api, "--gst-teal-500"), high: W.c(api, "--gst-teal-400"),
      top: W.c(api, "--gst-teal-200"), snow: W.c(api, "--gst-paper"), rock: W.c(api, "--gst-teal-600"), grass: new THREE.Color("#5C9A58"), grass2: new THREE.Color("#8DB65E"), lowland: new THREE.Color("#2E7E6A")
    };
    var tmp = new THREE.Color(), v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), nrm = new THREE.Vector3();
    var mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.9, metalness: 0 }));
    mesh.castShadow = true; mesh.receiveShadow = true;
    var state = { k: -1 };
    mesh.morph = function (k) {
      k = Math.min(1, Math.max(0, k));
      if (Math.abs(k - state.k) < 1e-4) return; state.k = k;
      var e = k * k * (3 - 2 * k);
      for (var f = 0; f < F; f += 3) {
        for (var q = 0; q < 3; q++) {
          var vi = idx[f + q];
          pos[(f + q) * 3] = verts[vi * 2]; pos[(f + q) * 3 + 2] = verts[vi * 2 + 1];
          pos[(f + q) * 3 + 1] = hill[vi] + (crest[vi] - hill[vi]) * e;
        }
        v0.fromArray(pos, f * 3); v1.fromArray(pos, f * 3 + 3); v2.fromArray(pos, f * 3 + 6);
        nrm.subVectors(v2, v1).cross(v0.clone().sub(v1)).normalize();
        var y = (v0.y + v1.y + v2.y) / 3, slope = Math.abs(nrm.y), hn = y / 12;
        // Colline : prairie verte · Crête : teal minéral, neige au sommet
        var gr = tmp.copy(cTok.grass).lerp(cTok.grass2, W.smooth(0.2, 2.6, y)).clone();
        var cr;
        if (hn > 0.8 && slope > 0.5) cr = cTok.snow;
        else if (hn > 0.66) cr = slope > 0.62 ? cTok.top : cTok.high;
        else if (hn > 0.42) cr = slope > 0.7 ? cTok.high : cTok.rock;
        else if (hn > 0.2) cr = slope > 0.74 ? cTok.mid : cTok.deep;
        else cr = slope > 0.85 ? gr : cTok.base;
        tmp.copy(gr).lerp(cr, e);
        var shade = 0.92 + ((f * 7919) % 17) / 170;
        for (q = 0; q < 3; q++) { col[(f + q) * 3] = tmp.r * shade; col[(f + q) * 3 + 1] = tmp.g * shade; col[(f + q) * 3 + 2] = tmp.b * shade; }
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
      geo.computeVertexNormals(); geo.computeBoundingSphere();
      if (mesh.userData.onMorph) mesh.userData.onMorph(e);
    };
    /* Sonde : 3 sommets les plus proches + poids, pour draper un décor sur le relief */
    mesh.probe = function (x, z) {
      var n = [[1e9, 0], [1e9, 0], [1e9, 0]];
      for (var vi = 0; vi < verts.length / 2; vi++) {
        var d = (verts[vi * 2] - x) * (verts[vi * 2] - x) + (verts[vi * 2 + 1] - z) * (verts[vi * 2 + 1] - z);
        if (d < n[2][0]) { n[2] = [d, vi]; n.sort(function (p, q) { return p[0] - q[0]; }); }
      }
      var w = n.map(function (p) { return 1 / (Math.sqrt(p[0]) + 1e-3); }), sw = w[0] + w[1] + w[2];
      return { i: n.map(function (p) { return p[1]; }), w: w.map(function (v) { return v / sw; }) };
    };
    mesh.probeHeight = function (pr, e) {
      var h = 0; for (var q = 0; q < 3; q++) { var vi = pr.i[q]; h += (hill[vi] + (crest[vi] - hill[vi]) * e) * pr.w[q]; } return h;
    };
    mesh.heightAt = function (x, z, k) {
      var best = 1e9, bi = 0;
      for (var vi = 0; vi < verts.length / 2; vi++) { var d = (verts[vi * 2] - x) * (verts[vi * 2] - x) + (verts[vi * 2 + 1] - z) * (verts[vi * 2 + 1] - z); if (d < best) { best = d; bi = vi; } }
      var e = k * k * (3 - 2 * k); return hill[bi] + (crest[bi] - hill[bi]) * e;
    };
    mesh.summit = function (k) {
      var e = k * k * (3 - 2 * k), best = -1, bi = 0;
      for (var vi = 0; vi < hill.length; vi++) { var h = hill[vi] + (crest[vi] - hill[vi]) * e; if (h > best) { best = h; bi = vi; } }
      return new THREE.Vector3(verts[bi * 2], best, verts[bi * 2 + 1]);
    };
    mesh.morph(o.morph != null ? o.morph : 1);
    return mesh;
  };

  /* Lettres blanches posées dans le gazon, drapées sur le relief (suivent le morph) */
  W.lawnText = function (api, mountain, o) {
    var THREE = api.THREE; o = o || {};
    var cx = o.x || 0, cz = o.z || 9.75, w = o.width || 7.4, d = o.depth || 3.7, nx = 44, nz = 18;
    var cv = document.createElement("canvas"); cv.width = 1024; cv.height = 512;
    var tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    function draw() {
      var x = cv.getContext("2d"); x.clearRect(0, 0, cv.width, cv.height);
      x.fillStyle = "#FFFFFF"; x.textAlign = "center"; x.textBaseline = "middle";
      x.font = '400 300px "Bebas Neue", "Arial Narrow", sans-serif';
      if ("letterSpacing" in x) x.letterSpacing = "26px";
      // Lettres étirées en profondeur : elles se lisent de face malgré l'angle rasant
      x.save(); x.translate(cv.width / 2, cv.height / 2 + 12); x.scale(1.18, 1.62);
      x.shadowColor = "rgba(20,60,40,.35)"; x.shadowBlur = 6; x.fillText(o.text || "GST", 0, 0); x.restore();
      tex.needsUpdate = true;
    }
    draw();
    if (document.fonts && document.fonts.load) document.fonts.load('400 300px "Bebas Neue"').then(draw, function () {});
    var geo = new THREE.PlaneGeometry(w, d, nx, nz); geo.rotateX(-Math.PI / 2);
    var P = geo.attributes.position, probes = [];
    for (var i = 0; i < P.count; i++) probes.push(mountain.probe(P.getX(i) + cx, P.getZ(i) + cz));
    var mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.75, metalness: 0, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, emissive: new THREE.Color("#FFFFFF"), emissiveMap: tex, emissiveIntensity: 0.18 });
    var mesh = new THREE.Mesh(geo, mat); mesh.position.set(cx, 0, cz); mesh.receiveShadow = true; mesh.renderOrder = 2;
    function fit(e) {
      for (var i = 0; i < P.count; i++) P.setY(i, mountain.probeHeight(probes[i], e) + 0.06);
      P.needsUpdate = true; geo.computeVertexNormals(); geo.computeBoundingSphere();
    }
    var prev = mountain.userData.onMorph;
    mountain.userData.onMorph = function (e) { if (prev) prev(e); fit(e); };
    fit(1);
    mesh.userData.redraw = draw;
    return mesh;
  };

  /* Médaillon complet : massif + cordelière + anneau rouge + éclair + fleurs latérales */
  W.crest = function (api, o) {
    var THREE = api.THREE; o = o || {};
    var g = new THREE.Group();
    var mountain = W.crestMountain(api, { morph: o.morph != null ? o.morph : 1, radius: 12 });
    g.add(mountain);
    if (o.lawnText !== false) g.add(W.lawnText(api, mountain, { text: o.lawnText || "GST" }));
    var plinth = new THREE.Mesh(new THREE.CylinderGeometry(12.6, 13.4, 1.6, 64), W.std(api, "--gst-teal-700", { flatShading: false, roughness: 0.6 }));
    plinth.position.y = -0.86; plinth.receiveShadow = true; g.add(plinth);
    var lip = new THREE.Mesh(new THREE.TorusGeometry(12.75, 0.22, 8, 96), W.std(api, "--gst-red-500", { flatShading: false, roughness: 0.5 }));
    lip.rotation.x = Math.PI / 2; lip.position.y = -0.04; g.add(lip);
    // Cordelière verticale derrière le massif
    var halo = new THREE.Group(); halo.position.set(0, 10, -6);
    var rope = W.rope(api, { radius: 15, thick: 0.7, turns: 80, color: "#0C7873" });
    var red = new THREE.Mesh(new THREE.TorusGeometry(13.6, 0.22, 8, 128), W.std(api, "--gst-red-500", { flatShading: false, roughness: 0.4 }));
    halo.add(rope, red);
    var fl = W.fleur(api, { color: "#0C7873", emissive: "#000000" }); fl.scale.setScalar(1.9); fl.position.set(-17.4, -1.2, 0.2); fl.bloom(1);
    var fr = W.fleur(api, { color: "#0C7873", emissive: "#000000" }); fr.scale.setScalar(1.9); fr.position.set(17.4, -1.2, 0.2); fr.bloom(1);
    halo.add(fl, fr);
    g.add(halo);
    var bolt = W.boltSolid(api, { size: 5.2 });
    var top = mountain.summit(1);
    bolt.position.set(top.x, top.y + 0.2, top.z); bolt.rotation.z = 0.18;
    g.add(bolt);
    var boltLight = new THREE.PointLight(new THREE.Color("#FFD23F"), 40, 30, 1.6); boltLight.position.copy(bolt.position).add(new THREE.Vector3(0, 2, 2)); g.add(boltLight);
    g.userData = { mountain: mountain, halo: halo, rope: rope, red: red, bolt: bolt, boltLight: boltLight, plinth: plinth, lip: lip, fleurs: [fl, fr], summit: top };
    return g;
  };
})();
