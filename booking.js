// Gibt Herkunft (quelle, beitrag) und Thema an den Calendly-Link weiter (utm-Parameter, von Calendly gespeichert).
(function () {
  "use strict";
  var a = document.getElementById("booking-link");
  if (!a) return;
  var p = new URLSearchParams(window.location.search);
  var u = new URL(a.href);
  u.searchParams.set("utm_source", p.get("quelle") || p.get("utm_source") || "website");
  var beitrag = p.get("beitrag") || p.get("utm_content");
  if (beitrag) u.searchParams.set("utm_content", beitrag);
  var thema = p.get("thema");
  if (thema) u.searchParams.set("utm_campaign", thema);
  a.href = u.toString();
})();
