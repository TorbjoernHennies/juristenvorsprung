// Förder-Rechner Altersvorsorgedepot. Alles läuft im Browser, nichts wird gesendet.
// Regeln (Stand Oktober 2026, vor Livegang gegen Gesetzestext prüfen):
// Grundzulage 50 % auf die ersten 360 € und 25 % auf weitere Beiträge bis 1.800 € im Jahr,
// Kinderzulage 100 % des Eigenbeitrags, höchstens 300 € je Kind, Bonus 200 € einmalig unter 25,
// Mindestbeitrag 120 € im Jahr. Die Steuerersparnis ist eine grobe Schätzung (Tarif 2026, pauschale Abzüge).
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  if (!$("r-alter")) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kids = 0;

  function eur(n) { return Math.round(n).toLocaleString("de-DE") + " €"; }
  function pct(n) { return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " %"; }

  // Grenzsteuersatz nach Einkommensteuertarif 2026 (vereinfacht, Alleinstehende)
  function grenzsatz(zve) {
    if (zve <= 12348) return 0;
    if (zve <= 17799) return (14 + (zve - 12348) / (17799 - 12348) * 10) / 100;
    if (zve <= 69878) return (24 + (zve - 17799) / (69878 - 17799) * 18) / 100;
    if (zve <= 277825) return 0.42;
    return 0.45;
  }

  function tween(node, to, fmt) {
    var from = parseFloat(node.getAttribute("data-v") || "0");
    node.setAttribute("data-v", String(to));
    if (node._fin) clearTimeout(node._fin);
    if (reduce || from === to) { node.textContent = fmt(to); return; }
    var t0 = null, dur = 450;
    if (node._raf) cancelAnimationFrame(node._raf);
    node._fin = setTimeout(function () { node.textContent = fmt(to); }, dur + 80); // Sicherheitsnetz, falls der Tab im Hintergrund ist
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      node.textContent = fmt(from + (to - from) * e);
      if (p < 1) node._raf = requestAnimationFrame(step);
    }
    node._raf = requestAnimationFrame(step);
  }

  function update() {
    var alter = Number($("r-alter").value);
    var brutto = Number($("r-brutto").value);
    var monat = Number($("r-monat").value);
    var eig = monat * 12;
    var foerd = Math.min(eig, 1800);
    var ok = eig >= 120;
    var grund = ok ? 0.5 * Math.min(foerd, 360) + 0.25 * Math.max(0, foerd - 360) : 0;
    var kind = ok ? kids * Math.min(eig, 300) : 0;
    var bonus = ok && alter < 25 ? 200 : 0;
    var zul = grund + kind;
    var erstes = zul + bonus;
    var jahre = Math.max(0, 67 - alter);
    var ges = ok ? zul * jahre + bonus : 0;
    var zve = Math.max(0, 0.8 * brutto - 1230);
    var rate = grenzsatz(zve);
    var steuer = ok ? Math.max(0, rate * (foerd + zul) - zul) : 0;
    var quote = ok && eig + erstes > 0 ? erstes / (eig + erstes) * 100 : 0;

    $("o-alter").textContent = alter;
    $("o-brutto").textContent = eur(brutto);
    $("o-monat").textContent = eur(monat);
    $("k-out").textContent = kids;

    tween($("c-zul"), erstes, function (v) { return Math.round(v).toLocaleString("de-DE"); });
    tween($("c-zul2"), erstes, eur);
    tween($("c-grund"), grund, eur);
    tween($("c-kind"), kind, eur);
    tween($("c-bonus"), bonus, eur);
    tween($("c-ges"), ges, eur);
    tween($("c-steuer"), steuer, eur);
    tween($("c-quote"), quote, pct);
    $("c-eig").textContent = eur(eig);
    $("row-bonus").style.display = alter < 25 ? "" : "none";

    var sum = eig + erstes;
    $("b-eig").style.width = sum ? (eig / sum * 100) + "%" : "100%";
    $("b-zul").style.width = sum ? (erstes / sum * 100) + "%" : "0%";

    var note = "";
    if (!ok) note = "Unter 120 € im Jahr (10 € im Monat) gibt es keine Zulage.";
    else if (eig > 1800) note = "Über 1.800 € im Jahr wird nicht weiter gefördert. Einzahlen kannst du mehr, bis 6.840 € im Jahr.";
    else if (kids > 0 && eig < 300) note = "Für die volle Kinderzulage brauchst du 300 € Eigenbeitrag im Jahr, also 25 € im Monat.";
    else note = "Steuervorteil geschätzt mit einem Grenzsteuersatz von rund " + Math.round(rate * 100) + " %.";
    $("c-note").textContent = note;
  }

  ["r-alter", "r-brutto", "r-monat"].forEach(function (id) { $(id).addEventListener("input", update); });
  $("k-minus").addEventListener("click", function () { kids = Math.max(0, kids - 1); update(); });
  $("k-plus").addEventListener("click", function () { kids = Math.min(6, kids + 1); update(); });
  update();
})();
