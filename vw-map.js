// Klickbare Deutschlandkarte der 16 Versorgungswerke (Umrisse aus vw-geo.js, Daten aus vw-data.js).
// VWMap(element, onPick) zeichnet die Karte und gibt eine Funktion zurück, die ein Land markiert.
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var CITY = { "Berlin": 1, "Hamburg": 1, "Bremen": 1 };

  window.VWMap = function (el, onPick) {
    var geo = window.VW_GEO, data = window.VW_DATA || [];
    if (!geo || !el) return function () {};
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "-6 -6 " + (geo.w + 12) + " " + (geo.h + 12));
    svg.setAttribute("class", "vw-svg");
    svg.setAttribute("role", "group");
    svg.setAttribute("aria-label", "Karte der Versorgungswerke nach Bundesland");
    el.appendChild(svg);

    var shapes = {};
    var names = data.map(function (d) { return d.n; });
    // Stadtstaaten zuletzt zeichnen, damit sie über den Flächenländern liegen
    var order = names.filter(function (n) { return !CITY[n]; }).concat(names.filter(function (n) { return CITY[n]; }));

    order.forEach(function (n) {
      var i = names.indexOf(n);
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", geo.paths[n] || "");
      p.setAttribute("class", "vw-land" + (CITY[n] ? " vw-city" : ""));
      p.setAttribute("tabindex", "0");
      p.setAttribute("role", "button");
      p.setAttribute("aria-label", "Versorgungswerk " + n);
      var t = document.createElementNS(NS, "title");
      t.textContent = n;
      p.appendChild(t);
      p.addEventListener("click", function () { onPick(String(i)); });
      p.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(String(i)); }
      });
      svg.appendChild(p);
      shapes[i] = [p];
    });

    // Stadtstaaten bekommen einen Punkt, damit man sie auch auf dem Handy trifft
    Object.keys(CITY).forEach(function (n) {
      var i = names.indexOf(n);
      if (i < 0) return;
      var b = shapes[i][0].getBBox();
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", b.x + b.width / 2);
      c.setAttribute("cy", b.y + b.height / 2);
      c.setAttribute("r", 9);
      c.setAttribute("class", "vw-dot");
      c.setAttribute("aria-hidden", "true");
      c.addEventListener("click", function () { onPick(String(i)); });
      svg.appendChild(c);
      shapes[i].push(c);
    });

    return function mark(i) {
      Object.keys(shapes).forEach(function (k) {
        shapes[k].forEach(function (s) { s.classList.toggle("on", String(k) === String(i)); });
      });
    };
  };
})();
