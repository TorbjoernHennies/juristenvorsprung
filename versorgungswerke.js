// Versorgungswerk-Check: zeigt Fragen, die man für das eigene Versorgungswerk klären sollte, keine Werte.
// Die konkreten Daten (Wartezeit, Zulassungsregel, Beitrag, Rabatt) liegen in vw-data.js und werden hier bewusst nicht angezeigt.
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

  var QUESTIONS = [
    ["Berufsunfähigkeit", "Ab wann zahlt dein Versorgungswerk bei Berufsunfähigkeit, und was passiert bis dahin?"],
    ["Zulassung", "Musst du für die BU-Rente die Zulassung abgeben, oder reicht es, die Tätigkeit einzustellen?"],
    ["Definition", "Wann giltst du nach der Satzung als berufsunfähig, und wie viel Tätigkeit bleibt dir dabei erlaubt?"],
    ["Rabatt", "Gibt es einen Beitragsrabatt für Berufsanfänger, und musst du ihn beantragen?"],
    ["Beitrag", "Welchen Beitrag zahlst du, und was sind Zusatzbeiträge in deinem Fall wert?"],
    ["Alter", "Ab wann bekommst du Altersrente, und was heißt das für deine Planung?"]
  ];

  function render(i) {
    if (i === "") { result.className = "finder-result"; result.innerHTML = ""; return; }
    var d = DATA[Number(i)];
    var h = "<h3>Das solltest du für dein Versorgungswerk (" + esc(d.n) + ") klären</h3><ul class=\"qlist\">";
    QUESTIONS.forEach(function (q) { h += "<li><span class=\"tag tag-gold\">" + esc(q[0]) + "</span><p>" + esc(q[1]) + "</p></li>"; });
    h += "</ul><p>Wir haben deine Satzung ausgewertet. Die Antworten gehen wir im Gespräch mit dir durch.</p>" +
         "<p style=\"margin-top:1rem\"><a class=\"btn btn-navy\" href=\"termin.html?thema=BU_VW&amp;quelle=vw-check\">Das im Gespräch klären</a></p>";
    result.innerHTML = h;
    result.className = "finder-result show";
  }

  select.addEventListener("change", function () { render(select.value); });
})();
