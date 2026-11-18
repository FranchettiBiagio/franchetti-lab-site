/* Franchetti Lab — comportamento del sito (senza dipendenze) */

(function () {
  "use strict";

  var ridotto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------------------------------------------------------------- testata
  var testata = document.getElementById("testata");
  var bottone = document.getElementById("menuBottone");
  var menu = document.getElementById("menu");

  function aggiornaTestata() {
    if (!testata) return;
    testata.classList.toggle("is-scroll", window.scrollY > 30);
  }
  aggiornaTestata();
  window.addEventListener("scroll", aggiornaTestata, { passive: true });

  function chiudiMenu() {
    if (!menu || !bottone || !testata) return;
    menu.classList.remove("is-aperto");
    testata.classList.remove("is-menu");
    bottone.setAttribute("aria-expanded", "false");
  }

  if (bottone && menu) {
    bottone.addEventListener("click", function () {
      var aperto = menu.classList.toggle("is-aperto");
      testata.classList.toggle("is-menu", aperto);
      bottone.setAttribute("aria-expanded", aperto ? "true" : "false");
    });

    menu.addEventListener("click", function (evento) {
      if (evento.target.closest("a")) chiudiMenu();
    });

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape") chiudiMenu();
    });

    document.addEventListener("click", function (evento) {
      if (!menu.classList.contains("is-aperto")) return;
      if (menu.contains(evento.target) || bottone.contains(evento.target)) return;
      chiudiMenu();
    });
  }

  // ------------------------------------------------------------ confronti
  var confronti = document.querySelectorAll("[data-confronto]");

  confronti.forEach(function (confronto) {
    var attivo = false;

    function imposta(percentuale) {
      var valore = Math.max(0, Math.min(100, percentuale));
      confronto.style.setProperty("--pos", valore + "%");
      confronto.setAttribute("aria-valuenow", String(Math.round(valore)));
    }

    function daEvento(evento) {
      var riquadro = confronto.getBoundingClientRect();
      var x = evento.clientX - riquadro.left;
      imposta((x / riquadro.width) * 100);
    }

    confronto.addEventListener("pointerdown", function (evento) {
      attivo = true;
      confronto.setPointerCapture(evento.pointerId);
      daEvento(evento);
    });
    confronto.addEventListener("pointermove", function (evento) {
      if (attivo) daEvento(evento);
    });
    confronto.addEventListener("pointerup", function () {
      attivo = false;
    });
    confronto.addEventListener("pointercancel", function () {
      attivo = false;
    });

    confronto.addEventListener("keydown", function (evento) {
      var corrente = parseFloat(confronto.getAttribute("aria-valuenow")) || 50;
      var passo = evento.shiftKey ? 10 : 2;
      if (evento.key === "ArrowLeft") {
        imposta(corrente - passo);
        evento.preventDefault();
      } else if (evento.key === "ArrowRight") {
        imposta(corrente + passo);
        evento.preventDefault();
      } else if (evento.key === "Home") {
        imposta(0);
        evento.preventDefault();
      } else if (evento.key === "End") {
        imposta(100);
        evento.preventDefault();
      }
    });

    imposta(50);
  });

  // ------------------------------------------------------------- filtro look
  var filtri = document.querySelectorAll(".filtro");
  var voci = document.querySelectorAll(".look__voce");
  var soloInclusi = document.getElementById("soloInclusi");
  var conteggio = document.getElementById("conteggioLook");
  var famiglia = "tutti";

  function applicaFiltri() {
    var visibili = 0;
    voci.forEach(function (voce) {
      var giustaFamiglia = famiglia === "tutti" || voce.dataset.famiglia === famiglia;
      var giustoIncluso = !soloInclusi || !soloInclusi.checked || voce.dataset.incluso === "si";
      var mostra = giustaFamiglia && giustoIncluso;
      voce.classList.toggle("is-nascosto", !mostra);
      if (mostra) visibili += 1;
    });
    if (conteggio) {
      conteggio.textContent = visibili === 1 ? "1 look" : visibili + " look";
    }
  }

  filtri.forEach(function (pulsante) {
    pulsante.addEventListener("click", function () {
      filtri.forEach(function (altro) {
        altro.classList.toggle("is-attivo", altro === pulsante);
        altro.setAttribute("aria-pressed", altro === pulsante ? "true" : "false");
      });
      famiglia = pulsante.dataset.famiglia;
      applicaFiltri();
    });
  });

  if (soloInclusi) {
    soloInclusi.addEventListener("change", applicaFiltri);
  }
  if (voci.length) applicaFiltri();

  // ------------------------------------------------------------ rivelazioni
  var daRivelare = document.querySelectorAll(".rivela");
  if (ridotto || !("IntersectionObserver" in window) || !daRivelare.length) {
    daRivelare.forEach(function (elemento) {
      elemento.classList.add("is-visibile");
    });
  } else {
    var osservatore = new IntersectionObserver(
      function (vociVisibili) {
        vociVisibili.forEach(function (voce) {
          if (voce.isIntersecting) {
            voce.target.classList.add("is-visibile");
            osservatore.unobserve(voce.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    daRivelare.forEach(function (elemento) {
      osservatore.observe(elemento);
    });
  }

  // ------------------------------------------------------- indice della guida
  var indice = document.querySelector(".indice");
  if (indice) {
    var collegamenti = Array.prototype.slice.call(indice.querySelectorAll('a[href^="#"]'));
    var sezioni = collegamenti
      .map(function (link) {
        return document.getElementById(link.getAttribute("href").slice(1));
      })
      .filter(Boolean);

    var inCoda = false;
    function evidenzia() {
      inCoda = false;
      var punto = window.scrollY + 150;
      var corrente = sezioni[0];
      sezioni.forEach(function (sezione) {
        if (sezione.offsetTop <= punto) corrente = sezione;
      });
      collegamenti.forEach(function (link) {
        link.classList.toggle(
          "is-attivo",
          corrente && link.getAttribute("href") === "#" + corrente.id
        );
      });
    }
    window.addEventListener(
      "scroll",
      function () {
        if (inCoda) return;
        inCoda = true;
        window.requestAnimationFrame(evidenzia);
      },
      { passive: true }
    );
    evidenzia();
  }

  // ------------------------------------------------------------ anno corrente
  var anno = document.getElementById("anno");
  if (anno) anno.textContent = String(new Date().getFullYear());
})();
