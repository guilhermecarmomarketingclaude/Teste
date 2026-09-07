/* =========================================================
   HD Properties — maquete do hero
   Uma aldeia algarvia em volumes brancos, iluminada por um sol
   que o visitante move com o cursor. Ao entardecer as janelas
   acendem-se; arrastar roda a maquete; passar sobre uma casa
   mostra a etiqueta.

   Depende de three.js (alojado em vendor/three.min.js). Se a
   biblioteca não carregar, o hero fica com o céu em CSS e a
   página funciona na mesma.
   ========================================================= */

window.HDHero = (function () {
  "use strict";

  var COLOR = {
    wall: 0xe8e3d6,
    wallWarm: 0xdcd4c2,
    roof: 0xd3cab5,
    chimney: 0xc96f3c,
    ground: 0x0b1613,
    water: 0x0e3b3a,
    trunk: 0x453f31,
    frond: 0x2f4a39,
    sun: 0xffc46b,
    window: 0xffa02e,
  };

  var TYPES = ["hud.villa", "hud.apartment", "hud.townhouse"];
  var ZONES = ["Albufeira", "Vilamoura", "Quarteira", "Almancil", "Faro", "Olhão"];
  var SIZES = ["T1", "T2", "T3", "T4"];

  // gerador com semente fixa: a aldeia é sempre a mesma
  function seeded(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function init(options) {
    var opts = options || {};
    var translate =
      opts.translate ||
      function (key) {
        return key;
      };

    var canvas = document.getElementById("hero-canvas");
    var hero = document.querySelector(".hero");
    var tag = document.getElementById("hero-tag");
    if (!canvas || !hero || typeof window.THREE === "undefined") return null;

    var THREE = window.THREE;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var coarse = window.matchMedia("(hover: none)").matches;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !coarse, alpha: true });
    } catch (err) {
      canvas.style.display = "none";
      return null;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a221d, 0.0088);

    var camera = new THREE.PerspectiveCamera(34, 1, 0.5, 400);

    /* ---------- luz ---------- */
    var sky = new THREE.HemisphereLight(0x8fb6c6, 0x0a1512, 0.34);
    scene.add(sky);
    var fill = new THREE.AmbientLight(0xffe0bb, 0.06);
    scene.add(fill);

    var sun = new THREE.DirectionalLight(0xffd9a0, 2.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 160;
    sun.shadow.camera.left = -34;
    sun.shadow.camera.right = 34;
    sun.shadow.camera.top = 34;
    sun.shadow.camera.bottom = -34;
    sun.shadow.bias = -0.0012;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);
    scene.add(sun.target);

    function discMaterial(opacity) {
      var m = new THREE.MeshBasicMaterial({
        color: COLOR.sun,
        fog: false,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      m.toneMapped = false; // o sol não passa pelo tone mapping, senão perde a cor
      return m;
    }

    // halo com queda suave: um disco chapado dava um recorte duro no céu
    function glowTexture() {
      var c = document.createElement("canvas");
      c.width = c.height = 128;
      var g = c.getContext("2d");
      var grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(255,205,130,0.9)");
      grad.addColorStop(0.3, "rgba(255,170,80,0.32)");
      grad.addColorStop(1, "rgba(255,150,60,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    }

    var sunDisc = new THREE.Mesh(new THREE.CircleGeometry(4.2, 48), discMaterial(0.6));
    var haloMat = discMaterial(0.6);
    haloMat.map = glowTexture();
    haloMat.color.setHex(0xffffff);
    var sunHalo = new THREE.Mesh(new THREE.PlaneGeometry(42, 42), haloMat);
    sunDisc.add(sunHalo);
    sunHalo.position.z = -0.4;
    scene.add(sunDisc);

    /* ---------- materiais ---------- */
    var matWall = new THREE.MeshStandardMaterial({ color: COLOR.wall, roughness: 0.94, metalness: 0 });
    var matWallWarm = new THREE.MeshStandardMaterial({ color: COLOR.wallWarm, roughness: 0.95, metalness: 0 });
    var matRoof = new THREE.MeshStandardMaterial({ color: COLOR.roof, roughness: 0.9, metalness: 0 });
    var matChimney = new THREE.MeshStandardMaterial({ color: COLOR.chimney, roughness: 0.85, metalness: 0 });
    var matGround = new THREE.MeshStandardMaterial({ color: COLOR.ground, roughness: 0.98, metalness: 0 });
    var matWater = new THREE.MeshStandardMaterial({ color: COLOR.water, roughness: 0.08, metalness: 0.7 });
    var matTrunk = new THREE.MeshStandardMaterial({ color: COLOR.trunk, roughness: 0.95 });
    var matFrond = new THREE.MeshStandardMaterial({ color: COLOR.frond, roughness: 0.9, side: THREE.DoubleSide });
    // uma só instância: acender as janelas é mudar um valor
    var matWindow = new THREE.MeshStandardMaterial({
      color: 0x181815,
      emissive: COLOR.window,
      emissiveIntensity: 0,
      roughness: 0.6,
    });

    /* ---------- terreno e mar ---------- */
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), matGround);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ---------- aldeia ---------- */
    var village = new THREE.Group();
    village.position.set(6, 0, 0);
    scene.add(village);

    var houses = [];
    var boxGeo = new THREE.BoxGeometry(1, 1, 1);
    var paneGeo = new THREE.PlaneGeometry(1, 1);

    (function build() {
      var rand = seeded(20260907);
      var rows = [
        { z: -16, count: 5, minH: 3.4, maxH: 5.6, spread: 44 },
        { z: -6, count: 5, minH: 2.6, maxH: 4.2, spread: 40 },
        { z: 4, count: 4, minH: 2.2, maxH: 3.2, spread: 34 },
      ];

      rows.forEach(function (row, rowIndex) {
        var step = row.spread / row.count;
        for (var i = 0; i < row.count; i++) {
          var x = -row.spread / 2 + step * (i + 0.5) + (rand() - 0.5) * step * 0.3;
          var z = row.z + (rand() - 0.5) * 3;
          var w = 3 + rand() * 2.6;
          var d = 3 + rand() * 2.2;
          var h = row.minH + rand() * (row.maxH - row.minH);

          var house = new THREE.Group();
          house.position.set(x, 0, z);
          house.rotation.y = (rand() - 0.5) * 0.5;

          var body = new THREE.Mesh(boxGeo, rand() > 0.6 ? matWallWarm : matWall);
          body.scale.set(w, h, d);
          body.position.y = h / 2;
          body.castShadow = true;
          body.receiveShadow = true;
          house.add(body);

          // platibanda: a lip fina que remata a cobertura plana algarvia
          var parapet = new THREE.Mesh(boxGeo, matRoof);
          parapet.scale.set(w + 0.34, 0.3, d + 0.34);
          parapet.position.y = h + 0.12;
          parapet.castShadow = true;
          parapet.receiveShadow = true;
          house.add(parapet);

          // chaminé algarvia, sempre no canto
          var chimney = new THREE.Mesh(boxGeo, matChimney);
          var ch = 0.9 + rand() * 0.7;
          chimney.scale.set(0.5, ch, 0.5);
          chimney.position.set(w / 2 - 0.7, h + ch / 2, -d / 2 + 0.7);
          chimney.castShadow = true;
          house.add(chimney);

          // vãos na fachada virada à câmara
          var openings = 2 + Math.floor(rand() * 2);
          for (var j = 0; j < openings; j++) {
            var pane = new THREE.Mesh(paneGeo, matWindow);
            pane.scale.set(0.7, 0.95, 1);
            pane.position.set(-w / 2 + ((j + 1) * w) / (openings + 1), h * 0.55, d / 2 + 0.02);
            house.add(pane);
          }
          var door = new THREE.Mesh(paneGeo, matWindow);
          door.scale.set(0.75, 1.5, 1);
          door.position.set(0, 0.76, d / 2 + 0.02);
          house.add(door);

          house.userData = {
            type: TYPES[rowIndex === 0 ? 1 : rowIndex === 2 ? 0 : 2],
            zone: ZONES[Math.floor(rand() * ZONES.length)],
            size: SIZES[Math.floor(rand() * SIZES.length)],
            top: h + 1.6,
            body: body,
            baseY: 0,
          };
          houses.push(house);
          village.add(house);

          // piscina em frente às moradias da primeira linha
          if (rowIndex === 2 && rand() > 0.35) {
            var pool = new THREE.Mesh(paneGeo, matWater);
            pool.rotation.x = -Math.PI / 2;
            pool.scale.set(4.2, 2.4, 1);
            pool.position.set(x + (rand() - 0.5) * 2, 0.02, z + d / 2 + 3.2);
            scene.add(pool);
            village.add(pool);
          }

          // palmeiras
          if (rand() > 0.55) {
            var palm = new THREE.Group();
            var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 3.4, 6), matTrunk);
            trunk.position.y = 1.7;
            trunk.castShadow = true;
            palm.add(trunk);
            for (var f = 0; f < 6; f++) {
              var frond = new THREE.Mesh(paneGeo, matFrond);
              frond.scale.set(2.2, 0.38, 1);
              frond.position.y = 3.4;
              frond.rotation.set(-1.15, (Math.PI / 3) * f, 0.15);
              frond.castShadow = true;
              palm.add(frond);
            }
            palm.position.set(x + (rand() > 0.5 ? 1 : -1) * (w / 2 + 2.4), 0, z + d / 2 + 1.6);
            village.add(palm);
          }
        }
      });
    })();

    /* ---------- estado ---------- */
    var azimuth = 0.32;
    var azimuthTarget = 0.32;
    var dragAzimuth = 0;
    var elevation = 0.26;
    var elevationTarget = 0.26;
    var sunAz = 2.6;
    var sunAzTarget = 2.6;
    var radius = 74;
    var narrow = false;
    var pointer = { x: 0.5, y: 0.5, inside: false, ndc: new THREE.Vector2(), last: -1e5 };
    var dragging = false;
    var dragX = 0;
    var raycaster = new THREE.Raycaster();
    var hovered = null;
    var clock = 0;
    var running = false;
    var onScreen = true;
    var lastTime = 0;

    function resize() {
      var rect = hero.getBoundingClientRect();
      var w = Math.max(1, Math.round(rect.width));
      var h = Math.max(1, Math.round(rect.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      narrow = w < 900;
      radius = narrow ? 130 : 74;
      village.position.x = w < 900 ? 0 : 10;
      camera.updateProjectionMatrix();
    }

    function placeCamera() {
      var az = azimuth + dragAzimuth;
      var cosEl = Math.cos(elevation);
      camera.position.set(
        Math.sin(az) * radius * cosEl + village.position.x * 0.35,
        Math.sin(elevation) * radius + 3.5,
        Math.cos(az) * radius * cosEl
      );
      camera.lookAt(village.position.x * 0.5, narrow ? 11 : 2.6, -4);
    }

    function placeSun() {
      // o cursor comanda a hora do dia: em cima é tarde, em baixo é poente
      var height = 0.06 + (1 - pointer.y) * 0.34;
      var dist = 120;
      var sx = Math.sin(sunAz) * Math.cos(height) * dist;
      var sy = Math.sin(height) * dist;
      var sz = Math.cos(sunAz) * Math.cos(height) * dist;
      sun.position.set(sx, Math.max(4, sy), sz);
      sun.target.position.set(village.position.x, 0, -4);

      var dusk = Math.min(1, Math.max(0, 1 - height / 0.3));
      sun.color.setHSL(0.09 - dusk * 0.035, 0.55 + dusk * 0.35, 0.72 - dusk * 0.12);
      sun.intensity = 3.4 - dusk * 1.5;
      sky.intensity = 0.34 - dusk * 0.1;
      fill.intensity = 0.06 + dusk * 0.16;
      matWindow.emissiveIntensity = dusk * dusk * 5;

      sunDisc.position.set(sx * 0.8, Math.max(3, sy * 0.8), sz * 0.8);
      sunDisc.lookAt(camera.position);
      sunDisc.material.opacity = 0.2 + dusk * 0.55;
      sunHalo.material.opacity = 0.25 + dusk * 0.5;
      scene.fog.color.setHSL(0.45 - dusk * 0.05, 0.42, 0.075 + dusk * 0.02);
    }

    function updateHover() {
      if (!pointer.inside || coarse || dragging) {
        setHovered(null);
        return;
      }
      raycaster.setFromCamera(pointer.ndc, camera);
      var hits = raycaster.intersectObjects(houses, true);
      var found = null;
      for (var i = 0; i < hits.length; i++) {
        var obj = hits[i].object;
        while (obj && houses.indexOf(obj) === -1) obj = obj.parent;
        if (obj) {
          found = obj;
          break;
        }
      }
      setHovered(found);
    }

    function setHovered(house) {
      if (hovered === house) {
        if (house) positionTag(house);
        return;
      }
      if (hovered) hovered.userData.body.material = hovered.userData.originalMaterial || hovered.userData.body.material;
      hovered = house;
      if (!house) {
        if (tag) tag.classList.remove("visible");
        return;
      }
      positionTag(house);
    }

    var tagVector = new THREE.Vector3();

    function positionTag(house) {
      if (!tag) return;
      tagVector.set(house.position.x + village.position.x, house.userData.top, house.position.z);
      tagVector.project(camera);
      var rect = hero.getBoundingClientRect();
      tag.style.left = ((tagVector.x + 1) / 2) * rect.width + "px";
      tag.style.top = ((1 - tagVector.y) / 2) * rect.height + "px";
      tag.textContent = [translate(house.userData.type), house.userData.zone, house.userData.size].join(" · ");
      tag.classList.add("visible");
    }

    function frame(delta) {
      if (!reduceMotion) {
        if (!pointer.inside || clock - pointer.last > 3) {
          azimuthTarget = 0.32 + Math.sin(clock * 0.07) * 0.16;
          sunAzTarget = 2.6 + Math.sin(clock * 0.05) * 0.4;
          elevationTarget = 0.26;
        }
        var k = Math.min(1, delta * 2.2);
        azimuth += (azimuthTarget - azimuth) * k;
        elevation += (elevationTarget - elevation) * k;
        sunAz += (sunAzTarget - sunAz) * k;
      }
      placeCamera();
      placeSun();
      updateHover();
      renderer.render(scene, camera);
    }

    function loop(now) {
      if (!running) return;
      var delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      clock += delta;
      frame(delta);
      requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
    }

    /* ---------- interação ---------- */
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
      pointer.ndc.set(pointer.x * 2 - 1, -(pointer.y * 2 - 1));
      pointer.inside = true;
      pointer.last = clock;

      if (dragging) {
        dragAzimuth += (event.clientX - dragX) * 0.006;
        dragX = event.clientX;
        return;
      }
      if (!reduceMotion) {
        azimuthTarget = 0.32 + (pointer.x - 0.5) * 0.5;
        elevationTarget = 0.21 + (1 - pointer.y) * 0.11;
        sunAzTarget = 2.05 + pointer.x * 1.25;
      }
    });

    hero.addEventListener("pointerleave", function () {
      pointer.inside = false;
      setHovered(null);
    });

    hero.addEventListener("pointerdown", function (event) {
      if (event.target.closest("a, button, input, label, select, textarea")) return;
      dragging = true;
      dragX = event.clientX;
      hero.style.cursor = "grabbing";
    });

    window.addEventListener("pointerup", function () {
      dragging = false;
      hero.style.cursor = "";
    });

    /* ---------- ciclo ---------- */
    resize();
    placeCamera();
    placeSun();
    renderer.render(scene, camera);

    if (!reduceMotion) start();

    if ("ResizeObserver" in window) {
      new ResizeObserver(function () {
        resize();
        if (!running) {
          placeCamera();
          placeSun();
          renderer.render(scene, camera);
        }
      }).observe(hero);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          onScreen = entries[0].isIntersecting;
          if (onScreen && !document.hidden) start();
          else stop();
        },
        { threshold: 0.02 }
      ).observe(hero);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (onScreen) start();
    });

    return {
      refreshTag: function () {
        if (hovered) positionTag(hovered);
      },
    };
  }

  return { init: init };
})();
