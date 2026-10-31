// Kopfzeile, Aufklappmenüs und schwebender Termin-Button.
(function () {
  "use strict";
  var header = document.querySelector(".site-header");
  var floatCta = document.querySelector(".float-cta");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (floatCta) {
      var nearEnd = window.innerHeight + y > document.documentElement.scrollHeight - 480;
      floatCta.classList.toggle("show", y > 520 && !nearEnd);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var groups = document.querySelectorAll(".nav-group");
  function closeAll(except) {
    Array.prototype.forEach.call(groups, function (g) {
      if (g === except) return;
      g.classList.remove("open");
      var b = g.querySelector(".nav-parent");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  Array.prototype.forEach.call(groups, function (g) {
    var b = g.querySelector(".nav-parent");
    if (!b) return;
    b.addEventListener("click", function () {
      var open = !g.classList.contains("open");
      closeAll(g);
      g.classList.toggle("open", open);
      b.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest(".nav-group")) closeAll(null);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAll(null);
      if (document.activeElement && document.activeElement.closest && document.activeElement.closest(".nav-group")) document.activeElement.blur();
    }
  });
})();

// Bewegung beim Scrollen, mitlaufendes Inhaltsverzeichnis, Ring-Diagramm.
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window)) return;

  if (!reduce) {
    var sel = ".sec-head, .cards > *, .pledge > div, .steps li, .checklist details, .station, .vs-col, .cmp-wrap, " +
      ".callout, .faq details, .example, .variant, .myth, .duel, .donut-card, .teaser-ex, .recog > div, .calc, .person, .cta-card, .split > div";
    var els = document.querySelectorAll(sel);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(els, function (el) {
      if (el.closest(".hero, .page-hero") || el.closest(".rv")) return;
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty("--d", Math.min(i, 5) * 0.07 + "s");
      el.classList.add("rv");
      io.observe(el);
    });
  }

  // Ring-Diagramm füllt sich, sobald es sichtbar ist
  var donut = document.querySelector(".donut");
  if (donut) {
    var segs = donut.querySelectorAll(".seg");
    var show = function () {
      Array.prototype.forEach.call(segs, function (s) { s.setAttribute("stroke-dasharray", s.getAttribute("data-len") + " 1000"); });
    };
    if (reduce) show();
    else new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { show(); o.disconnect(); } }, { threshold: 0.4 }).observe(donut);
  }

  // Inhaltsverzeichnis: aktuellen Abschnitt hervorheben
  var links = document.querySelectorAll(".toc-bar .toc a[href^='#']");
  if (links.length) {
    var map = {};
    Array.prototype.forEach.call(links, function (a) {
      var t = document.getElementById(a.getAttribute("href").slice(1));
      if (t) map[t.id] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Array.prototype.forEach.call(links, function (a) { a.classList.remove("active"); });
        var a = map[e.target.id];
        if (a) {
          a.classList.add("active");
          var bar = a.parentNode;
          bar.scrollTo({ left: a.offsetLeft - 24, behavior: reduce ? "auto" : "smooth" });
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }
})();

// Wechselndes Wort in der Überschrift und hochzählende Zahlen in der Zahlenleiste.
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var rotor = document.querySelector(".rotor[data-words]");
  if (rotor && !reduce) {
    var words = rotor.getAttribute("data-words").split("|"), k = 0;
    setInterval(function () {
      if (document.hidden) return;
      rotor.classList.add("out");
      setTimeout(function () {
        k = (k + 1) % words.length;
        rotor.textContent = words[k];
        rotor.classList.remove("out");
        rotor.classList.add("in-start");
        void rotor.offsetWidth;
        rotor.classList.remove("in-start");
      }, 350);
    }, 2800);
  }

  // Nur reine Zahlen bis 999 zählen hoch („16“, „0 bis 60“ bleibt stehen, Jahreszahlen auch)
  if (reduce || !("IntersectionObserver" in window)) return;
  var nums = Array.prototype.filter.call(document.querySelectorAll(".statbar strong"), function (el) {
    var m = el.textContent.trim().match(/^(\d{1,3})(\s.*)?$/);
    return m && Number(m[1]) > 1;
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var el = e.target, m = el.textContent.trim().match(/^(\d{1,3})(.*)$/), to = Number(m[1]), rest = m[2], t0 = null;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / 1100);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + rest;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  nums.forEach(function (el) { io.observe(el); });
})();
