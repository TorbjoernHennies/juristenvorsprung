// 2-Minuten-Check (Wunsch 31.10.2026): ein paar Klicks, danach eine Ampel je Bereich.
// Absicht: zeigen, DASS etwas zu tun ist, nicht WIE. Das Wie klären wir im Gespräch.
// Alles läuft im Browser, nichts wird gespeichert oder gesendet. Zahlen nur, wenn sie auf den Themenseiten belegt sind.
(function () {
  "use strict";
  var box = document.getElementById("quiz");
  if (!box) return;
  var TARGET = "termin.html?thema=2-Minuten-Check&quelle=2-minuten-check";

  var QUESTIONS = [
    { id: "phase", q: "Wo stehst du gerade?", opts: [
      ["referendariat", "Im Referendariat"],
      ["kanzlei", "Angestellt in einer Kanzlei"],
      ["syndikus", "Syndikus im Unternehmen"],
      ["selbst", "Selbstständig oder Partner"]] },
    { id: "vw", q: "Zahlst du ins Versorgungswerk?", hint: "Als angestellter Anwalt kannst du dich in der Regel von der gesetzlichen Rentenversicherung befreien lassen.",
      skip: function (a) { return a.phase === "referendariat" || a.phase === "selbst"; }, opts: [
      ["ja", "Ja, ich bin befreit und zahle ins Versorgungswerk"],
      ["nein", "Nein, ich zahle in die gesetzliche Rentenversicherung"],
      ["unklar", "Weiß ich nicht genau"]] },
    { id: "bu", q: "Hast du eine private Berufsunfähigkeitsversicherung?", opts: [
      ["geprueft", "Ja, und in den letzten zwei, drei Jahren prüfen lassen"],
      ["alt", "Ja, aber länger nicht geprüft, oder ich weiß es nicht genau"],
      ["nein", "Nein, bisher nicht"]] },
    { id: "kv", q: "Wie bist du krankenversichert?", opts: [
      ["gkv", "Gesetzlich (GKV)"],
      ["pkv", "Privat (PKV)"],
      ["beihilfe", "Über Beihilfe, zum Beispiel im Referendariat"]] },
    { id: "eink", q: "Liegt dein Bruttojahresgehalt über 84.150 €?", hint: "Das ist die Versicherungspflichtgrenze 2027. Darüber kannst du als Angestellter zwischen GKV und PKV wählen.",
      skip: function (a) { return a.phase === "referendariat" || a.phase === "selbst"; }, opts: [
      ["ueber", "Ja, darüber"],
      ["unter", "Nein, darunter"]] },
    { id: "av", multi: true, q: "Wie sorgst du neben dem Versorgungswerk fürs Alter vor?", hint: "Mehrere Antworten möglich.", opts: [
      ["noch", "Noch nicht"],
      ["privrv", "Private Rentenversicherung"],
      ["riester", "Riester oder Altersvorsorgedepot"],
      ["bav", "Betriebliche Altersvorsorge (bAV)"],
      ["etf", "ETF-Sparplan"],
      ["police", "ETF-Police (fondsgebundene Rentenversicherung)"],
      ["bank", "Sparplan oder Sparkonto bei der Bank"]], only: "noch" },
    { id: "plan", multi: true, q: "Steht in den nächsten ein, zwei Jahren etwas an?", hint: "Mehrere Antworten möglich.", opts: [
      ["wechsel", "Neue Stelle oder Kanzleiwechsel"],
      ["selbst", "Selbstständigkeit oder Partnerschaft"],
      ["gehalt", "Ein deutlicher Gehaltssprung"],
      ["familie", "Familie, Kind oder Immobilie"],
      ["nichts", "Nichts Konkretes"]], only: "nichts" }
  ];

  var answers = {};
  var path = [];        // Indizes der beantworteten Fragen, für „Zurück“
  var cur = 0;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function next(i) {
    for (var j = i + 1; j < QUESTIONS.length; j++) if (!(QUESTIONS[j].skip && QUESTIONS[j].skip(answers))) return j;
    return -1;
  }
  function total() {
    var n = 0;
    QUESTIONS.forEach(function (q) { if (!(q.skip && q.skip(answers))) n++; });
    return n;
  }

  function show() {
    var q = QUESTIONS[cur];
    var pos = path.length + 1, all = total();
    var sel = answers[q.id];
    var opts = q.opts.map(function (o) {
      var on = q.multi ? (sel || []).indexOf(o[0]) >= 0 : sel === o[0];
      return '<button type="button" class="quiz-opt' + (q.multi ? " multi" : "") + '" data-v="' + o[0] + '" ' +
        (q.multi ? 'role="checkbox" aria-checked="' + on + '"' : 'aria-pressed="' + on + '"') + ">" + esc(o[1]) + "</button>";
    }).join("");
    box.innerHTML =
      '<div class="quiz-top"><span>Frage ' + pos + " von " + all + '</span><div class="quiz-bar" aria-hidden="true"><span style="width:' + Math.round((pos - 1) / all * 100) + '%"></span></div></div>' +
      '<h2 class="quiz-q" tabindex="-1">' + esc(q.q) + "</h2>" +
      (q.hint ? '<p class="quiz-hint">' + esc(q.hint) + "</p>" : "") +
      '<div class="quiz-opts">' + opts + "</div>" +
      '<div class="quiz-nav">' + (path.length ? '<button type="button" class="quiz-back">Zurück</button>' : "<span></span>") +
      (q.multi ? '<button type="button" class="btn btn-navy quiz-next"' + ((sel || []).length ? "" : " disabled") + ">" + (next(cur) < 0 ? "Auswertung zeigen" : "Weiter") + "</button>" : "") + "</div>";
    var h = box.querySelector(".quiz-q");
    if (started) h.focus({ preventScroll: true });
  }

  var started = false;
  function go(i) {
    started = true;
    if (i < 0) { result(); return; }
    cur = i;
    show();
    if (box.getBoundingClientRect().top < 0) box.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  box.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || !box.contains(b)) return;
    var q = QUESTIONS[cur];
    if (b.classList.contains("quiz-restart")) { answers = {}; path = []; go(0); return; }
    if (b.classList.contains("quiz-back")) { go(path.pop()); return; }
    if (b.classList.contains("quiz-next")) { path.push(cur); go(next(cur)); return; }
    if (!b.classList.contains("quiz-opt")) return;
    var v = b.getAttribute("data-v");
    if (q.multi) {
      var list = (answers[q.id] || []).slice();
      var k = list.indexOf(v);
      if (k >= 0) list.splice(k, 1);
      else if (v === q.only) list = [v];
      else { list = list.filter(function (x) { return x !== q.only; }); list.push(v); }
      answers[q.id] = list;
      Array.prototype.forEach.call(box.querySelectorAll(".quiz-opt"), function (o) {
        o.setAttribute("aria-checked", String(list.indexOf(o.getAttribute("data-v")) >= 0));
      });
      box.querySelector(".quiz-next").disabled = !list.length;
      return;
    }
    answers[q.id] = v;
    Array.prototype.forEach.call(box.querySelectorAll(".quiz-opt"), function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    path.push(cur);
    setTimeout(function () { go(next(cur)); }, 180);
  });

  // ---- Auswertung ----
  var LABEL = { ok: "Sieht solide aus", pruefen: "Solltest du prüfen lassen", blick: "Hier lohnt sich ein genauer Blick" };
  var RANK = { ok: 0, pruefen: 1, blick: 2 };
  function worst(a, b) { return RANK[a] >= RANK[b] ? a : b; }
  function has(id, v) { return (answers[id] || []).indexOf(v) >= 0; }

  // Texte bewusst kurz und ohne Fachbegriffe (Rückmeldung 31.10.2026): Befund + fetter Handlungssatz (d), Erklärungen hinter „Mehr dazu“.
  function areas() {
    var a = answers, ref = a.phase === "referendariat", selbst = a.phase === "selbst", out = [];
    var OPTION = "Willst du dir die PKV offenhalten, solltest du dir schon jetzt mit einem Optionstarif" + (ref ? " oder einer Anwartschaft" : "") + " deinen heutigen Gesundheitszustand sichern.";

    // Versorgungswerk
    var vw = { t: "Versorgungswerk", link: "versorgungswerke.html" };
    if (ref) { vw.s = "pruefen"; vw.p = ["Deine Rentenzeiten aus dem Referendariat landen nicht automatisch im Versorgungswerk. Dafür brauchst du einen Antrag, und der hat eine Frist."]; vw.d = "Antragsfrist im Blick behalten"; }
    else if (selbst) { vw.s = "pruefen"; vw.p = ["Als Selbstständiger zahlst du nach eigenen Regeln ins Versorgungswerk. Wie viel dort sinnvoll ist und was du daneben aufbaust, lohnt sich einmal durchzurechnen."]; vw.d = "Beitrag und Vorsorge durchrechnen"; }
    else if (a.vw === "ja") { vw.s = "ok"; vw.p = ["Du bist im Versorgungswerk, das ist deine Basis. Was es im Ernstfall leistet, regelt jedes Bundesland anders."]; vw.d = "Leistung im Ernstfall kennen"; }
    else if (a.vw === "nein") { vw.s = "pruefen"; vw.p = ["Du zahlst in die gesetzliche Rente. Als " + (a.phase === "syndikus" ? "Syndikus kannst du dich befreien lassen, wenn deine Zulassung zur Stelle passt," : "Anwalt kannst du dich meist befreien lassen") + " und stattdessen ins Versorgungswerk zahlen. Ob das für dich besser ist, prüfen wir."]; vw.d = "Befreiung prüfen lassen"; }
    else { vw.s = "blick"; vw.p = ["Ob du befreit bist, entscheidet, wo deine Rentenbeiträge landen. Das solltest du sicher wissen, und es lässt sich schnell klären."]; vw.d = "Status klären"; }
    out.push(vw);

    // Berufsunfähigkeit
    var bu = { t: "Berufsunfähigkeit", link: "berufsunfaehigkeit.html" };
    if (a.bu === "geprueft") { bu.s = "ok"; bu.p = ["Gut so. Faustregel: alle zwei bis drei Jahre gegenprüfen. Tarife werden laufend besser und oft günstiger."]; bu.d = "Alle 2–3 Jahre gegenprüfen"; }
    else if (a.bu === "alt") { bu.s = "pruefen"; bu.p = ["Seit deinem Abschluss hat sich am Markt viel getan. Wir schauen auf Rentenhöhe, Laufzeit und Bedingungen, und ob sich alte Ausschlüsse heute wieder streichen lassen."]; bu.d = "Vertrag checken lassen"; }
    else { bu.s = "blick"; bu.d = "Private BU prüfen, solange du gesund bist"; bu.p = [ref
      ? "Im Referendariat sichert dich das Versorgungswerk meist noch gar nicht ab, und später zahlt es nur unter strengen Bedingungen. Jung und gesund ist der beste Zeitpunkt für eine private BU."
      : "Viele verlassen sich darauf, dass ihr Versorgungswerk bei Berufsunfähigkeit zahlt. Das tut es aber nur unter strengen Bedingungen: meist erst, wenn du gar nicht mehr als Anwalt arbeiten kannst, oft erst nach Rückgabe der Zulassung. Eine private BU ist deshalb in aller Regel sinnvoll. Welche zu dir passt, klären wir gemeinsam."]; }
    out.push(bu);

    // Krankenversicherung
    var kv = { t: "Krankenversicherung", link: "pkv-gkv.html" };
    if (a.kv === "pkv") { kv.s = "ok"; kv.d = "Beitragsplan fürs Alter aufsetzen"; kv.p = [selbst
      ? "Privat versichert, gut. Als Selbstständiger trägst du den Beitrag allein, auch im Alter. Deshalb lohnt ein strategischer Beitragsplan, der deine PKV im Ruhestand mitfinanziert, dazu ein passendes Krankentagegeld."
      : "Privat versichert, gut. Damit dein Beitrag auch im Ruhestand entspannt bleibt, gehört ein strategischer Beitragsplan fürs Alter dazu." + (ref ? "" : " Als Angestellter zahlt dein Arbeitgeber dabei mit.")]; }
    else if (a.kv === "beihilfe") { kv.s = "pruefen"; kv.d = "Optionstarif jetzt sichern"; kv.p = ["Nach dem Referendariat endet die Beihilfe meist, dann versicherst du dich neu: gesetzlich oder privat. " + OPTION]; }
    else if (selbst) { kv.s = "pruefen"; kv.d = "GKV und PKV vergleichen"; kv.p = ["Als Selbstständiger zahlst du in der GKV alles allein, bis rund 1.400 € im Monat. In die PKV kannst du unabhängig vom Einkommen wechseln."]; }
    else if (ref) { kv.s = "pruefen"; kv.d = "Optionstarif jetzt sichern"; kv.p = ["Ob du in der GKV bleibst, entscheidest du erst in ein paar Jahren, und bis dahin kann sich deine Gesundheit ändern. " + OPTION]; }
    else if (a.eink === "ueber") { kv.s = "pruefen"; kv.d = "GKV und PKV vergleichen"; kv.p = ["Du darfst zwischen GKV und PKV wählen. Die Entscheidung begleitet dich über Jahrzehnte, deshalb lohnt der Vergleich."]; }
    else if (has("plan", "gehalt")) { kv.s = "pruefen"; kv.d = "Optionstarif jetzt sichern"; kv.p = ["Mit dem Gehaltssprung darfst du vielleicht bald in die PKV. Dafür solltest du dir schon jetzt mit einem Optionstarif deinen heutigen Gesundheitszustand sichern."]; }
    else { kv.s = "ok"; kv.d = "Optionstarif jetzt sichern"; kv.p = ["Bei deinem Gehalt bist du in der GKV pflichtversichert. " + OPTION]; }
    out.push(kv);

    // Altersvorsorge
    var av = answers.av || [], avc = { t: "Altersvorsorge", link: "altersvorsorge.html", html: true, p: [] };
    if (has("av", "noch")) {
      avc.s = ref ? "pruefen" : "blick"; avc.d = "Vorsorge starten";
      avc.p.push(ref ? "Mit dem Berufsstart ist der beste Moment für deine Vorsorge. Ab 2027 gibt es dafür erstmals staatliche Zulagen, auch für Mitglieder von Versorgungswerken."
        : "Das Versorgungswerk allein reicht im Alter meist nicht für deinen Lebensstandard. Je früher du ergänzt, desto kleiner ist die nötige Rate.");
    } else {
      var T = {
        privrv: "<strong>Private Rentenversicherung:</strong> Ältere Verträge sind oft teuer. Ob weiterführen oder umbauen, zeigt ein Blick in den Vertrag.",
        riester: "<strong>Riester oder Altersvorsorgedepot:</strong> Ab 2027 ändern sich die Regeln. Bestehende Verträge erst prüfen, dann entscheiden.",
        bav: "<strong>bAV:</strong> Entscheidend sind Arbeitgeberzuschuss und Kosten, und bei einem Stellenwechsel die Frage, was mit dem Vertrag passiert.",
        police: "<strong>ETF-Police:</strong> Kann sich lohnen, vor allem wegen des Steuervorteils im Alter. Entscheidend sind die Kosten.",
        etf: "<strong>ETF-Sparplan:</strong> Gute Basis. Prüf, ob du zusätzlich bis zu 540 € Zulage im Jahr mitnehmen kannst. Und weißt du schon, wie viel Steuer später auf deine Gewinne anfällt?",
        bank: "<strong>Sparplan oder Sparkonto bei der Bank:</strong> Bankzinsen liegen meist nur etwa auf Höhe der Inflation. Dein Geld ist sicher, wächst aber kaum. Für echten Vermögensaufbau braucht es mehr."
      };
      ["privrv", "riester", "bav", "police", "etf", "bank"].forEach(function (k) { if (av.indexOf(k) >= 0) avc.p.push(T[k]); });
      if (av.length === 1 && av[0] === "etf") { avc.s = "ok"; avc.d = "Zulage und Steuervorteil mitnehmen"; }
      else if (av.length === 1 && av[0] === "bank") { avc.s = "blick"; avc.d = "Sparen mit Rendite aufsetzen"; }
      else { avc.s = "pruefen"; avc.d = "Kosten und Steuer prüfen"; }
    }
    out.push(avc);

    // Was ansteht
    var pl = answers.plan || [], pp = [], ps = "ok";
    if (pl.indexOf("wechsel") >= 0) {
      ps = worst(ps, "blick");
      pp.push("<strong>Neue Stelle:</strong> Die Befreiung musst du meist neu beantragen, mit kurzer Frist." +
        (a.phase === "syndikus" ? " Als Syndikus brauchst du meist auch eine neue Zulassung." : "") + " Auch bAV und BU gehören dann auf den Prüfstand.");
    }
    if (pl.indexOf("selbst") >= 0) {
      ps = worst(ps, "blick");
      pp.push("<strong>Selbstständigkeit:</strong> Versorgungswerk, Krankenversicherung und Steuern ändern sich auf einen Schlag. Das planst du am besten vorher.");
    }
    if (pl.indexOf("gehalt") >= 0) {
      ps = worst(ps, "pruefen");
      pp.push("<strong>Gehaltssprung:</strong> Guter Zeitpunkt, die BU-Rente anzuheben. Und vielleicht darfst du danach in die PKV.");
    }
    if (pl.indexOf("familie") >= 0) {
      ps = worst(ps, "pruefen");
      pp.push("<strong>Familie, Kind oder Immobilie:</strong> Jetzt lässt sich die BU oft ohne Gesundheitsfragen erhöhen. Und ab 2027 gibt es 300 € Zulage je Kind.");
    }
    if (pp.length) out.push({ t: "Was bei dir ansteht", s: ps, p: pp, html: true, d: "Vorher planen, Fristen beachten" });

    return out.sort(function (x, y) { return RANK[y.s] - RANK[x.s]; });
  }

  function result() {
    var list = areas();
    var n = { ok: 0, pruefen: 0, blick: 0 };
    list.forEach(function (x) { n[x.s]++; });
    var head = n.blick ? (n.blick === 1 ? "Ein Bereich verdient einen genauen Blick" : n.blick + " Bereiche verdienen einen genauen Blick")
      : n.pruefen > n.ok ? n.pruefen + " Punkte solltest du prüfen lassen"
      : n.pruefen ? "Solide Basis, mit " + (n.pruefen === 1 ? "einem Punkt" : n.pruefen + " Punkten") + " zum Prüfen"
      : "Das klingt gut aufgestellt";
    var rat = n.blick
      ? "Ein paar Punkte solltest du dir genauer ansehen. Im Erstgespräch gehen wir sie mit dir und deinen Unterlagen durch. Danach weißt du, was bei dir wirklich zu tun ist und was nicht."
      : n.pruefen
      ? "Vieles passt schon. Die Details stecken aber in deiner Satzung und deinen Verträgen. Ein Gespräch, und du weißt, ob alles zusammenpasst."
      : "Du hast an die wichtigen Dinge gedacht. Ob die Details stimmen, zeigt ein Blick in Satzung und Verträge. Wenn du magst, prüfen wir das gemeinsam.";
    var cards = list.map(function (x) {
      var body = x.p.length > 1 ? "<ul>" + x.p.map(function (s) { return "<li>" + (x.html ? s : esc(s)) + "</li>"; }).join("") + "</ul>"
        : "<p>" + (x.html ? x.p[0] : esc(x.p[0])) + "</p>";
      return '<article class="res-card res-' + x.s + '"><p class="res-badge">' + LABEL[x.s] + "</p><h3>" + esc(x.t) + "</h3>" + body +
        (x.d ? '<p class="res-do">→ ' + esc(x.d) + "</p>" : "") + (x.link ? '<p class="res-more"><a href="' + x.link + '">Mehr dazu</a></p>' : "") + "</article>";
    }).join("");
    box.innerHTML =
      '<div class="quiz-top"><span>Deine Auswertung</span><div class="quiz-bar" aria-hidden="true"><span style="width:100%"></span></div></div>' +
      '<h2 class="quiz-q" tabindex="-1">' + head + "</h2>" +
      '<p class="res-sum"><span class="res-ok">' + n.ok + " solide</span><span class=\"res-pruefen\">" + n.pruefen + " prüfen</span><span class=\"res-blick\">" + n.blick + " genauer Blick</span></p>" +
      '<div class="res-list">' + cards + "</div>" +
      '<div class="res-rat"><h3>Unser Rat</h3><p>' + rat + '</p><p class="cta-row"><a class="btn btn-gold" href="' + TARGET + '">Erstgespräch vereinbaren</a><button type="button" class="quiz-back quiz-restart">Check neu starten</button></p></div>' +
      '<p class="check-foot">Orientierung, keine Beratung. Deine Antworten bleiben in deinem Browser und werden nicht gespeichert.</p>';
    box.querySelector(".quiz-q").focus({ preventScroll: true });
    box.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  show();
})();
