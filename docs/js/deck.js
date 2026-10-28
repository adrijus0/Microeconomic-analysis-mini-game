/*
 * deck.js — shared deck bootstrap (coordinator-owned).
 *
 * Responsibilities:
 *   1. inject the beamer-style footline ("n / N") into every content slide;
 *   2. inject the probability-triangle SVG from Figures.triangleSVG();
 *   3. initialise reveal.js with the vendored KaTeX + notes plugins;
 *   4. shrink a slide's body type only if its content would overflow the
 *      1280 × 720 canvas (a safety net, not a substitute for good markup).
 *
 * No modules, no fetch(), no external requests: this file is a classic script.
 */
(function () {
  "use strict";

  var CONFIG = window.CONFIG || {};
  var sections = Array.prototype.slice.call(
    document.querySelectorAll(".reveal .slides > section")
  );
  var total = sections.length;

  /* ---- 1. Footline ------------------------------------------------------ */

  sections.forEach(function (section, index) {
    /* Only the [plain] Thank-you frame is bare, as in beamer. The title
       slide keeps the infolines footline (1 / 35). */
    if (section.classList.contains("plain")) {
      return;
    }
    var foot = document.createElement("div");
    foot.className = "deck-foot";
    foot.setAttribute("aria-hidden", "true");

    var title = document.createElement("span");
    title.className = "deck-foot__title";
    title.textContent = CONFIG.title || "Paradoxes of Choices under Uncertainty";

    var num = document.createElement("span");
    num.className = "deck-foot__num";
    num.textContent = index + 1 + " / " + total;

    foot.appendChild(title);
    foot.appendChild(num);
    section.appendChild(foot);
  });

  /* ---- 2. Figures ------------------------------------------------------- */

  function renderFigures() {
    if (!window.Figures || typeof window.Figures.triangleSVG !== "function") {
      return;
    }
    var hosts = document.querySelectorAll('[data-figure="triangle"]');
    Array.prototype.forEach.call(hosts, function (host) {
      if (host.getAttribute("data-figure-ready") === "1") return;
      host.innerHTML = window.Figures.triangleSVG();
      host.setAttribute("data-figure-ready", "1");
    });
  }

  /* ---- 3. Reveal -------------------------------------------------------- */

  function katexOptions() {
    return {
      local: "vendor/katex",
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre"],
      macros: Object.assign({}, CONFIG.katexMacros || {}),
      throwOnError: false,
      errorColor: "#cc0000"
    };
  }

  renderFigures();

  Reveal.initialize({
    width: 1280,
    height: 720,
    margin: 0,
    minScale: 0.18,
    maxScale: 2.2,
    center: false,
    hash: true,
    history: false,
    controls: false,
    controlsTutorial: false,
    progress: true,
    slideNumber: false,
    keyboard: true,
    touch: true,
    overview: true,
    fragments: true,
    autoAnimate: false,
    transition: "none",
    backgroundTransition: "none",
    plugins:
      typeof RevealMath !== "undefined" && typeof RevealNotes !== "undefined"
        ? [RevealMath.KaTeX, RevealNotes]
        : typeof RevealMath !== "undefined"
        ? [RevealMath.KaTeX]
        : [],
    katex: katexOptions()
  });

  /* ---- 4. Overflow safety net ------------------------------------------ */

  function fitSlide(section) {
    var body = section.querySelector(".slide-body");
    if (!body) return;

    var min = section.classList.contains("script")
      ? 0.86
      : section.classList.contains("tight")
      ? 0.84
      : 0.78;
    var scale = 1;
    body.style.setProperty("--fit", "1");

    /* Two passes: one to settle KaTeX line boxes, one to measure again. */
    for (var pass = 0; pass < 2; pass++) {
      while (
        (body.scrollHeight > body.clientHeight + 1 ||
          body.scrollWidth > body.clientWidth + 1) &&
        scale > min
      ) {
        scale = Math.max(min, scale - 0.01);
        body.style.setProperty("--fit", scale.toFixed(2));
      }
    }
    section.setAttribute("data-fit", scale.toFixed(2));
  }

  function fitAll() {
    renderFigures();
    sections.forEach(fitSlide);
  }

  Reveal.on("ready", function () {
    fitAll();
    /* KaTeX renders a tick after ready; measure once more. */
    window.setTimeout(fitAll, 350);
  });

  Reveal.on("slidechanged", function (event) {
    if (event.currentSlide) fitSlide(event.currentSlide);
  });

  /* A \pause can grow a block after the slide was measured. Re-fit on both
     fragment events, and let the reset inside fitSlide restore the larger
     type when a fragment is hidden again. */
  function fitAfterFragment(event) {
    var fragment = event && event.fragment;
    var section = fragment && fragment.closest
      ? fragment.closest("section")
      : null;
    if (!section) return;
    window.setTimeout(function () {
      fitSlide(section);
    }, 30);
  }

  Reveal.on("fragmentshown", fitAfterFragment);
  Reveal.on("fragmenthidden", fitAfterFragment);

  window.addEventListener("resize", function () {
    window.clearTimeout(window.__deckFitTimer);
    window.__deckFitTimer = window.setTimeout(fitAll, 180);
  });
})();
