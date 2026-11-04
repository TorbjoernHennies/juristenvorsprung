// Versorgungswerk-Check: zeigt die wichtigsten Satzungswerte je Versorgungswerk (Daten aus vw-data.js).
(function () {
  "use strict";
  var DATA = window.VW_DATA || [];
  var select = document.getElementById("vw-select");
  var result = document.getElementById("vw-result");
  if (!select || !result) return;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  DATA.forEach(function (d, i) {
    var o = document.createElement("option");
    o.value = String(i);
    o.textContent = d.n;
    select.appendChild(o);
  });

  var ROWS = [
    ["Wartezeit bis zur BU-Rente", "wz"],
    ["Zulassung abgeben?", "zul"],
    ["Zurechnungszeit bis Alter", "zur"],
    ["Beitrag", "beitrag"],
    ["Rabatt für Berufsanfänger", "rabatt"],
    ["Zusatzbeiträge", "zusatz"],
    ["Altersrente ab", "alter"],
    ["Besonderheiten", "bes"]
  ];

  function render(i) {
    if (i === "") { result.className = "finder-result"; result.innerHTML = ""; mark(""); return; }
    var d = DATA[Number(i)];
    var h = "<h3>" + esc(d.n) + ": die wichtigsten Regeln</h3><dl class=\"vw-facts\">";
    ROWS.forEach(function (r) { if (d[r[1]]) h += "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(d[r[1]]) + "</dd></div>"; });
    h += "</dl><p class=\"fine-note\">Stand Oktober 2026. Wir haben die Regeln aus der Satzung deines Versorgungswerks zusammengefasst. Satzungen ändern sich, maßgeblich ist immer der aktuelle Wortlaut. Was das für deine Absicherung heißt, rechnen wir im Erstgespräch durch.</p>" +
         "<p style=\"margin-top:1rem\"><a class=\"btn btn-navy\" href=\"termin.html?thema=BU_VW&amp;quelle=vw-check\">Für dich durchrechnen</a></p>";
    result.innerHTML = h;
    result.className = "finder-result show";
    mark(i);
  }

  var mark = window.VWMap ? window.VWMap(document.getElementById("vw-map"), function (i) {
    select.value = i;
    render(i);
    var box = document.querySelector(".vw-panel");
    if (box && window.innerWidth < 1000) box.scrollIntoView({ block: "start", behavior: "smooth" });
  }) : function () {};

  select.addEventListener("change", function () { render(select.value); });

  // Vorauswahl über ?land= (Link von der Mini-Karte auf der BU-Seite)
  var pre = new URLSearchParams(window.location.search).get("land");
  if (pre !== null && DATA[Number(pre)]) { select.value = pre; render(pre); }
})();
