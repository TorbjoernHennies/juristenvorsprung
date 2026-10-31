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
