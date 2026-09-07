/* =========================================================
   HD Properties — landing page
   Vanilla JS, sem dependências. Módulos:
     1. i18n (PT/EN)         5. simulador de receita
     2. hero wireframe 3D    6. formulário
     3. reveals e contadores 7. zonas
     4. navegação            8. micro-interações
   ========================================================= */

(function () {
  "use strict";

  /* ---------- TODO: substituir pelos dados reais da HD Properties ---------- */
  var CONTACT_EMAIL = "info@hdproperties.pt";
  /* ------------------------------------------------------------------------ */

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LANG_KEY = "hdp-lang";
  var currentLang = "pt";

  /* =========================================================
     1. i18n
     ========================================================= */
  function dict(lang) {
    return (window.I18N && window.I18N[lang]) || {};
  }

  function t(key, lang) {
    var d = dict(lang || currentLang);
    if (Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    var fallback = dict("pt");
    return Object.prototype.hasOwnProperty.call(fallback, key) ? fallback[key] : null;
  }

  function detectLang() {
    var stored = null;
    try {
      stored = localStorage.getItem(LANG_KEY);
    } catch (e) {
      /* localStorage indisponível (modo privado) — segue para a deteção */
    }
    if (stored === "pt" || stored === "en") return stored;
    var nav = (navigator.language || "pt").toLowerCase();
    return nav.indexOf("pt") === 0 ? "pt" : "en";
  }

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n"), lang);
      if (value !== null) el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var value = t(el.getAttribute("data-i18n-html"), lang);
      if (value !== null) el.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr")
        .split(";")
        .forEach(function (pair) {
          var parts = pair.split(":");
          if (parts.length < 2) return;
          var attr = parts[0].trim();
          var value = t(parts[1].trim(), lang);
          if (attr && value !== null) el.setAttribute(attr, value);
        });
    });

    var hint = t("common.placeholderTitle", lang) || "";
    document.querySelectorAll("[data-placeholder]").forEach(function (el) {
      el.setAttribute("title", hint);
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === lang));
    });

    // em ecrãs táteis não há cursor: a dica do hero muda de linguagem
    var hintEl = document.querySelector(".hero-hint");
    if (hintEl && window.matchMedia("(hover: none)").matches) {
      var touchHint = t("hero.hintTouch", lang);
      if (touchHint !== null) hintEl.textContent = touchHint;
    }

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* sem persistência — a escolha vale só para esta visita */
    }

    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
  }

  function initLang() {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLanguage(btn.getAttribute("data-lang"));
      });
    });
  }

  function locale() {
    return currentLang === "pt" ? "pt-PT" : "en-GB";
  }

  function money(value) {
    return new Intl.NumberFormat(locale(), {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  }

  function number(value, decimals) {
    return new Intl.NumberFormat(locale(), {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0,
    }).format(value);
  }

  /* =========================================================
     2. Navegação
     ========================================================= */
  function initNav() {
    var header = document.getElementById("site-header");
    var nav = document.getElementById("site-nav");
    var toggle = document.getElementById("nav-toggle");

    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    // link ativo conforme a secção visível
    var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
    var sections = links
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            links.forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      sections.forEach(function (section) {
        spy.observe(section);
      });
    }
  }

  /* =========================================================
     3. Reveals + contadores
     ========================================================= */
  function initReveals() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) {
        el.classList.add("in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
      io.observe(el);
    });
  }

  function initCounters() {
    var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));
    if (!counters.length) return;

    var render = function (el, value) {
      var decimals = parseInt(el.getAttribute("data-count-decimals") || "0", 10);
      var prefix = el.getAttribute("data-count-prefix") || "";
      var suffix = el.getAttribute("data-count-suffix") || "";
      el.textContent = prefix + number(value, decimals) + suffix;
    };

    var run = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      if (isNaN(target)) return;
      if (reduceMotion) {
        render(el, target);
        el.dataset.counted = "1";
        return;
      }
      var start = performance.now();
      var duration = 1400;
      var step = function (now) {
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        render(el, target * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.dataset.counted = "1";
      };
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            run(entry.target);
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach(function (el) {
        io.observe(el);
      });
    } else {
      counters.forEach(run);
    }

    // reformatar os números já animados quando muda o idioma
    document.addEventListener("langchange", function () {
      counters.forEach(function (el) {
        if (el.dataset.counted === "1") render(el, parseFloat(el.getAttribute("data-count-to")));
      });
    });
  }

  /* =========================================================
     4. Micro-interações (brilho nos cartões, botões magnéticos)
     ========================================================= */
  function initMicroInteractions() {
    if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;

    document.querySelectorAll(".glow-card").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", event.clientX - rect.left + "px");
        card.style.setProperty("--my", event.clientY - rect.top + "px");
      });
    });

    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (event) {
        var rect = btn.getBoundingClientRect();
        var dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        var dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        btn.style.transform = "translate(" + dx * 10 + "px," + dy * 8 + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* =========================================================
     5. Zonas — lista e mapa em espelho
     ========================================================= */
  function initZones() {
    var items = document.querySelectorAll(".zone-list li");
    var dots = document.querySelectorAll(".zone-dot");
    if (!items.length || !dots.length) return;

    var setActive = function (zone, on) {
      items.forEach(function (li) {
        if (li.getAttribute("data-zone") === zone) li.classList.toggle("active", on);
      });
      dots.forEach(function (dot) {
        if (dot.getAttribute("data-zone") === zone) dot.classList.toggle("active", on);
      });
    };

    var bind = function (el) {
      var zone = el.getAttribute("data-zone");
      el.addEventListener("pointerenter", function () {
        setActive(zone, true);
      });
      el.addEventListener("pointerleave", function () {
        setActive(zone, false);
      });
    };

    items.forEach(bind);
    dots.forEach(bind);
  }

  /* =========================================================
     6. Simulador de receita
     Pressupostos de exemplo — calibrar com dados reais.
     ========================================================= */
  var SIM = {
    adr: { t0: 70, t1: 95, t2: 135, t3: 180, t4: 240 },
    zone: { albufeira: 1.0, vilamoura: 1.15, quarteira: 1.05, almancil: 1.2, faro: 0.9, olhao: 0.85 },
    season: {
      low: { occupancy: 0.45, price: 0.75 },
      mid: { occupancy: 0.7, price: 1.0 },
      high: { occupancy: 0.92, price: 1.55 },
    },
    pool: 1.1,
    sea: 1.08,
    commission: 0.2,
    nightsPerMonth: 30.4,
  };

  function initSimulator() {
    var form = document.getElementById("sim-form");
    if (!form) return;

    var out = {
      gross: document.getElementById("sim-gross"),
      nights: document.getElementById("sim-nights"),
      adr: document.getElementById("sim-adr"),
      net: document.getElementById("sim-net"),
    };

    var list = document.getElementById("sim-assumptions-list");
    if (list && !list.children.length) {
      ["sim.a.base", "sim.a.zone", "sim.a.season", "sim.a.extras", "sim.a.commission", "sim.a.month"].forEach(
        function (key) {
          var li = document.createElement("li");
          li.setAttribute("data-i18n", key);
          li.textContent = t(key) || "";
          list.appendChild(li);
        }
      );
    }

    var update = function () {
      var data = new FormData(form);
      var typology = data.get("typology") || "t2";
      var zone = data.get("zone") || "albufeira";
      var season = data.get("season") || "mid";
      var config = SIM.season[season] || SIM.season.mid;

      var adr =
        (SIM.adr[typology] || SIM.adr.t2) *
        (SIM.zone[zone] || 1) *
        config.price *
        (data.get("pool") ? SIM.pool : 1) *
        (data.get("sea") ? SIM.sea : 1);

      var nights = SIM.nightsPerMonth * config.occupancy;
      var gross = adr * nights;

      out.gross.textContent = money(gross);
      out.nights.textContent = number(nights, 0);
      out.adr.textContent = money(adr);
      out.net.textContent = money(gross * (1 - SIM.commission));
    };

    form.addEventListener("change", update);
    document.addEventListener("langchange", update);
    update();
  }

  /* =========================================================
     7. Formulário de contacto
     ========================================================= */
  function initForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var status = document.getElementById("form-status");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      /* TODO: para receber os pedidos automaticamente, substituir o bloco
         mailto abaixo por um POST para o seu endpoint (Formspree, Netlify
         Forms, Basin, ou uma função própria):

         fetch("https://formspree.io/f/XXXXXXX", {
           method: "POST",
           headers: { Accept: "application/json" },
           body: new FormData(form),
         }).then(...)
      */

      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();

      status.classList.remove("error");

      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = t("form.errRequired") || "";
        status.classList.add("error");
        return;
      }
      if (!data.get("consent")) {
        status.textContent = t("form.errConsent") || "";
        status.classList.add("error");
        return;
      }

      var body = [
        t("form.name") + ": " + name,
        t("form.email") + ": " + email,
        t("form.phone") + ": " + (data.get("phone") || "—"),
        t("form.zone") + ": " + (data.get("zone") || "—"),
        t("form.typology") + ": " + (data.get("typology") || "—"),
        "",
        (data.get("message") || "").toString(),
      ].join("\n");

      window.location.href =
        "mailto:" +
        CONTACT_EMAIL +
        "?subject=" +
        encodeURIComponent(t("form.mailSubject") || "") +
        "&body=" +
        encodeURIComponent(body);

      status.textContent = t("form.success") || "";
    });
  }

  /* =========================================================
     8. Hero — cidade costeira em wireframe, reativa ao ponteiro
     ========================================================= */
  function hexToRgb(hex) {
    var value = (hex || "").trim().replace("#", "");
    if (value.length === 3) {
      value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
    }
    var int = parseInt(value, 16);
    if (isNaN(int)) return [34, 224, 208];
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
  }

  function rgba(color, alpha) {
    return "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + alpha + ")";
  }

  function mixColor(a, b, amount) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * amount),
      Math.round(a[1] + (b[1] - a[1]) * amount),
      Math.round(a[2] + (b[2] - a[2]) * amount),
    ];
  }

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  function initHero() {
    var canvas = document.getElementById("hero-canvas");
    var hero = document.querySelector(".hero");
    var hud = document.getElementById("hero-hud");
    if (!canvas || !hero) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var styles = getComputedStyle(document.documentElement);
    var ACCENT = hexToRgb(styles.getPropertyValue("--accent") || "#22e0d0");
    var ACCENT2 = hexToRgb(styles.getPropertyValue("--accent-2") || "#7b5cff");
    var ACCENT3 = hexToRgb(styles.getPropertyValue("--accent-3") || "#ffb86b");
    var WHITE = [255, 255, 255];

    var width = 0;
    var height = 0;
    var focal = 700;
    var originX = 0;
    var originY = 0;

    // Mundo: +z afasta-se da câmara. Terra em y = 0, câmara a camY de altura,
    // a olhar na horizontal — o horizonte cai exatamente em originY.
    var PIVOT_Z = 18;
    var cam = { yaw: 0, pitch: 0, yawTarget: 0, pitchTarget: 0, dist: 4, height: 3.4 };
    var pointer = { x: 0.5, y: 0.5, active: false, overText: false, px: 0, py: 0, last: -1e5 };
    var ripples = [];
    var hovered = -1;
    var running = true;
    var visible = true;
    var clock = 0;

    /* ---------- geometria (seed fixa: a cidade é sempre a mesma) ---------- */
    var ZONE_NAMES = ["Albufeira", "Vilamoura", "Quarteira", "Almancil", "Faro", "Olhão"];
    var TYPE_KEYS = ["hud.villa", "hud.apartment", "hud.townhouse"];
    var SIZES = ["T1", "T2", "T3", "T4"];

    var buildings = [];
    var pools = [];
    var palms = [];

    (function buildCity() {
      var rand = mulberry32(20260907);
      var rows = [
        { z: 26, count: 10, minH: 3.4, maxH: 6.6, spread: 46 },
        { z: 20, count: 8, minH: 2.2, maxH: 4.2, spread: 38 },
        { z: 14.5, count: 7, minH: 1.5, maxH: 3.0, spread: 33 },
        { z: 9.5, count: 6, minH: 1.0, maxH: 2.0, spread: 28 },
      ];

      rows.forEach(function (row, rowIndex) {
        var step = row.spread / row.count;
        for (var i = 0; i < row.count; i++) {
          var x = -row.spread / 2 + step * (i + 0.5) + (rand() - 0.5) * step * 0.35;
          var w = 1.3 + rand() * 1.7;
          var d = 1.2 + rand() * 1.4;
          var h = row.minH + rand() * (row.maxH - row.minH);
          buildings.push({
            x: x,
            z: row.z + (rand() - 0.5) * 1.1,
            w: w,
            d: d,
            h: h,
            row: rowIndex,
            lift: 0,
            floors: h > 2.4 ? Math.floor(h / 0.75) : 0,
            type: TYPE_KEYS[rowIndex === 0 ? 1 : rowIndex === 3 ? 0 : 2],
            zone: ZONE_NAMES[Math.floor(rand() * ZONE_NAMES.length)],
            size: SIZES[Math.floor(rand() * SIZES.length)],
          });

          if (rowIndex === 3 && rand() > 0.3) {
            pools.push({ x: x + (rand() > 0.5 ? 1 : -1) * (w / 2 + 1.1), z: row.z - 2.2, w: 2.2, d: 1.3 });
          }
          if (rowIndex === 3 && rand() > 0.5) {
            palms.push({ x: x + (rand() - 0.5) * 3.4, z: row.z - 4.2, h: 1.7 + rand() * 0.8 });
          }
        }
      });

      // farol, âncora vertical do lado direito
      buildings.push({
        x: 17.5,
        z: 17,
        w: 1.1,
        d: 1.1,
        h: 8.6,
        row: 0,
        lift: 0,
        floors: 6,
        beacon: true,
        type: TYPE_KEYS[2],
        zone: "Olhão",
        size: "T2",
      });
    })();

    /* ---------- projeção ----------
       1. roda a cena em torno do eixo vertical que passa em (0, 0, PIVOT_Z);
       2. leva ao referencial da câmara (altura cam.height, recuada cam.dist);
       3. aplica uma inclinação suave e projeta em perspetiva.            */
    function project(x, y, z) {
      var cy = Math.cos(cam.yaw);
      var sy = Math.sin(cam.yaw);
      var dz = z - PIVOT_Z;
      var rx = x * cy - dz * sy;
      var rz = x * sy + dz * cy;

      var vy = y - cam.height;
      var vz = rz + PIVOT_Z + cam.dist;

      var cp = Math.cos(cam.pitch);
      var sp = Math.sin(cam.pitch);
      var py = vy * cp - vz * sp;
      var pz = vy * sp + vz * cp;

      if (pz < 1.2) return null;

      var f = focal / pz;
      return { x: originX + rx * f, y: originY - py * f, depth: pz, f: f };
    }

    function depthAlpha(depth, base) {
      var a = (base || 1) * (1.5 - depth / 62);
      return Math.max(0.05, Math.min(0.95, a));
    }

    /* ---------- desenho ---------- */
    function strokePath(points, color, alpha, weight, glow) {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (var i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      if (glow) {
        ctx.lineWidth = weight * 3.2;
        ctx.strokeStyle = rgba(color, alpha * 0.16);
        ctx.stroke();
      }
      ctx.lineWidth = weight;
      ctx.strokeStyle = rgba(color, alpha);
      ctx.stroke();
    }

    function waveY(x, z) {
      var y = Math.sin(x * 0.17 + clock * 0.65) * 0.14 + Math.cos(z * 0.21 - clock * 0.45) * 0.1;
      for (var i = 0; i < ripples.length; i++) {
        var age = clock - ripples[i].t;
        if (age < 0 || age > 4.5) continue;
        var d = Math.hypot(x - ripples[i].x, z - ripples[i].z);
        var front = age * 9;
        var falloff = Math.exp(-Math.abs(d - front) * 0.3) * Math.exp(-age * 0.55);
        y += Math.sin((d - front) * 0.85) * falloff * 1.3;
      }
      return y;
    }

    var SEA_NEAR = 33;
    var SEA_FAR = 96;

    function drawSea() {
      var spanX = width < 700 ? 46 : 68;
      var stepX = width < 700 ? 10 : 8;

      // linhas paralelas ao horizonte, mais densas ao longe
      for (var z = SEA_NEAR, gap = 2.8; z <= SEA_FAR; gap *= 1.12, z += gap) {
        var pts = [];
        for (var x = -spanX; x <= spanX; x += 3.5) {
          var p = project(x, waveY(x, z), z);
          if (p) pts.push(p);
        }
        var mixAmount = (z - SEA_NEAR) / (SEA_FAR - SEA_NEAR);
        strokePath(pts, mixColor(ACCENT, ACCENT2, mixAmount), 0.5 - mixAmount * 0.26, 1, false);
      }

      // linhas de fuga
      for (var xl = -spanX; xl <= spanX; xl += stepX) {
        var col = [];
        for (var zz = SEA_NEAR; zz <= SEA_FAR; zz += 4) {
          var q = project(xl, waveY(xl, zz), zz);
          if (q) col.push(q);
        }
        strokePath(col, ACCENT, 0.14, 1, false);
      }
    }

    // grelha de passeio, em primeiro plano
    function drawGround() {
      var spanX = 34;
      for (var z = 1.5; z <= 8.5; z += 1.75) {
        var pts = [];
        for (var x = -spanX; x <= spanX; x += 4) {
          var p = project(x, 0, z);
          if (p) pts.push(p);
        }
        strokePath(pts, ACCENT, 0.1, 1, false);
      }
      for (var xl = -spanX; xl <= spanX; xl += 4) {
        var a = project(xl, 0, 1.5);
        var b = project(xl, 0, 8.5);
        if (a && b) strokePath([a, b], ACCENT, 0.08, 1, false);
      }
    }

    function drawSun() {
      var cxw = 8;
      var cyw = 3.4;
      var czw = 106;
      var radius = 15;
      var arc = [];
      for (var a = 0; a <= Math.PI; a += Math.PI / 46) {
        var p = project(cxw + Math.cos(a) * radius, cyw + Math.sin(a) * radius * 0.92, czw);
        if (p) arc.push(p);
      }
      strokePath(arc, ACCENT3, 0.5, 1.5, true);

      for (var i = 1; i <= 5; i++) {
        var y = cyw + (radius * 0.92 * i) / 6.5;
        var halfAngle = Math.acos(Math.min(1, (y - cyw) / (radius * 0.92)));
        var dx = Math.sin(halfAngle) * radius;
        var left = project(cxw - dx, y, czw);
        var right = project(cxw + dx, y, czw);
        if (left && right) strokePath([left, right], ACCENT3, 0.16 + i * 0.03, 1, false);
      }

      var hl = project(-140, 0, czw - 2);
      var hr = project(140, 0, czw - 2);
      if (hl && hr) strokePath([hl, hr], mixColor(ACCENT, WHITE, 0.35), 0.34, 1.2, true);
    }

    function boxCorners(b) {
      var x0 = b.x - b.w / 2;
      var x1 = b.x + b.w / 2;
      var z0 = b.z - b.d / 2;
      var z1 = b.z + b.d / 2;
      var y0 = b.lift;
      var y1 = b.h + b.lift;
      return [
        project(x0, y0, z0),
        project(x1, y0, z0),
        project(x1, y0, z1),
        project(x0, y0, z1),
        project(x0, y1, z0),
        project(x1, y1, z0),
        project(x1, y1, z1),
        project(x0, y1, z1),
      ];
    }

    var EDGES = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];

    function drawBuilding(b, index) {
      var corners = boxCorners(b);
      if (corners.some(function (c) { return !c; })) return;

      var isHot = index === hovered;
      var heightMix = Math.min(1, b.h / 6);
      var color = isHot ? mixColor(WHITE, ACCENT, 0.35) : mixColor(ACCENT, ACCENT2, heightMix);
      var depth = corners[0].depth;
      var alpha = depthAlpha(depth, isHot ? 1.2 : 0.85);

      EDGES.forEach(function (edge) {
        strokePath([corners[edge[0]], corners[edge[1]]], color, alpha, isHot ? 1.6 : 1, true);
      });

      // linhas de piso na fachada virada à câmara
      if (b.floors > 1) {
        for (var i = 1; i < b.floors; i++) {
          var y = b.lift + (b.h * i) / b.floors;
          var l = project(b.x - b.w / 2, y, b.z + b.d / 2);
          var r = project(b.x + b.w / 2, y, b.z + b.d / 2);
          if (l && r) strokePath([l, r], color, alpha * 0.28, 1, false);
        }
      }

      // luz do farol
      if (b.beacon) {
        var top = project(b.x, b.h + b.lift + 0.5, b.z);
        if (top) {
          var pulse = 0.45 + Math.sin(clock * 2.2) * 0.35;
          ctx.beginPath();
          ctx.arc(top.x, top.y, 3.4, 0, Math.PI * 2);
          ctx.fillStyle = rgba(ACCENT3, Math.max(0.15, pulse));
          ctx.fill();
          ctx.beginPath();
          ctx.arc(top.x, top.y, 12, 0, Math.PI * 2);
          ctx.fillStyle = rgba(ACCENT3, pulse * 0.12);
          ctx.fill();
        }
      }
    }

    function drawPools() {
      pools.forEach(function (p) {
        var c = [
          project(p.x - p.w / 2, 0.02, p.z - p.d / 2),
          project(p.x + p.w / 2, 0.02, p.z - p.d / 2),
          project(p.x + p.w / 2, 0.02, p.z + p.d / 2),
          project(p.x - p.w / 2, 0.02, p.z + p.d / 2),
        ];
        if (c.some(function (q) { return !q; })) return;
        ctx.beginPath();
        ctx.moveTo(c[0].x, c[0].y);
        for (var i = 1; i < 4; i++) ctx.lineTo(c[i].x, c[i].y);
        ctx.closePath();
        ctx.fillStyle = rgba(ACCENT, 0.12 + Math.sin(clock * 1.5 + p.x) * 0.03);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(ACCENT, 0.5);
        ctx.stroke();
      });
    }

    function drawPalms() {
      palms.forEach(function (palm) {
        var base = project(palm.x, 0, palm.z);
        var top = project(palm.x, palm.h, palm.z);
        if (!base || !top) return;
        strokePath([base, top], mixColor(ACCENT, ACCENT3, 0.4), 0.45, 1, false);
        for (var i = 0; i < 5; i++) {
          var angle = (Math.PI / 5) * i + Math.sin(clock * 0.6 + palm.x) * 0.06;
          var tip = project(
            palm.x + Math.cos(angle) * 0.75,
            palm.h + Math.sin(angle) * 0.42 - 0.12,
            palm.z + Math.sin(angle) * 0.3
          );
          if (tip) strokePath([top, tip], mixColor(ACCENT, ACCENT3, 0.4), 0.35, 1, false);
        }
      });
    }

    var motes = [];
    (function seedMotes() {
      var rand = mulberry32(4711);
      for (var i = 0; i < 46; i++) {
        motes.push({ x: (rand() - 0.5) * 52, y: rand() * 11, z: 6 + rand() * 44, speed: 0.25 + rand() * 0.5 });
      }
    })();

    function drawMotes(delta) {
      motes.forEach(function (m) {
        if (!reduceMotion) {
          m.y += m.speed * delta;
          if (m.y > 13) m.y = 0;
        }
        var p = project(m.x, m.y, m.z);
        if (!p) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.6, p.f * 0.006), 0, Math.PI * 2);
        ctx.fillStyle = rgba(ACCENT, depthAlpha(p.depth, 0.5));
        ctx.fill();
      });
    }

    function updateHover() {
      if (!pointer.active || pointer.overText || hud === null) {
        if (hovered !== -1) {
          hovered = -1;
          if (hud) hud.classList.remove("visible");
        }
        return;
      }

      var best = -1;
      var bestDist = 80;
      for (var i = 0; i < buildings.length; i++) {
        var b = buildings[i];
        var p = project(b.x, b.h * 0.6, b.z);
        if (!p) continue;
        var d = Math.hypot(p.x - pointer.px, p.y - pointer.py);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }

      hovered = best;

      if (best === -1) {
        hud.classList.remove("visible");
        return;
      }

      var target = buildings[best];
      var anchor = project(target.x, target.h + target.lift + 0.4, target.z);
      if (!anchor) {
        hud.classList.remove("visible");
        return;
      }
      hud.textContent = [t(target.type) || "", target.zone.toUpperCase(), target.size].join(" · ");
      hud.style.left = anchor.x + "px";
      hud.style.top = anchor.y + "px";
      hud.classList.add("visible");
    }

    function frame(delta) {
      ctx.clearRect(0, 0, width, height);

      cam.yaw += (cam.yawTarget - cam.yaw) * Math.min(1, delta * 2.4);
      cam.pitch += (cam.pitchTarget - cam.pitch) * Math.min(1, delta * 2.4);

      drawSun();
      drawSea();
      drawGround();
      drawMotes(delta);
      drawPools();
      drawPalms();

      buildings.forEach(function (b, i) {
        var targetLift = i === hovered ? 0.32 : 0;
        b.lift += (targetLift - b.lift) * Math.min(1, delta * 6);
      });

      var order = buildings
        .map(function (b, i) {
          return { b: b, i: i, depth: -(b.z * Math.cos(cam.yaw) + b.x * Math.sin(cam.yaw)) };
        })
        .sort(function (a, b) {
          return a.depth - b.depth;
        });

      order.forEach(function (entry) {
        drawBuilding(entry.b, entry.i);
      });
    }

    /* ---------- dimensionamento ---------- */
    function resize() {
      var rect = hero.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      var dpr = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.75 : 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      focal = Math.max(430, Math.min(width * 0.62, 900));
      originX = width * (width < 900 ? 0.5 : 0.63);
      originY = height * (width < 880 ? 0.66 : height < 700 ? 0.45 : 0.49);
      cam.dist = width < 880 ? 30 : 16;
    }

    /* ---------- interação ---------- */
    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      pointer.px = event.clientX - rect.left;
      pointer.py = event.clientY - rect.top;
      pointer.x = pointer.px / rect.width;
      pointer.y = pointer.py / rect.height;
      pointer.active = true;
      pointer.last = clock;
      // sobre o texto do hero o rótulo estorva a leitura
      pointer.overText = !!(event.target.closest && event.target.closest(".hero-inner h1, .hero-inner p, .hero-inner ul, .hero-inner .btn"));
      if (!reduceMotion) {
        cam.yawTarget = (pointer.x - 0.5) * 0.5;
        cam.pitchTarget = (0.5 - pointer.y) * 0.05;
      }
    });

    hero.addEventListener("pointerleave", function () {
      pointer.active = false;
      if (hud) hud.classList.remove("visible");
    });

    hero.addEventListener("pointerdown", function (event) {
      if (reduceMotion) return;
      if (event.target.closest("a, button, input, label")) return;
      var rect = hero.getBoundingClientRect();
      var nx = (event.clientX - rect.left) / rect.width;
      ripples.push({ x: (nx - 0.5) * 48, z: 44, t: clock });
      if (ripples.length > 6) ripples.shift();
    });

    /* ---------- ciclo de animação ---------- */
    var lastTime = performance.now();

    function loop(now) {
      if (!running) return;
      var delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      clock += delta;

      // órbita lenta quando o ponteiro está ausente há algum tempo
      if (!pointer.active || clock - pointer.last > 2.5) {
        cam.yawTarget = Math.sin(clock * 0.16) * 0.26;
        cam.pitchTarget = Math.sin(clock * 0.11) * 0.018;
      }

      updateHover();
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

    resize();

    if (reduceMotion) {
      running = false;
      frame(0); // um único fotograma estático
    } else {
      requestAnimationFrame(loop);
    }

    if ("ResizeObserver" in window) {
      new ResizeObserver(function () {
        resize();
        if (reduceMotion) frame(0);
      }).observe(hero);
    } else {
      window.addEventListener("resize", function () {
        resize();
        if (reduceMotion) frame(0);
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          visible = entries[0].isIntersecting;
          if (visible && !document.hidden) start();
          else stop();
        },
        { threshold: 0.01 }
      ).observe(hero);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (visible) start();
    });

    document.addEventListener("langchange", function () {
      if (hovered !== -1) updateHover();
    });
  }

  /* =========================================================
     Arranque
     ========================================================= */
  function init() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    initLang();
    initNav();
    initReveals();
    initCounters();
    initMicroInteractions();
    initZones();
    initSimulator();
    initForm();
    initHero();

    applyLanguage(detectLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
