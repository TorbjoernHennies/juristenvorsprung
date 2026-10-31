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
      ["passt", "Ja, und die Rente passt zu meinem heutigen Einkommen"],
      ["alt", "Ja, aber aus Studium oder Referendariat, oder ich weiß es nicht genau"],
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

  function areas() {
    var a = answers, ref = a.phase === "referendariat", selbst = a.phase === "selbst", out = [];

    // Versorgungswerk
    if (ref) out.push({ t: "Versorgungswerk", s: "pruefen", link: "versorgungswerke.html", p: ["Aus dem Referendariat hast du Rentenzeiten. Ob sie später im Versorgungswerk landen, hängt von einem Antrag ab, und der hat eine Frist."] });
    else if (selbst) out.push({ t: "Versorgungswerk", s: "pruefen", link: "versorgungswerke.html", p: ["Als Selbstständiger gelten andere Beitragsregeln als im Angestelltenverhältnis. Was du ans Versorgungswerk zahlst und was darüber hinaus sinnvoll ist, solltest du gezielt entscheiden."] });
    else if (a.vw === "ja") out.push({ t: "Versorgungswerk", s: "ok", link: "versorgungswerke.html", p: ["Du bist befreit und im Versorgungswerk. Wichtig bleibt, was deine Satzung bei Berufsunfähigkeit wirklich leistet. Das regelt jedes der 16 Versorgungswerke anders."] });
    else if (a.vw === "nein") out.push({ t: "Versorgungswerk", s: "pruefen", link: "versorgungswerke.html", p: [a.phase === "syndikus"
      ? "Du zahlst in die gesetzliche Rentenversicherung. Als Syndikusrechtsanwalt ist eine Befreiung zugunsten des Versorgungswerks möglich, wenn die Zulassung für deine Stelle passt. Ob sich das für dich lohnt, sollte jemand prüfen."
      : "Du zahlst in die gesetzliche Rentenversicherung. Als zugelassener Anwalt ist meist eine Befreiung zugunsten des Versorgungswerks möglich. Ob sich das für dich lohnt, sollte jemand prüfen."] });
    else out.push({ t: "Versorgungswerk", s: "blick", link: "versorgungswerke.html", p: ["Ob du befreit bist, entscheidet, wohin deine Rentenbeiträge fließen und wer dich bei Berufsunfähigkeit absichert. Das solltest du sicher wissen."] });

    // Berufsunfähigkeit
    if (a.bu === "passt") out.push({ t: "Berufsunfähigkeit", s: "ok", link: "berufsunfaehigkeit.html", p: ["Klingt gut. Prüfenswert bleibt, ob die Rente mit deinem Gehalt mitwachsen kann und wie die Versicherung mit deinem Versorgungswerk zusammenspielt."] });
    else if (a.bu === "alt") out.push({ t: "Berufsunfähigkeit", s: "pruefen", link: "berufsunfaehigkeit.html", p: ["Eine BU aus Studium oder Referendariat passt oft nicht mehr zum heutigen Gehalt. Viele Verträge lassen sich über die Nachversicherung erhöhen, ohne neue Gesundheitsfragen. Das solltest du kennen, bevor die Fristen dafür ablaufen."] });
    else out.push({ t: "Berufsunfähigkeit", s: "blick", link: "berufsunfaehigkeit.html", p: [(ref ? "Im Referendariat sichert dich das Versorgungswerk in der Regel noch nicht ab. Und später zahlt es nur nach eigenen Regeln:" : "Das Versorgungswerk zahlt bei Berufsunfähigkeit nach eigenen Regeln:") + " je nach Land mit bis zu 60 Monaten Wartezeit, und in 11 von 16 Versorgungswerken hängt die Rente zumindest teilweise an der Zulassung." +
      (ref ? " Je jünger und gesünder du beim Abschluss bist, desto günstiger ist der Beitrag in der Regel." : "")] });

    // Krankenversicherung
    var kv;
    if (a.kv === "pkv") kv = { s: "ok", p: ["Du bist privat versichert. Wichtig ist, dass dein Beitrag auch im Alter tragbar bleibt, etwa über einen Beitragsentlastungstarif." + (selbst ? " Als Selbstständiger gehört ein passendes Krankentagegeld dazu." : "")] };
    else if (a.kv === "beihilfe") kv = { s: "pruefen", p: ["Mit dem Ende des Referendariats endet in der Regel auch die Beihilfe. Dann stellt sich die Frage GKV oder PKV neu, und die Entscheidung wirkt über Jahrzehnte. Mit einem Optionstarif oder einer Anwartschaft sicherst du dir schon heute deinen Gesundheitszustand. Liegt dein Einkommen später über der Grenze oder machst du dich selbstständig, ist der Weg in die PKV frei, ohne neue Gesundheitsprüfung."] };
    else if (selbst) kv = { s: "pruefen", p: ["Als Selbstständiger zahlst du in der GKV den ganzen Beitrag allein, im Höchstfall rund 1.400 € im Monat (2027, mit Pflege). In die PKV kannst du unabhängig vom Einkommen wechseln. Ein Vergleich lohnt sich."] };
    else if (ref) kv = { s: "pruefen", p: ["In der GKV bist du gut aufgehoben. Ob das so bleiben soll, entscheidest du aber erst in ein paar Jahren, und bis dahin kann sich deine Gesundheit ändern. Mit einem Optionstarif oder einer Anwartschaft sicherst du dir schon heute deinen Gesundheitszustand. Liegt dein Einkommen später über der Grenze oder machst du dich selbstständig, ist der Weg in die PKV frei, ohne neue Gesundheitsprüfung."] };
    else if (a.eink === "ueber") kv = { s: "pruefen", p: ["Mit deinem Gehalt über der Versicherungspflichtgrenze kannst du zwischen GKV und PKV wählen. Die Entscheidung gilt praktisch für Jahrzehnte, deshalb lohnt der Vergleich beider Wege, auch im Alter."] };
    else kv = has("plan", "gehalt")
      ? { s: "pruefen", p: ["Mit dem Gehaltssprung kann sich das Fenster zwischen GKV und PKV öffnen. Schau früh hin. Mit einem Optionstarif oder einer Anwartschaft sicherst du dir schon heute deinen Gesundheitszustand. Liegt dein Einkommen später über der Grenze oder machst du dich selbstständig, ist der Weg in die PKV frei, ohne neue Gesundheitsprüfung."] }
      : { s: "ok", p: ["Bei deinem Gehalt bist du in der GKV pflichtversichert. Spannend wird es, sobald du über die Versicherungspflichtgrenze kommst. Mit einem Optionstarif oder einer Anwartschaft sicherst du dir schon heute deinen Gesundheitszustand. Liegt dein Einkommen später über der Grenze oder machst du dich selbstständig, ist der Weg in die PKV frei, ohne neue Gesundheitsprüfung."] };
    out.push({ t: "Krankenversicherung", s: kv.s, link: "pkv-gkv.html", p: kv.p });

    // Altersvorsorge
    var av = answers.av || [], avp = [], avs = "ok";
    if (has("av", "noch")) {
      avs = ref ? "pruefen" : "blick";
      avp.push(ref ? "Mit dem Berufsstart ist ein guter Moment, die Vorsorge aufzusetzen. Ab 2027 gibt es dafür das Altersvorsorgedepot, erstmals auch für Mitglieder von Versorgungswerken gefördert."
        : "Das Versorgungswerk ersetzt im Alter meist nur einen Teil deines letzten Einkommens. Je früher du ergänzt, desto kleiner ist die nötige Rate.");
    } else {
      var T = {
        privrv: "<strong>Private Rentenversicherung:</strong> Ältere Verträge haben oft niedrige Garantien und hohe Kosten. Ob Weiterführen, Ruhenlassen oder Umbauen besser ist, sieht man nur am Vertrag.",
        riester: "<strong>Riester oder Altersvorsorgedepot:</strong> Ab 2027 löst das Altersvorsorgedepot Riester für neue Verträge ab. Wer schon riestert, sollte erst prüfen und dann entscheiden.",
        bav: "<strong>bAV:</strong> Entscheidend sind Arbeitgeberzuschuss und Kosten, und bei einem Stellenwechsel die Frage, was mit dem Vertrag passiert.",
        police: "<strong>ETF-Police:</strong> Ob sie sich gegenüber einem normalen Depot rechnet, hängt an Kosten, Laufzeit und der Besteuerung bei der Auszahlung.",
        etf: "<strong>ETF-Sparplan:</strong> eine gute Basis. Prüfenswert ist, ob du zusätzlich die Förderung des Altersvorsorgedepots mitnimmst, bis zu 540 € Zulage im Jahr.",
        bank: "<strong>Sparplan oder Sparkonto bei der Bank:</strong> Die Zinsen liegen oft unter der Inflation, und Bankfonds kosten häufig Ausgabeaufschläge."
      };
      ["privrv", "riester", "bav", "police", "etf", "bank"].forEach(function (k) { if (av.indexOf(k) >= 0) avp.push(T[k]); });
      if (av.length === 1 && av[0] === "etf") avs = "ok";
      else if (av.length === 1 && av[0] === "bank") avs = "blick";
      else avs = "pruefen";
    }
    out.push({ t: "Altersvorsorge", s: avs, link: "altersvorsorge.html", p: avp, html: true });

    // Was ansteht
    var pl = answers.plan || [], pp = [], ps = "ok";
    if (pl.indexOf("wechsel") >= 0) {
      ps = worst(ps, "blick");
      pp.push("<strong>Stellenwechsel:</strong> Die Befreiung von der Rentenversicherung ist in der Regel neu zu beantragen, mit kurzer Frist." +
        (a.phase === "syndikus" ? " Als Syndikusrechtsanwalt brauchst du für die neue Stelle meist auch eine neue Zulassung." : "") +
        " Auch bAV und BU-Nachversicherung gehören dann auf den Tisch.");
    }
    if (pl.indexOf("selbst") >= 0) {
      ps = worst(ps, "blick");
      pp.push("<strong>Selbstständigkeit:</strong> Beitrag zum Versorgungswerk, Krankenversicherung und Steuern ändern sich auf einmal. Versorgungswerk und Basisrente teilen sich einen gemeinsamen steuerlichen Höchstbetrag, der Spielraum ist oft kleiner als gedacht.");
    }
    if (pl.indexOf("gehalt") >= 0) {
      ps = worst(ps, "pruefen");
      pp.push("<strong>Gehaltssprung:</strong> ein typischer Anlass, die BU-Rente über die Nachversicherung anzuheben. Er kann auch das Fenster zwischen GKV und PKV öffnen.");
    }
    if (pl.indexOf("familie") >= 0) {
      ps = worst(ps, "pruefen");
      pp.push("<strong>Familie, Kind oder Immobilie:</strong> Viele BU-Verträge lassen sich zu solchen Anlässen ohne neue Gesundheitsfragen erhöhen. Das Altersvorsorgedepot zahlt ab 2027 zusätzlich 300 € Zulage je Kind.");
    }
    if (pp.length) out.push({ t: "Was bei dir ansteht", s: ps, p: pp, html: true });

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
        (x.link ? '<p class="res-more"><a href="' + x.link + '">Mehr dazu</a></p>' : "") + "</article>";
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
