/* =========================================================
   HD Properties — comportamento da página
   i18n PT/EN, navegação, contadores, simulador, formulário e
   arranque da maquete 3D (hero3d.js).
   ========================================================= */

(function () {
  "use strict";

  /* ---------- TODO: substituir pelos dados reais da HD Properties ---------- */
  var CONTACT_EMAIL = "info@hdproperties.pt";
  /* ------------------------------------------------------------------------ */

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LANG_KEY = "hdp-lang";
  var currentLang = "pt";
  var hero = null;

  /* =========================================================
     i18n
     ========================================================= */
  function dict(lang) {
    return (window.I18N && window.I18N[lang]) || {};
  }

  function t(key, lang) {
    var d = dict(lang || currentLang);
    if (Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    var base = dict("pt");
    return Object.prototype.hasOwnProperty.call(base, key) ? base[key] : null;
  }

  function detectLang() {
    var stored = null;
    try {
      stored = localStorage.getItem(LANG_KEY);
    } catch (e) {
      /* sem localStorage (janela privada): segue para a deteção */
    }
    if (stored === "pt" || stored === "en") return stored;
    return (navigator.language || "pt").toLowerCase().indexOf("pt") === 0 ? "pt" : "en";
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

    // em ecrãs táteis não há cursor nem sol a seguir: a dica muda
    var hintEl = document.querySelector(".hero-hint");
    if (hintEl && window.matchMedia("(hover: none)").matches) {
      var touch = t("hero.hintTouch", lang);
      if (touch !== null) hintEl.textContent = touch;
    }

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* a escolha vale só para esta visita */
    }

    if (hero && hero.refreshTag) hero.refreshTag();
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
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
     Navegação
     ========================================================= */
  function initNav() {
    var header = document.getElementById("site-header");
    var nav = document.getElementById("site-nav");
    var toggle = document.getElementById("nav-toggle");
    if (!header || !nav || !toggle) return;

    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

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
     Entrada em cena e contadores
     ========================================================= */
  function initRise() {
    var items = document.querySelectorAll(".rise");
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
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    items.forEach(function (el) {
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
      var step = function (now) {
        var p = Math.min((now - start) / 1200, 1);
        render(el, target * (1 - Math.pow(1 - p, 3)));
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
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        io.observe(el);
      });
    } else {
      counters.forEach(run);
    }

    document.addEventListener("langchange", function () {
      counters.forEach(function (el) {
        if (el.dataset.counted === "1") render(el, parseFloat(el.getAttribute("data-count-to")));
      });
    });
  }

  /* =========================================================
     Zonas — lista e mapa em espelho
     ========================================================= */
  function initZones() {
    var items = document.querySelectorAll(".zone-list li");
    var pins = document.querySelectorAll(".pin");
    if (!items.length || !pins.length) return;

    var setActive = function (zone, on) {
      items.forEach(function (li) {
        if (li.getAttribute("data-zone") === zone) li.classList.toggle("active", on);
      });
      pins.forEach(function (pin) {
        if (pin.getAttribute("data-zone") === zone) pin.classList.toggle("active", on);
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
    pins.forEach(bind);
  }

  /* =========================================================
     Simulador de receita
     Valores de exemplo — calibrar com dados reais (CONTEUDO.md).
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
      var season = SIM.season[data.get("season")] || SIM.season.mid;

      var adr =
        (SIM.adr[typology] || SIM.adr.t2) *
        (SIM.zone[zone] || 1) *
        season.price *
        (data.get("pool") ? SIM.pool : 1) *
        (data.get("sea") ? SIM.sea : 1);

      var nights = SIM.nightsPerMonth * season.occupancy;
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
     Formulário
     ========================================================= */
  function initForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var status = document.getElementById("form-status");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      /* TODO: para receber os pedidos automaticamente, troque o bloco
         mailto abaixo por um POST para o seu endpoint, por exemplo:

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
     Arranque
     ========================================================= */
  function init() {
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLanguage(btn.getAttribute("data-lang"));
      });
    });

    initNav();
    initRise();
    initCounters();
    initZones();
    initSimulator();
    initForm();

    if (window.HDHero) {
      hero = window.HDHero.init({ translate: t });
    }

    applyLanguage(detectLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
