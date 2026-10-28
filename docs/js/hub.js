/*
 * hub.js — the Paradox Report Card (the only remaining "hub" surface).
 *
 * Phase 3 ships one game, so this file no longer builds a card grid or
 * coming-soon panels. It renders the end-of-game terminal readout and an empty
 * state that points at the single game.
 *
 * All content comes from CONFIG.games.allais; progress comes from GameStore
 * (localStorage inside try/catch, in-memory fallback).
 */
(function (root) {
  "use strict";

  var CONFIG = root.CONFIG || {};

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function game() {
    return (CONFIG.games || {}).allais || null;
  }

  /* ------------------------------------------------------------------ */
  /* Paradox Report Card                                                */
  /* ------------------------------------------------------------------ */

  function formatRefs(refs) {
    if (!refs || !refs.length) return "—";
    var sorted = refs.slice().sort(function (a, b) {
      return a - b;
    });
    var parts = [];
    var start = sorted[0];
    var prev = sorted[0];
    for (var i = 1; i <= sorted.length; i += 1) {
      var current = sorted[i];
      if (current === prev + 1) {
        prev = current;
        continue;
      }
      parts.push(start === prev ? String(start) : start + "–" + prev);
      start = current;
      prev = current;
    }
    return "Slide" + (sorted.length === 1 ? " " : "s ") + parts.join(", ");
  }

  function benchmarkText(gameConfig) {
    var b = gameConfig && gameConfig.benchmark;
    if (!b) return null;
    var text = "";
    if (b.r1 != null) text += b.r1 + "% chose A";
    if (b.r2 != null) text += (text ? " · " : "") + b.r2 + "% chose C";
    if (b.source) text += (text ? " · " : "") + b.source;
    return text || null;
  }

  function verdictFor(result, gameConfig) {
    if (root.AllaisGame && gameConfig && gameConfig.id === "allais") {
      try {
        return root.AllaisGame.verdict(result.choices, gameConfig);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  function renderReport(host, options) {
    clear(host);
    var allowSaved = !options || options.allowSaved !== false;
    var gameConfig = game();
    var result = allowSaved && root.GameStore ? root.GameStore.get("allais") : null;

    if (!result || !gameConfig) {
      var locked = !allowSaved && !!(root.GameStore && root.GameStore.get("allais"));
      var empty = el("section", "report-empty");
      empty.appendChild(el("p", "eyebrow", "Paradox Report Card"));
      empty.appendChild(el("h1", "report-empty__title", "No card yet"));
      empty.appendChild(
        el(
          "p",
          "report-empty__copy",
          locked
            ? "Finish both contracts in this run to unlock the Report Card again."
            : "Play The Caravan Lockboxes to fill in your choice pattern, the expected-utility verdict and the slide references."
        )
      );
      var cta = el("a", "btn btn--primary", "Enter the game");
      cta.href = "#allais";
      empty.appendChild(cta);
      host.appendChild(empty);
      return;
    }

    var verdict = verdictFor(result, gameConfig);
    var consistent =
      typeof result.consistent === "boolean" ? result.consistent : null;
    var card = el("article", "report-card");
    var head = el("header", "report-card__head");
    head.appendChild(el("p", "eyebrow", "Paradox Report Card"));
    head.appendChild(el("h1", "report-card__title", gameConfig.title));
    head.appendChild(
      el(
        "p",
        "report-card__paradox",
        gameConfig.paradox +
          (gameConfig.paradoxSub ? " · " + gameConfig.paradoxSub : "")
      )
    );
    card.appendChild(head);

    var verdictBox = el(
      "div",
      "report-card__verdict" +
        (consistent === false
          ? " is-inconsistent"
          : consistent === true
          ? " is-consistent"
          : "")
    );
    verdictBox.appendChild(
      el(
        "span",
        "report-card__verdict-label",
        consistent == null ? "Verdict unavailable" : "Expected-utility verdict"
      )
    );
    verdictBox.appendChild(
      el(
        "strong",
        "report-card__verdict-value",
        result.verdictLabel ||
          (consistent === false
            ? "Violates expected utility"
            : consistent === true
            ? "Consistent with expected utility"
            : "Not recorded")
      )
    );
    if (consistent === false) {
      verdictBox.appendChild(
        el("span", "report-card__verdict-sub", "independence axiom")
      );
    }
    card.appendChild(verdictBox);

    var grid = el("dl", "report-card__grid");

    function field(label, value, className) {
      var row = el("div", "report-card__field");
      row.appendChild(el("dt", null, label));
      var dd = el("dd", className || null, value);
      row.appendChild(dd);
      grid.appendChild(row);
    }

    field("Your choice pattern", result.pattern || "—");
    field(
      "Round 1 → Round 2",
      result.choices ? result.choices.r1 + " → " + result.choices.r2 : "—"
    );
    field("Population benchmark", benchmarkText(gameConfig) || "—");
    field("Certainty equivalent", "Not measured in this game");
    field("CRRA / risk aversion", "Not measured in this game");
    field(
      "Slide references",
      formatRefs(gameConfig.slideRefs || [10, 11, 12, 13, 14, 15, 16, 22])
    );
    card.appendChild(grid);

    if (verdict && verdict.plainExplanation) {
      var why = el("div", "report-card__why");
      why.appendChild(el("h2", null, "What your pattern means"));
      why.appendChild(el("p", null, verdict.plainExplanation));
      card.appendChild(why);
    }

    var foot = el("footer", "report-card__foot");
    var when = "";
    if (result.playedAt) {
      try {
        when = new Date(result.playedAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric"
        });
      } catch (err) {
        when = "";
      }
    }
    foot.appendChild(
      el("span", null, when ? "Played " + when : "Played on this device")
    );
    if (result.seed) foot.appendChild(el("span", null, "seed " + result.seed));
    card.appendChild(foot);

    var actions = el("div", "stage__actions report-card__actions");
    var again = el("a", "btn btn--primary", "Play again");
    again.href = "#allais";
    actions.appendChild(again);
    var back2 = el("a", "btn btn--ghost", "Back to entry screen");
    back2.href = "index.html";
    actions.appendChild(back2);
    card.appendChild(actions);

    host.appendChild(card);
    host.appendChild(
      el(
        "p",
        "report-card__footnote",
        "The report card stores only your game result on this device. No simulation data is recorded."
      )
    );
  }

  root.Hub = {
    renderReport: renderReport
  };
})(typeof window !== "undefined" ? window : globalThis);
