// Check im Einstieg: drei Fragen, Denkanstöße statt Antworten. Alles läuft im Browser, nichts wird gesendet.
// Absicht: Der Check zeigt, WORÜBER man nachdenken sollte, nicht die Werte des Versorgungswerks.
// Konkrete Wartezeiten, Zulassungsregeln und Beträge klären wir im Gespräch (Rückmeldung 25.10.2026).
(function () {
  "use strict";
  var DATA = window.VW_DATA || [];
  var TARGET = window.JV_CHECK_TARGET || "termin.html?thema=BU_VW&amp;quelle=check";
  var form = document.getElementById("check-form");
  var out = document.getElementById("check-result");
  if (!form || !out) return;

  var land = form.elements["land"];
  DATA.forEach(function (d, i) {
    var o = document.createElement("option");
    o.value = String(i);
    o.textContent = d.n;
    land.appendChild(o);
  });

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  function item(tag, kind, html) {
    return '<li><span class="tag ' + kind + '">' + esc(tag) + "</span><p>" + html + "</p></li>";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var phase = form.elements["phase"].value;
    var ereignis = form.elements["ereignis"].value;
    if (!phase || !ereignis) {
      out.innerHTML = '<p class="check-foot">Bitte beantworte die erste und die dritte Frage, dann geht es los.</p>';
      out.className = "check-result show";
      return;
    }
    var d = land.value === "" ? null : DATA[Number(land.value)];
    var werk = d ? "Dein Versorgungswerk (" + esc(d.n) + ")" : "Dein Versorgungswerk";
    var items = [];

    if (ereignis === "wechsel" && (phase === "angestellt" || phase === "syndikus")) {
      items.push(item("Frist", "tag-frist", "Beim Wechsel ist die Befreiung von der gesetzlichen Rentenversicherung in der Regel neu zu beantragen, und dafür läuft eine kurze Frist. Ist das bei dir schon erledigt?"));
    }
    if (ereignis === "wechsel" && phase === "syndikus") {
      items.push(item("Zulassung", "tag-gold", "Als Syndikusrechtsanwalt brauchst du für die neue Stelle in der Regel eine neue Zulassung, bevor die Befreiung greift. Hast du das im Blick?"));
    }
    if (phase === "referendariat") {
      items.push(item("Frist", "tag-frist", "Aus dem Referendariat hast du Rentenzeiten. Ob sie im Versorgungswerk landen, hängt von einem Antrag ab, und der hat eine Frist. Weißt du, wie deine Zeiten behandelt werden?"));
    }
    if (ereignis === "start" || phase === "einstieg") {
      items.push(item("Rabatt", "tag-gold", "Viele Versorgungswerke bieten Berufsanfängern einen Beitragsrabatt, oft nur auf Antrag. Er senkt aber auch die spätere Rente. Ob er für dich sinnvoll ist, rechnest du besser vorher durch."));
    }
    if (ereignis === "selbst" || phase === "selbststaendig") {
      items.push(item("Beitrag", "tag-gold", "Als Selbstständiger gelten andere Beitragsregeln als im Angestelltenverhältnis. Was du ans Versorgungswerk zahlst und was darüber hinaus sinnvoll ist, solltest du gezielt entscheiden."));
      items.push(item("Steuer", "tag-gold", "Beiträge ans Versorgungswerk und Basisrente teilen sich einen gemeinsamen steuerlichen Höchstbetrag. Der Spielraum ist oft kleiner als gedacht."));
      items.push(item("Krankenversicherung", "tag-gold", "Die private Krankenversicherung wird jetzt zu einer echten Entscheidung, mit Blick auf 30 Jahre."));
    }
    if (ereignis === "gehalt") {
      items.push(item("Krankenversicherung", "tag-gold", "Mit einem Gehaltssprung kann sich ein Zeitfenster für die Entscheidung zwischen GKV und PKV öffnen. Schau früh hin, bevor es zu ist."));
    }

    items.push(item("Berufsunfähigkeit", "tag-frist", werk + " sichert Berufsunfähigkeit ab, aber nach eigenen Regeln: mit Wartezeit, mit Bedingungen und mit einer eigenen Definition, wann du als berufsunfähig giltst. Kennst du sie, und reicht das für dich?"));

    var name = d ? " für " + esc(d.n) : "";
    out.innerHTML =
      "<h3>Darüber solltest du nachdenken" + name + "</h3><ul>" + items.slice(0, 4).concat(item("Unser Rat", "tag-gold",
        "Lass das einmal in Ruhe gegenprüfen: was dein Versorgungswerk leistet, was du privat ergänzen solltest und ob beides auch zu deinen nächsten Karriereschritten passt. Ein Gespräch, danach weißt du, woran du bist.")).join("") + "</ul>" +
      '<p><a class="btn btn-navy" href="' + TARGET + '">Das im Gespräch klären</a></p>' +
      '<p class="check-foot">Orientierung, keine Beratung. Deine Auswahl bleibt in deinem Browser.</p>';
    out.className = "check-result show";
    out.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
})();
