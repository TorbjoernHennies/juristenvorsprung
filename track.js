// Gibt Herkunft aus der Adresse an alle Termin-Links weiter.
// Beispiel Instagram: pkv.html?quelle=instagram&beitrag=reel-pkv-1
// Das Formular auf termin.html liest quelle und beitrag selbst aus.
(function () {
  "use strict";
  var p = new URLSearchParams(window.location.search);
  var quelle = p.get("quelle") || p.get("utm_source");
  var beitrag = p.get("beitrag") || p.get("utm_content");
  if (!quelle && !beitrag) return;

  function tag(a) {
    var u = new URL(a.getAttribute("href"), window.location.href);
    if (quelle) u.searchParams.set("quelle", quelle);
    if (beitrag) u.searchParams.set("beitrag", beitrag);
    a.setAttribute("href", "termin.html" + u.search);
  }
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="termin.html"]'), tag);
  // auch Links, die erst später entstehen (z. B. im Check-Ergebnis)
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="termin.html"]');
    if (a) tag(a);
  }, true);
})();
