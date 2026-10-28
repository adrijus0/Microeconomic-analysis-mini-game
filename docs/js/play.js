/*
 * play.js — hash router for the games hub.
 *
 *   play.html            → hub
 *   play.html#allais     → The Caravan Lockboxes (real game)
 *   play.html#stp        → The Doubling Contract (coming soon)
 *   play.html#ellsberg   → The Fixer's Crate (coming soon)
 *   play.html#framing    → The Jarl's Orders (coming soon)
 *   play.html#report     → Paradox Report Card
 *
 * The deck's Try-it overlay loads these same URLs in an iframe; nothing here
 * assumes it is the top window.
 */
(function (root) {
  "use strict";

  var CONFIG = root.CONFIG || {};

  /* Inside the deck's Try-it iframe the deck already shows the game title and
     its own Close button, so hide the site bar and use the full height. The
     comparison is safe even when the parent is cross-origin (file://). */
  try {
    if (root.self !== root.top) {
      document.documentElement.classList.add("is-embedded");
    }
  } catch (err) {
    document.documentElement.classList.add("is-embedded");
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function views() {
    return {
      hub: byId("view-hub"),
      game: byId("view-game"),
      coming: byId("view-coming"),
      report: byId("view-report")
    };
  }

  function show(name) {
    var all = views();
    Object.keys(all).forEach(function (key) {
      var node = all[key];
      if (!node) return;
      var active = key === name;
      node.hidden = !active;
      node.classList.toggle("is-active", active);
    });
  }

  function idFromHash() {
    return String(root.location.hash || "")
      .replace(/^#\/?/, "")
      .toLowerCase();
  }

  function gameFor(id) {
    var game = (CONFIG.games || {})[id];
    if (!game) return null;
    return game;
  }

  function setTitle(text) {
    document.title = text
      ? text + " — Paradoxes of Choices under Uncertainty"
      : "Games — Paradoxes of Choices under Uncertainty";
  }

  function route() {
    if (root.Engine && typeof root.Engine.stop === "function") root.Engine.stop();

    var id = idFromHash();
    if (!id || id === "hub" || id === "home") {
      show("hub");
      root.Hub.render(byId("view-hub"));
      setTitle("Games");
      window.scrollTo(0, 0);
      return;
    }

    if (id === "report") {
      show("report");
      root.Hub.renderReport(byId("view-report"));
      setTitle("Paradox Report Card");
      window.scrollTo(0, 0);
      return;
    }

    var game = gameFor(id);
    if (game && game.status !== "coming") {
      show("game");
      setTitle(game.title);
      root.Engine.mount(byId("view-game"), game);
      window.scrollTo(0, 0);
      return;
    }

    if (game) {
      show("coming");
      root.Hub.renderComing(byId("view-coming"), id);
      setTitle(game.title);
      window.scrollTo(0, 0);
      return;
    }

    /* Unknown route: show the hub rather than a dead end. */
    show("hub");
    root.Hub.render(byId("view-hub"));
    setTitle("Games");
    window.scrollTo(0, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", route);
  } else {
    route();
  }
  root.addEventListener("hashchange", route);
})(typeof window !== "undefined" ? window : globalThis);
