/*
 * play.js — hash router for the single-game site.
 *
 *   play.html            → The Caravan Lockboxes
 *   play.html#allais     → The Caravan Lockboxes (same game)
 *   play.html#report     → Paradox Report Card
 *
 * Phase 3 removed the four-game hub, the coming-soon routes and the deck
 * overlay. Unknown hashes fall back to the game rather than a dead end.
 */
(function (root) {
  "use strict";

  var CONFIG = root.CONFIG || {};

  function byId(id) {
    return document.getElementById(id);
  }

  function views() {
    return {
      game: byId("view-game"),
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

  function setTitle(text) {
    document.title = text
      ? text + " — Paradoxes of Choices under Uncertainty"
      : "Paradoxes of Choices under Uncertainty";
  }

  function route() {
    /* Capture the running stage before stopping the engine: a Report opened
       from the reveal may show the saved card; a Report opened mid-run must
       not leak the previous run's result (or the paradox name). */
    var active =
      root.Engine && root.Engine.current ? root.Engine.current : null;
    var allowSavedReport = !active || active.stage === "reveal";

    if (root.Engine && typeof root.Engine.stop === "function") root.Engine.stop();

    var id = idFromHash();

    if (id === "report") {
      show("report");
      root.Hub.renderReport(byId("view-report"), {
        allowSaved: allowSavedReport
      });
      setTitle("Paradox Report Card");
      window.scrollTo(0, 0);
      return;
    }

    var game = (CONFIG.games || {}).allais;
    if (!game) {
      show("report");
      root.Hub.renderReport(byId("view-report"));
      setTitle("Paradox Report Card");
      window.scrollTo(0, 0);
      return;
    }

    show("game");
    setTitle(game.title);
    root.Engine.mount(byId("view-game"), game);
    window.scrollTo(0, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", route);
  } else {
    route();
  }
  root.addEventListener("hashchange", route);
})(typeof window !== "undefined" ? window : globalThis);
