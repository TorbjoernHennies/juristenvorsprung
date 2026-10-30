(function () {
  "use strict";
  var cfg = window.JV_CONFIG || {};

  // Jahreszahl im Footer
  var y = document.getElementById("year");
  if (y) y.textContent = "© " + new Date().getFullYear() + " JuristenVorsprung";

  // Mobile Navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var form = document.getElementById("lead-form");
  if (!form) return;
  var statusEl = document.getElementById("form-status");

  // Buchungstool einbetten, wenn konfiguriert
  if (cfg.BOOKING_URL) {
    var box = document.getElementById("booking-embed");
    var frame = document.getElementById("booking-frame");
    if (box && frame) { frame.src = cfg.BOOKING_URL; box.hidden = false; }
  }

  // Herkunft und Thema aus der Adresse lesen: ?thema=BU_VW&quelle=instagram&beitrag=reel-bu-wartezeit
  var params = new URLSearchParams(window.location.search);
  function setField(name, value) {
    var el = form.elements[name];
    if (el && value) el.value = value;
  }
  var wanted = params.get("thema");
  if (wanted) {
    var sel = form.elements["thema"];
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === wanted) { sel.value = wanted; break; }
    }
  }
  setField("quelle", params.get("quelle") || params.get("utm_source") || "direkt");
  setField("beitrag", params.get("beitrag") || params.get("utm_content") || "");
  setField("seite", window.location.pathname);

  function show(msg, cls) { statusEl.textContent = msg; statusEl.className = cls || ""; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    show("", "");
    if (form.elements["website"] && form.elements["website"].value) return; // Honeypot

    if (!form.checkValidity()) {
      form.reportValidity();
      show("Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie die Einwilligung.", "err");
      return;
    }

    form.elements["einwilligung_zeit"].value = new Date().toISOString();

    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.name === "website") return;
      data[el.name] = el.type === "checkbox" ? el.checked : el.value;
    });

    if (!cfg.FORM_ENDPOINT) {
      show("Vorschau-Modus: Das Formular ist noch nicht mit einem Ziel verbunden. Es wurde nichts gesendet.", "demo");
      if (window.console) console.info("JV-Formular (nicht gesendet):", data);
      return;
    }

    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    show("Wird gesendet …", "");

    fetch(cfg.FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        show("Vielen Dank. Ihre Anfrage ist eingegangen, wir melden uns zur Terminabstimmung.", "ok");
      })
      .catch(function () {
        show("Das hat leider nicht geklappt. Bitte versuchen Sie es später erneut.", "err");
      })
      .then(function () { btn.disabled = false; });
  });
})();
