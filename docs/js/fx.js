/*
 * fx.js — small wasteland effects: typewriter, count-up, glitch, stamp,
 * falling ash and a tiny haptic buzz.
 *
 * Classic script, no modules. Every effect honours prefers-reduced-motion
 * (it jumps straight to the end state) and registers its timers on the
 * `timers` array it is given, so the engine can cancel them on stop().
 * Screen readers always get the full text immediately: animated copies are
 * aria-hidden and a visually-hidden twin carries the words.
 */
(function (root) {
  "use strict";

  function reduced() {
    try {
      return !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (err) {
      return false;
    }
  }

  function fast() {
    try {
      return new URLSearchParams(root.location.search || "").get("fast") === "1";
    } catch (err) {
      return false;
    }
  }

  function instant() {
    return reduced() || fast();
  }

  function later(timers, fn, ms) {
    var id = root.setTimeout(fn, ms);
    if (timers) timers.push(id);
    return id;
  }

  /*
   * Types `lines` into `host`, one paragraph per line. Returns a handle with
   * finish() (jump to the end) and a `done` flag. onDone runs once.
   */
  function typeLines(host, lines, options) {
    options = options || {};
    var timers = options.timers || null;
    var speed = options.speed || 16;
    var onDone = options.onDone || null;
    var finished = false;
    var targets = [];

    (lines || []).forEach(function (line) {
      var p = document.createElement("p");
      p.className = options.lineClass || "tw-line";
      var said = document.createElement("span");
      said.className = "visually-hidden";
      said.textContent = line;
      var shown = document.createElement("span");
      shown.className = "tw-text";
      shown.setAttribute("aria-hidden", "true");
      p.appendChild(said);
      p.appendChild(shown);
      host.appendChild(p);
      targets.push({ node: shown, text: String(line) });
    });

    var caret = document.createElement("span");
    caret.className = "tw-caret";
    caret.setAttribute("aria-hidden", "true");

    function complete() {
      if (finished) return;
      finished = true;
      targets.forEach(function (t) {
        t.node.textContent = t.text;
      });
      if (caret.parentNode) caret.parentNode.removeChild(caret);
      handle.done = true;
      if (onDone) onDone();
    }

    var handle = { done: false, finish: complete };

    if (instant() || !targets.length) {
      complete();
      return handle;
    }

    var lineIndex = 0;
    var charIndex = 0;

    function step() {
      if (finished) return;
      var t = targets[lineIndex];
      if (!t) {
        complete();
        return;
      }
      charIndex += 1;
      t.node.textContent = t.text.slice(0, charIndex);
      t.node.parentNode.appendChild(caret);
      if (charIndex >= t.text.length) {
        lineIndex += 1;
        charIndex = 0;
        later(timers, step, 220);
        return;
      }
      later(timers, step, speed);
    }

    later(timers, step, options.delay || 120);
    return handle;
  }

  /* Animated integer from `from` to `to`; `format` renders each frame. */
  function countUp(node, from, to, options) {
    options = options || {};
    var format = options.format || function (n) {
      return String(n);
    };
    var ms = options.ms || 700;
    if (instant() || from === to) {
      node.textContent = format(to);
      return;
    }
    var start = null;
    var cancelled = false;
    if (options.timers) {
      /* rAF ids are not timeouts, so register a canceller the engine can call. */
      options.timers.push({ cancel: function () { cancelled = true; } });
    }
    function frame(now) {
      if (cancelled) return;
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / ms);
      var eased = 1 - Math.pow(1 - t, 3);
      node.textContent = format(Math.round(from + (to - from) * eased));
      if (t < 1) root.requestAnimationFrame(frame);
    }
    node.textContent = format(from);
    root.requestAnimationFrame(frame);
  }

  /* Glitch a heading in once. The CSS uses data-text for the ghost layers;
     both are removed when the jolt ends so nothing lingers for screen
     readers or text selection. */
  function glitch(node) {
    if (!node || instant()) return;
    node.setAttribute("data-text", node.textContent);
    node.classList.add("glitch", "glitch--in");
    node.addEventListener("animationend", function done(event) {
      if (event.target !== node) return;
      node.removeEventListener("animationend", done);
      node.classList.remove("glitch--in");
      node.removeAttribute("data-text");
    });
  }

  /*
   * Double-tap guard: for a moment after a screen changes, taps on its
   * buttons are swallowed, so a second tap meant for the previous screen's
   * button cannot also press the new one in the same spot.
   */
  var guardUntil = 0;

  function guard(ms) {
    guardUntil = Date.now() + (ms || 350);
  }

  if (typeof document !== "undefined") {
    document.addEventListener("click", function (event) {
      if (Date.now() >= guardUntil) return;
      var target = event.target && event.target.closest
        ? event.target.closest(".actionbar a, .actionbar button, .map-row, .option, .rtable a")
        : null;
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  /* A rubber stamp: tone is "red", "green" or "amber". */
  function stamp(text, tone) {
    var node = document.createElement("p");
    node.className = "stamp stamp--" + (tone || "green") + (instant() ? "" : " stamp--slam");
    node.textContent = text;
    return node;
  }

  function buzz(ms) {
    try {
      if (root.navigator && typeof root.navigator.vibrate === "function") {
        root.navigator.vibrate(ms || 20);
      }
    } catch (err) {
      /* Haptics are a bonus; ignore failures. */
    }
  }

  /* Falling radioactive ash: a fixed, inert layer of a few pixel specks. */
  function ash(count) {
    if (reduced() || document.querySelector(".ash")) return;
    var layer = document.createElement("div");
    layer.className = "ash";
    layer.setAttribute("aria-hidden", "true");
    var n = count || 14;
    for (var i = 0; i < n; i += 1) {
      var speck = document.createElement("span");
      speck.className = "ash__speck";
      /* Deterministic spread: no Math.random, so screenshots are stable. */
      var x = (i * 37) % 100;
      speck.style.left = x + "%";
      speck.style.animationDuration = 9 + ((i * 7) % 9) + "s";
      speck.style.animationDelay = -((i * 13) % 17) + "s";
      speck.style.opacity = String(0.25 + ((i * 3) % 5) / 10);
      if (i % 4 === 0) speck.classList.add("ash__speck--big");
      layer.appendChild(speck);
    }
    document.body.appendChild(layer);
  }

  root.FX = {
    reduced: reduced,
    fast: fast,
    instant: instant,
    later: later,
    typeLines: typeLines,
    countUp: countUp,
    glitch: glitch,
    stamp: stamp,
    buzz: buzz,
    guard: guard,
    ash: ash
  };
})(typeof window !== "undefined" ? window : globalThis);
