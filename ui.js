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
