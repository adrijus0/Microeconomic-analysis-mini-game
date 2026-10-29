/*
 * wallet.js — the Pip-Boy caps pill in the top bar.
 *
 * Reads GameStore.wallet() on load and animates on every `wallet:change`
 * event (store.js): the number counts to the new total, the pill flashes
 * green or red and a "+2,400" / "−10" floats out. Quiet changes (a replay
 * setting old caps aside) and reduced motion or ?fast=1 just update the
 * number. Classic script, loaded by play.html after engine.js.
 */
(function (root) {
  "use strict";

  var FX = root.FX;
  var pill = null;
  var number = null;
  var shown = null;
  var timers = [];

  var commas = root.Engine.helpers.intText;
  var UNITS = [[1e3, "K"], [1e6, "M"], [1e9, "B"], [1e12, "T"]];

  /* Up to 99,999 in full; beyond that "1.2M" so a lucky flip fits the bar.
     A value that rounds to 1,000 of a unit moves up one (999,999 → "1M"). */
  function compact(n) {
    var a = Math.abs(n);
    if (a < 100000) return commas(n);
    var i = 0;
    var v = a / UNITS[0][0];
    while (Math.round(v) >= 1000 && i < UNITS.length - 1) {
      i += 1;
      v = a / UNITS[i][0];
    }
    var text = v < 100 ? String(Math.round(v * 10) / 10) : commas(v);
    return (n < 0 ? "-" : "") + text + UNITS[i][1];
  }

  function label(n) {
    pill.setAttribute("aria-label", "Wallet: " + commas(n) + " caps");
  }

  function cancel() {
    timers.forEach(function (t) {
      if (t && typeof t.cancel === "function") t.cancel();
      else root.clearTimeout(t);
    });
    timers = [];
  }

  function float(delta) {
    var tag = document.createElement("span");
    tag.className = "capsbar__delta " + (delta > 0 ? "is-gain" : "is-loss");
    tag.setAttribute("aria-hidden", "true");
    tag.textContent = (delta > 0 ? "+" : "") + compact(delta);
    pill.appendChild(tag);
    tag.addEventListener("animationend", function () {
      if (tag.parentNode) tag.parentNode.removeChild(tag);
    });
  }

  function animate(from, to, quiet) {
    label(to);
    if (quiet || !FX || FX.instant()) {
      number.textContent = compact(to);
      shown = to;
      return;
    }
    pill.classList.remove("is-gain", "is-loss");
    void pill.offsetWidth; /* restart the flash */
    pill.classList.add(to > from ? "is-gain" : "is-loss");
    float(to - from);
    if (root.SFX) root.SFX.play(to > from ? "coin" : "loss");
    FX.countUp(number, from, to, { format: compact, timers: timers, ms: 650 });
    shown = to;
  }

  function onChange(event) {
    if (!pill) return;
    var detail = (event && event.detail) || {};
    var to = Number(detail.to);
    if (!isFinite(to)) return;
    /* Count from what is on screen, so quick changes chain smoothly. */
    var from = shown == null ? Number(detail.from) : shown;
    cancel();
    var wait = FX && !FX.instant() ? Number(detail.delay) || 0 : 0;
    if (wait > 0) {
      timers.push(root.setTimeout(function () {
        animate(from, to, detail.quiet);
      }, wait));
    } else {
      animate(from, to, detail.quiet);
    }
  }

  function boot() {
    pill = document.getElementById("capsbar");
    if (!pill || !root.GameStore || typeof root.GameStore.wallet !== "function") return;
    number = pill.querySelector(".capsbar__num");
    var icon = pill.querySelector(".capsbar__icon");
    if (icon && root.GameAssets && !icon.firstChild) {
      icon.appendChild(root.GameAssets.img("icon_caps", { className: "sprite sprite--pill", alt: "" }));
    }
    shown = root.GameStore.wallet();
    number.textContent = compact(shown);
    label(shown);
    pill.hidden = false;
  }

  root.addEventListener("wallet:change", onChange);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})(typeof window !== "undefined" ? window : globalThis);
