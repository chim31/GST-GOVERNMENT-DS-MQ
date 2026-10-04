/* ═══════════════════════════════════════════════════════════════════════
   GST GOVERNMENT — Kit 3D « Diorama papier technique »
   Script classique : reçoit THREE (chargé à la demande depuis le CDN, sur
   les seules pages 3D). Production : React Three Fiber + drei, mêmes règles.

   Langage commun : low-poly, faces planes, toon à 3 bandes, arêtes hairline,
   palette = tokens, ciel en 4 aplats étagés, socle carré cadré de teal,
   1 lumière directionnelle + 1 ambiante, DPR ≤ 1,5, pause hors écran,
   bascule 2D si WebGL absent ou FPS < 30 pendant 2 s.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var K = (window.GST3D = {});
  var GST = window.GST;

  K.webglOK = function () {
    try { var c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
    catch (e) { return false; }
  };
  /* Appareil modeste : peu de cœurs ou de mémoire → 2D d'office. */
  K.lowEnd = function () {
    var mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
    return mem <= 2 || cores <= 2;
  };

  /* Facettes franches : normales par face (le toon n'a pas de flatShading) */
  K.facet = function (geo) { var g = geo.index ? geo.toNonIndexed() : geo; g.computeVertexNormals(); return g; };

  K.col = function (THREE, token) { return new THREE.Color(GST.token(token) || "#ff00ff"); };

  /* Carte de dégradé toon : 3 bandes nettes (lumière / ombre propre / ombre portée) */
  K.toonMap = function (THREE) {
    var t = new THREE.DataTexture(new Uint8Array([150, 205, 255]), 3, 1, THREE.RedFormat);
    t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
    return t;
  };

  K.setup = function (THREE, canvas, opts) {
    opts = opts || {};
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(opts.fov || 35, 1, 0.5, 900);
    var amb = new THREE.AmbientLight(0xffffff, opts.ambient != null ? opts.ambient : 1.15);
    var sun = new THREE.DirectionalLight(0xffffff, opts.sun != null ? opts.sun : 2.1);
    sun.position.set(-18, 30, 14);
    scene.add(amb, sun);
    var api = {
      THREE: THREE, renderer: renderer, scene: scene, camera: camera, amb: amb, sun: sun, canvas: canvas,
      toon: K.toonMap(THREE), frameCbs: [], running: false, visible: true, t: 0,
      mat: function (token, extra) {
        extra = Object.assign({}, extra || {}); delete extra.flatShading;
        return new THREE.MeshToonMaterial(Object.assign({ color: K.col(THREE, token), gradientMap: api.toon }, extra));
      },
      flat: function (token, extra) { return new THREE.MeshBasicMaterial(Object.assign({ color: K.col(THREE, token) }, extra || {})); },
      resizeCbs: [],
      onResize: function (cb) { api.resizeCbs.push(cb); },
      resize: function () {
        var w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
        api.resizeCbs.forEach(function (cb) { cb(w, h); });
      },
      onFrame: function (cb) { api.frameCbs.push(cb); },
      render: function () { renderer.render(scene, camera); },
      start: function () {
        if (api.running) return; api.running = true;
        var last = performance.now();
        (function loop(now) {
          if (!api.running) return;
          api.raf = requestAnimationFrame(loop);
          if (!api.visible || document.hidden) { last = now; return; }
          var dt = Math.min(0.05, (now - last) / 1000); last = now; api.t += dt;
          for (var i = 0; i < api.frameCbs.length; i++) api.frameCbs[i](dt, api.t);
          renderer.render(scene, camera);
        })(last);
      },
      stop: function () { api.running = false; cancelAnimationFrame(api.raf); }
    };
    api.resize();
    if ("ResizeObserver" in window) new ResizeObserver(api.resize).observe(canvas);
    else addEventListener("resize", api.resize);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { api.visible = e[0].isIntersecting; }).observe(canvas);
    return api;
  };

  /* Arêtes hairline : la 3D ressemble à un plan d'ingénieur extrudé. */
  K.edges = function (api, mesh, token, opacity, threshold) {
    var THREE = api.THREE;
    var m = new THREE.LineBasicMaterial({ color: K.col(THREE, token), transparent: true, opacity: opacity != null ? opacity : 0.5 });
    var l = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, threshold || 22), m);
    mesh.add(l);
    return l;
  };

  /* ── Ciel en 4 aplats étagés (bande 1 = horizon … 4 = zénith) ────────── */
  K.SKY = {
    jour: ["--gst-sky-day-1", "--gst-sky-day-2", "--gst-sky-day-3", "--gst-sky-day-4"],
    aube: ["--gst-sky-dusk-1", "--gst-sky-dusk-2", "--gst-sky-dusk-3", "--gst-sky-dusk-4"],
    nuit: ["--gst-sky-night-1", "--gst-sky-night-2", "--gst-sky-night-3", "--gst-sky-night-4"]
  };
  K.skyByHour = function (h) {
    if (h == null) h = new Date().getHours();
    if ((h >= 6 && h < 8) || (h >= 17 && h < 19)) return "aube";
    if (h >= 8 && h < 17) return "jour";
    return "nuit";
  };
  K.sky = function (api, mode, bands) {
    var THREE = api.THREE;
    var u = {
      c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() },
      t: { value: new THREE.Vector3(bands ? bands[0] : 0.46, bands ? bands[1] : 0.64, bands ? bands[2] : 0.81) },
      shift: { value: 0 }
    };
    u.res = { value: new THREE.Vector2(1, 1) };
    /* Toile de fond peinte : 4 bandes nettes en espace écran (bande 1 en bas = horizon).
       shift décale légèrement les bandes avec l'inclinaison de la caméra (parallaxe). */
    var mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, depthTest: false, uniforms: u,
      vertexShader: "void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; uniform vec3 c4; uniform vec3 t; uniform float shift; uniform vec2 res;" +
        "void main(){ float h = gl_FragCoord.y / res.y + shift; vec3 c = c4; if(h < t.z) c = c3; if(h < t.y) c = c2; if(h < t.x) c = c1; gl_FragColor = vec4(c,1.0);\n" +
        "#include <colorspace_fragment>\n}"
    });
    var sky = new THREE.Mesh(new THREE.SphereGeometry(420, 32, 24), mat);
    sky.renderOrder = -1;
    sky.frustumCulled = false;
    sky.userData.mode = mode;
    api.scene.add(sky);
    var fit = function () { var v = new THREE.Vector2(); api.renderer.getDrawingBufferSize(v); u.res.value.copy(v); };
    fit(); api.onResize(fit);
    api.onFrame(function () { sky.position.copy(api.camera.position); });
    var setCols = function (m, k) {
      K.SKY[m].forEach(function (tok, i) {
        var target = K.col(THREE, tok);
        var c = u["c" + (i + 1)].value;
        if (k == null) c.copy(target); else c.lerp(target, k);
      });
    };
    setCols(mode);
    sky.setMode = function (m, dur) {
      if (!K.SKY[m]) return;
      sky.userData.mode = m;
      var from = [u.c1.value.clone(), u.c2.value.clone(), u.c3.value.clone(), u.c4.value.clone()];
      var to = K.SKY[m].map(function (tok) { return K.col(THREE, tok); });
      return GST.tween(dur != null ? dur : GST.ms("--gst-dur-scene") || 800, function (v) {
        // Bascule en aplats : chaque bande change franchement, de l'horizon au zénith
        for (var i = 0; i < 4; i++) {
          var local = Math.min(1, Math.max(0, v * 1.6 - i * 0.2));
          u["c" + (i + 1)].value.copy(from[i]).lerp(to[i], local < 1 ? Math.round(local * 3) / 3 : 1);
        }
      }, "trace");
    };
    sky.uniforms = u;
    return sky;
  };

  /* Étoiles = petits réticules carrés écru (nuit uniquement) */
  K.stars = function (api, count) {
    var THREE = api.THREE;
    var c = document.createElement("canvas"); c.width = c.height = 16;
    var g = c.getContext("2d"); g.strokeStyle = "#ffffff"; g.lineWidth = 1.5; g.strokeRect(4, 4, 8, 8);
    var tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter;
    /* Étoiles peintes sur la toile de fond : attachées à la caméra, moitié haute du cadre */
    var pos = new Float32Array(count * 3), D = 300;
    for (var i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2 * D * 0.75; pos[i * 3 + 1] = -D * 0.06 + Math.random() * D * 0.36; pos[i * 3 + 2] = -D;
    }
    var geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({ size: 9, sizeAttenuation: false, map: tex, transparent: true, color: K.col(THREE, "--gst-cream"), depthWrite: false, opacity: 0.75 });
    var pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    api.camera.add(pts);
    if (!api.camera.parent) api.scene.add(api.camera);
    return pts;
  };

  /* ── Plaques de courbes de niveau extrudées (diorama topographique) ──── */
  K.contourPlate = function (api, pts, depth, token, opts) {
    var THREE = api.THREE; opts = opts || {};
    var shape = new THREE.Shape();
    pts.forEach(function (p, i) { if (i) shape.lineTo(p[0], p[1]); else shape.moveTo(p[0], p[1]); });
    shape.closePath();
    var geo = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false, curveSegments: 1 });
    geo.rotateX(-Math.PI / 2);
    var mesh = new THREE.Mesh(geo, api.mat(token, opts.material));
    if (opts.edges !== false) K.edges(api, mesh, opts.edgeToken || "--gst-teal-900", opts.edgeOpacity != null ? opts.edgeOpacity : 0.38, 30);
    return mesh;
  };
  /* Pile de plaques : rFn(level, θ) rayon · cFn(level) centre [x,z] */
  K.contourStack = function (api, o) {
    var THREE = api.THREE;
    var group = new THREE.Group();
    var N = o.segments || 40;
    for (var l = 0; l < o.levels; l++) {
      var pts = [];
      var c = o.cFn ? o.cFn(l) : [0, 0];
      for (var i = 0; i < N; i++) {
        var th = (i / N) * Math.PI * 2, r = o.rFn(l, th);
        pts.push([c[0] + Math.cos(th) * r, -(c[1] + Math.sin(th) * r)]);
      }
      var tok = o.tokens[Math.min(o.tokens.length - 1, Math.floor((l / o.levels) * o.tokens.length))];
      var m = K.contourPlate(api, pts, o.step, tok, { edgeToken: o.edgeToken, edgeOpacity: o.edgeOpacity });
      m.position.y = (o.base || 0) + l * o.step;
      m.userData.level = l; m.userData.y = m.position.y;
      group.add(m);
    }
    return group;
  };

  /* Socle carré à bords nets, cerclé du cadre teal — clin d'œil aux affiches */
  K.socle = function (api, size, opts) {
    var THREE = api.THREE; opts = opts || {};
    var g = new THREE.Group();
    var frameW = opts.frame || size * 0.035;
    var frame = new THREE.Mesh(new THREE.BoxGeometry(size + frameW * 2, opts.h || 1.2, size + frameW * 2), api.mat(opts.frameToken || "--gst-teal-600"));
    frame.position.y = -(opts.h || 1.2) / 2 - 0.02;
    var top = new THREE.Mesh(new THREE.BoxGeometry(size, (opts.h || 1.2) * 0.98, size), api.mat(opts.topToken || "--gst-cream"));
    top.position.y = -(opts.h || 1.2) / 2 + 0.03;
    K.edges(api, frame, "--gst-teal-900", 0.5);
    K.edges(api, top, opts.edgeToken || "--gst-teal-900", 0.25);
    g.add(frame, top);
    return g;
  };

  /* Arbres instanciés : cônes à 6 pans */
  K.trees = function (api, positions, token) {
    var THREE = api.THREE;
    var geo = K.facet(new THREE.ConeGeometry(0.55, 1.6, 6, 1));
    geo.translate(0, 0.8, 0);
    var mesh = new THREE.InstancedMesh(geo, api.mat(token || "--gst-teal-600", { flatShading: true }), positions.length);
    var m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    positions.forEach(function (p, i) {
      var k = p[3] || 1; s.set(k, k * (0.8 + ((i * 37) % 10) / 20), k);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), i * 1.7);
      m.compose(new THREE.Vector3(p[0], p[1], p[2]), q, s);
      mesh.setMatrixAt(i, m);
    });
    return mesh;
  };

  /* Nuages = disques plats empilés */
  K.cloud = function (api, scale, token) {
    var THREE = api.THREE;
    var g = new THREE.Group();
    var mat = api.mat(token || "--gst-white");
    [[0, 0, 0, 1.6], [1.4, 0.32, 0.2, 1.1], [-1.3, 0.28, -0.1, 1.0], [0.2, 0.62, 0, 0.9]].forEach(function (d) {
      var m = new THREE.Mesh(new THREE.CylinderGeometry(d[3], d[3], 0.3, 9), mat);
      m.position.set(d[0], d[1], d[2]);
      K.edges(api, m, "--gst-teal-700", 0.25, 40);
      g.add(m);
    });
    g.scale.setScalar(scale || 1);
    return g;
  };

  /* Éclair 3D : polygone plat billboardé, aplat Éclair + contour encre. Aucun flou. */
  K.bolt = function (api, height) {
    var THREE = api.THREE, h = height || 6, w = h * 0.34;
    var p = [[0.10, 1], [0.62, 1], [0.40, 0.58], [0.72, 0.58], [0.14, 0], [0.30, 0.44], [0, 0.44]];
    var shape = new THREE.Shape();
    p.forEach(function (q, i) { var x = (q[0] - 0.36) * w, y = q[1] * h; if (i) shape.lineTo(x, y); else shape.moveTo(x, y); });
    shape.closePath();
    var geo = new THREE.ShapeGeometry(shape);
    var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: K.col(THREE, "--gst-eclair"), side: THREE.DoubleSide, transparent: true, depthTest: false }));
    var line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(shape.getPoints().map(function (v) { return new THREE.Vector3(v.x, v.y, 0.01); })),
      new THREE.LineBasicMaterial({ color: K.col(THREE, "--gst-ink"), transparent: true, depthTest: false }));
    mesh.add(line);
    mesh.renderOrder = 10; line.renderOrder = 11;
    mesh.visible = false;
    return mesh;
  };
  /* Anneau net (carré, comme les réticules) qui pulse — le seul « glow » toléré */
  K.ring = function (api, token) {
    var THREE = api.THREE;
    var pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) { return new THREE.Vector3(q[0], q[1], 0); });
    var l = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: K.col(THREE, token || "--gst-eclair"), transparent: true, depthTest: false }));
    l.renderOrder = 12; l.visible = false;
    return l;
  };

  K.project = function (api, v3) {
    var v = v3.clone().project(api.camera);
    return { x: (v.x * 0.5 + 0.5) * api.canvas.clientWidth, y: (-v.y * 0.5 + 0.5) * api.canvas.clientHeight, behind: v.z > 1 };
  };

  /* Moniteur de performance : FPS < 30 pendant 2 s → onLow() une seule fois */
  K.perf = function (api, onLow) {
    if (/[?&]noperf\b/.test(location.search)) return; // banc d'essai : désactive la bascule auto
    var acc = 0, frames = 0, lowFor = 0, fired = false, warm = 0;
    api.onFrame(function (dt) {
      if (fired) return;
      warm += dt; if (warm < 1.5) return; // ignore le démarrage
      acc += dt; frames++;
      if (acc >= 0.5) {
        var fps = frames / acc;
        lowFor = fps < 30 ? lowFor + acc : 0;
        acc = 0; frames = 0;
        if (lowFor >= 2) { fired = true; onLow && onLow(fps); }
      }
    });
  };

  /* Courbe d'animation GST côté 3D */
  K.tween = function (dur, fn, ease, delay) { return GST.tween(dur, fn, ease, delay); };
})();
