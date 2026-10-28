/*
 * tryit.js — "Try it" game overlays and the QR code on the last slide.
 *
 * Classic script (no modules, no fetch, no external requests) so the deck
 * works from file:// as well as GitHub Pages. Bound once at load:
 *   1. [data-game] opens the matching .game-overlay and lazily loads its iframe;
 *   2. [data-close] closes it and returns focus to the button that opened it;
 *   3. Escape closes an open overlay;
 *   4. while an overlay is open, every keydown is stopped at the capture phase
 *      so reveal.js cannot change slides behind the game;
 *   5. #qr-code is filled with an SVG QR code built from CONFIG.siteUrl.
 */
(function () {
  "use strict";

  var FALLBACK_URL = "https://example.github.io/paradoxes-of-choices/";

  /* --- 1–4. Game overlays --------------------------------------------- */

  var openOverlay = null; // overlay currently shown (null when none)
  var lastTrigger = null; // button that opened it, for focus return

  // Overlays live outside the reveal canvas so they are not scaled down on a
  // phone: a fixed overlay on <body> covers the real viewport and the game
  // iframe gets its width. Moving them before deck.js initialises reveal also
  // keeps reveal from eagerly loading iframe[data-src] on slide activation.
  Array.prototype.forEach.call(
    document.querySelectorAll(".game-overlay"),
    function (overlay) {
      document.body.appendChild(overlay);
    }
  );

  function findOverlay(id) {
    return document.querySelector('.game-overlay[data-overlay="' + id + '"]');
  }

  // Escape inside the game iframe does not bubble to this document. When the
  // iframe is same-origin we can listen on its window too; on file:// Chrome
  // may treat it as cross-origin, so the visible ✕ remains the promise.
  function bridgeEscape(overlay) {
    var frame = overlay.querySelector(".game-overlay__frame");
    if (!frame || frame.getAttribute("data-esc-bridge") === "1") return;
    frame.setAttribute("data-esc-bridge", "1");
    frame.addEventListener("load", function () {
      try {
        frame.contentWindow.addEventListener(
          "keydown",
          function (event) {
            if (event.key === "Escape" || event.key === "Esc") {
              event.preventDefault();
              closeOverlay(overlay);
            }
          },
          true
        );
      } catch (err) {
        /* Cross-origin (e.g. file://): the ✕ button still closes. */
      }
    });
  }

  function openOverlayFor(id, trigger) {
    var overlay = findOverlay(id);
    if (!overlay) return;

    // Lazy iframe: set src only the first time this overlay opens.
    var frame = overlay.querySelector(".game-overlay__frame");
    if (frame && !frame.getAttribute("src")) {
      var src = frame.getAttribute("data-src");
      if (src) frame.setAttribute("src", src);
    }

    overlay.hidden = false;
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("overlay-open");

    openOverlay = overlay;
    lastTrigger = trigger || null;

    bridgeEscape(overlay);

    // Focus the dialog itself, not the Close button: Space is reveal's
    // advance key, and a focused button would be activated by it.
    overlay.focus();
  }

  function closeOverlay(overlay) {
    if (!overlay || overlay.hidden) return;

    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overlay-open");

    if (openOverlay === overlay) openOverlay = null;

    // Return focus to the trigger on the same slide (don't move the deck).
    var trigger = lastTrigger;
    lastTrigger = null;
    if (trigger && typeof trigger.focus === "function") trigger.focus();
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || typeof target.closest !== "function") return;

    var opener = target.closest("[data-game]");
    if (opener) {
      event.preventDefault();
      openOverlayFor(opener.getAttribute("data-game"), opener);
      return;
    }

    var closer = target.closest("[data-close]");
    if (closer) {
      event.preventDefault();
      closeOverlay(closer.closest(".game-overlay"));
    }
  });

  // Capture phase on window: reveal.js listens on document in the bubble
  // phase, so stopping propagation here keeps the deck still.
  window.addEventListener(
    "keydown",
    function (event) {
      if (!openOverlay) return;

      event.stopPropagation();

      if (event.key === "Escape" || event.key === "Esc") {
        event.preventDefault();
        closeOverlay(openOverlay);
      }
    },
    true
  );

  /* --- 5. QR code ------------------------------------------------------ */

  function drawQr() {
    var host = document.getElementById("qr-code");
    var urlNode = document.getElementById("qr-url");
    var config = window.CONFIG || {};
    var url = config.siteUrl || FALLBACK_URL;

    // Always show the address, even if the QR cannot be drawn.
    if (urlNode) urlNode.textContent = url;
    if (!host) return;

    if (typeof window.qrcode !== "function") {
      console.warn("[tryit] qrcode library missing — showing the URL only.");
      return;
    }

    try {
      var qr = window.qrcode(0, "M");
      qr.addData(url);
      qr.make();
      host.innerHTML = qr.createSvgTag({
        cellSize: 8,
        margin: 32,
        scalable: true,
        alt: { text: "QR code for the games hub" },
        title: { text: "Play the games" }
      });
    } catch (err) {
      // A QR failure must never break the deck.
      console.warn("[tryit] could not draw the QR code:", err);
    }
  }

  // The script sits at the end of <body>, but stay safe if that changes.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", drawQr);
  } else {
    drawQr();
  }
})();
