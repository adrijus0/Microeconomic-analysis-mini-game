/*
 * play.js — hash router.
 *
 *   play.html  /  play.html#map   → Pip-Boy map
 *   play.html#<encounter id>      → that encounter (e.g. #allais)
 *   play.html#report              → Vault-Tec Report Card
 *
 * Unknown hashes fall back to the map rather than a dead end, so a presenter
 * can deep-link the room straight into one encounter.
 */
(function (root) {
  "use strict";

  var CONFIG = root.CONFIG || {};

  function byId(id) {
    return document.getElementById(id);
  }

  /* Inactive views are emptied, so no stale buttons linger in the DOM. */
  function show(name) {
    ["map", "game", "report"].forEach(function (key) {
      var node = byId("view-" + key);
      if (!node) return;
      node.hidden = key !== name;
      if (key !== name) {
        while (node.firstChild) node.removeChild(node.firstChild);
      }
    });
  }

  function idFromHash() {
    return String(root.location.hash || "").replace(/^#\/?/, "").toLowerCase();
  }

  function setTitle(text) {
    var base = CONFIG.title || "Wasteland Odds";
    document.title = text ? text + " — " + base : base;
  }

  /* The top-left link leaves the game for the map, or the map for the title. */
  function setBack(onMap) {
    var link = byId("back-link");
    if (!link) return;
    link.href = onMap ? "index.html" : "#map";
    link.textContent = onMap ? "◂ Title" : "◂ Map";
  }

  /* In-page anchors (the skip link's #main) are not routes. */
  var ANCHORS = { main: true };

  function route(event) {
    var id = idFromHash();
    if (event && ANCHORS[id]) return;
    if (root.Engine) root.Engine.stop();
    if (root.FX) root.FX.guard(350);
    var games = CONFIG.games || {};
    var listed = (CONFIG.encounterOrder || []).indexOf(id) !== -1;

    if (id === "report") {
      show("report");
      setBack(false);
      root.Hub.renderReport(byId("view-report"));
      setTitle("Report Card");
    } else if (listed && games[id]) {
      show("game");
      setBack(false);
      root.Engine.mount(byId("view-game"), games[id]);
      setTitle(games[id].title);
    } else {
      if (ANCHORS[id] && root.history && root.history.replaceState) {
        root.history.replaceState(null, "", root.location.pathname + root.location.search);
      }
      show("map");
      setBack(true);
      root.Hub.renderMap(byId("view-map"));
      setTitle("Map");
    }
    root.scrollTo(0, 0);
  }

  /* The skip link focuses <main> without changing the hash, so it never
     ends a game or adds a history entry. */
  function wireSkipLink() {
    var link = document.querySelector(".skip-link");
    var main = byId("main");
    if (!link || !main) return;
    link.addEventListener("click", function (event) {
      event.preventDefault();
      try {
        main.focus({ preventScroll: false });
      } catch (err) {
        main.focus();
      }
    });
  }

  function boot() {
    if (root.FX) root.FX.ash();
    wireSkipLink();
    route();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  root.addEventListener("hashchange", route);
})(typeof window !== "undefined" ? window : globalThis);
