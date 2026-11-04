// Rentenlückenrechner (Altersvorsorge-Seite). Alles läuft im Browser, nichts wird gesendet.
// Rechnet mit nominalen Werten und rechnet das Ergebnis in heutige Kaufkraft zurück.
// Annahmen und Grenzen stehen in den Fußnoten am Seitenende (#fussnoten).
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  if (!$("g-netto")) return;
  var YEAR = new Date().getFullYear();

  function eur(n) { return Math.round(n).toLocaleString("de-DE") + " €"; }
  function num(id) { return Number($(id).value); }
  function pct(v) { return v.toLocaleString("de-DE", { maximumFractionDigits: 2 }) + " %"; }

  function update() {
    var netto = num("g-netto"), quote = num("g-quote") / 100, gj = num("g-geb"), ra = num("g-alter"), vw = num("g-vw");
    var inf = num("g-inf") / 100, abz = num("g-abz") / 100, rIn = num("g-rin") / 100, rOut = num("g-rout") / 100;
    var dyn = num("g-dyn") / 100, bis = num("g-bis"), verm = num("g-verm");

    $("o-netto").textContent = eur(netto);
    $("o-quote").textContent = Math.round(quote * 100) + " % (" + eur(netto * quote) + ")";
    $("o-geb").textContent = gj;
    $("o-alter").textContent = ra + " Jahren";
    $("o-vw").textContent = eur(vw);
    $("o-inf").textContent = pct(inf * 100);
    $("o-abz").textContent = Math.round(abz * 100) + " %";
    $("o-rin").textContent = pct(rIn * 100);
    $("o-rout").textContent = pct(rOut * 100);
    $("o-dyn").textContent = pct(dyn * 100);
    $("o-bis").textContent = bis + " Jahre";
    $("o-verm").textContent = eur(verm);

    var jahre = Math.max(1, gj + ra - YEAR);
    var kauf = Math.pow(1 + inf, jahre);
    var want = netto * quote;
    var vwNom = vw * Math.pow(1 + dyn, jahre) * (1 - abz);
    var gapNom = Math.max(0, want * kauf - vwNom);
    var gapReal = gapNom / kauf;
    var vwReal = vwNom / kauf;

    // Kapital, das die Lücke bis zum Planungsalter deckt (Entnahme steigt mit der Inflation)
    var n = Math.max(1, bis - ra) * 12;
    var rm = Math.pow(1 + rOut, 1 / 12) - 1, gm = Math.pow(1 + inf, 1 / 12) - 1;
    var kapital = Math.abs(rm - gm) < 1e-9 ? gapNom * n / (1 + rm) : gapNom * (1 - Math.pow((1 + gm) / (1 + rm), n)) / (rm - gm);
    var vorhanden = verm * Math.pow(1 + rIn, jahre);
    var fehlt = Math.max(0, kapital - vorhanden);
    var im = Math.pow(1 + rIn, 1 / 12) - 1, N = jahre * 12;
    var rate = fehlt <= 0 ? 0 : (im > 0 ? fehlt * im / (Math.pow(1 + im, N) - 1) : fehlt / N);

    $("c-gap").textContent = Math.round(gapReal).toLocaleString("de-DE");
    $("c-year").textContent = "Rentenbeginn " + (YEAR + jahre) + ", in " + jahre + " Jahren";
    $("c-kap").textContent = eur(kapital);
    $("c-rate").textContent = eur(rate);
    $("c-vwreal").textContent = eur(vwReal);

    var max = Math.max(want, vwReal, 1);
    $("b-want").style.width = (want / max * 100) + "%";
    $("b-vw").style.width = (Math.min(vwReal, want) / max * 100) + "%";
    $("b-gap").style.width = (gapReal / max * 100) + "%";
    $("l-want").textContent = eur(want);
    $("l-vw").textContent = eur(vwReal);
    $("l-gap").textContent = eur(gapReal);

    $("c-note").textContent = gapReal < 1
      ? "Nach diesen Annahmen trägt dein Versorgungswerk deinen Wunsch. Ein Blick lohnt trotzdem: auf Berufsunfähigkeit, Hinterbliebene und Steuern."
      : "Deine Rente aus dem Versorgungswerk entspricht nach Abzügen heute rund " + eur(vwReal) + " im Monat. Den Rest musst du selbst aufbauen.";
  }

  var ids = ["g-netto", "g-quote", "g-geb", "g-alter", "g-vw", "g-inf", "g-abz", "g-rin", "g-rout", "g-dyn", "g-bis", "g-verm"];
  ids.forEach(function (id) { $(id).addEventListener("input", update); });
  update();
})();
