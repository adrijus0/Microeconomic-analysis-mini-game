/*
 * hub.js — the games hub, the "coming soon" panels and the Paradox Report
 * Card. All content comes from CONFIG.games; progress comes from GameStore
 * (localStorage inside try/catch, in-memory fallback).
 */
(function (root) {
  "use strict";

  var CONFIG = root.CONFIG || {};
  var DEFAULT_ORDER = ["allais", "ellsberg", "stp", "framing"];

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function games() {
    return CONFIG.games || {};
  }

  function order() {
    return CONFIG.gameOrder || DEFAULT_ORDER;
  }

  function isPlayable(game) {
    return !!(game && game.status !== "coming");
  }

  function done(id) {
    return !!(root.GameStore && root.GameStore.isDone(id));
  }

  /* ------------------------------------------------------------------ */
  /* Hub                                                                */
  /* ------------------------------------------------------------------ */

  function render(host) {
    clear(host);
    var hub = el("section", "hub");
    var head = el("header", "hub__head");
    head.appendChild(el("p", "eyebrow", "Mini-games"));
    head.appendChild(el("h1", "hub__title", "Four decisions under uncertainty"));
    head.appendChild(
      el(
        "p",
        "hub__lead",
        "Choose first. Each game explains what your choices imply only after you lock them in."
      )
    );
    hub.appendChild(head);

    var grid = el("div", "hub__grid");
    order().forEach(function (id) {
      var game = games()[id];
      if (!game) return;
      grid.appendChild(card(id, game));
    });
    hub.appendChild(grid);

    var report = el("aside", "hub__report");
    var copy = el("div", "hub__report-copy");
    copy.appendChild(el("h2", "hub__report-title", "Paradox Report Card"));
    copy.appendChild(
      el(
        "p",
        null,
        done("allais")
          ? "Your Allais pattern, expected-utility verdict and slide references on one screenshot-friendly card."
          : "Play a game and this card fills with the paradox you exhibited, your choice pattern and the verdict."
      )
    );
    report.appendChild(copy);
    var link = el("a", "btn btn--small", done("allais") ? "Open report card" : "View report card");
    link.href = "#report";
    report.appendChild(link);
    hub.appendChild(report);

    hub.appendChild(
      el(
        "p",
        "hub__footnote",
        "Progress is stored on this device only. Nothing is uploaded."
      )
    );

    host.appendChild(hub);
  }

  function card(id, game) {
    var playable = isPlayable(game);
    var played = done(id);
    var article = el("article", "hub-card" + (playable ? "" : " hub-card--coming"));
    var link = el("a", "hub-card__link");
    link.href = "#" + id;
    link.setAttribute(
      "aria-label",
      game.title +
        (played
          ? " — played"
          : playable
          ? " — play now"
          : " — coming in Phase 3")
    );

    var art = el("div", "hub-card__art");
    if (game.card) {
      art.appendChild(
        root.GameAssets.img(game.card, {
          className: "hub-card__img",
          alt: game.cardAlt || ""
        })
      );
    } else {
      art.appendChild(comingArt(game));
    }
    if (played) {
      art.appendChild(el("span", "hub-card__badge hub-card__badge--done", "✓ Played"));
    } else if (!playable) {
      art.appendChild(el("span", "hub-card__badge", "Coming in Phase 3"));
    }
    link.appendChild(art);

    var body = el("div", "hub-card__body");
    body.appendChild(el("h2", "hub-card__title", game.title));
    body.appendChild(el("p", "hub-card__tagline", game.tagline || ""));
    var status = el(
      "span",
      "hub-card__status",
      played ? "Play again" : playable ? "Play now" : "Coming in Phase 3"
    );
    if (!playable) status.classList.add("hub-card__status--muted");
    body.appendChild(status);
    link.appendChild(body);

    article.appendChild(link);
    return article;
  }

  function comingArt(game) {
    var art = el("div", "hub-card__coming-art");
    art.setAttribute("aria-hidden", "true");
    art.appendChild(el("span", "hub-card__glyph", game.glyph || "▣"));
    return art;
  }

  /* ------------------------------------------------------------------ */
  /* Coming soon                                                        */
  /* ------------------------------------------------------------------ */

  function renderComing(host, id) {
    clear(host);
    var game = games()[id] || { title: "This game" };
    var panel = el("section", "coming");
    panel.appendChild(el("p", "eyebrow", "Coming in Phase 3"));
    panel.appendChild(el("h1", "coming__title", game.title));
    if (game.paradox) panel.appendChild(el("p", "coming__paradox", game.paradox));
    var box = el("div", "coming__box");
    box.appendChild(
      el(
        "p",
        null,
        game.comingCopy ||
          "This game is not built yet. The cards, art and verdict logic arrive in Phase 3; the deck's Try-it button already points here, so nothing is broken."
      )
    );
    if (game.proposed) {
      box.appendChild(el("p", "coming__note", game.proposed));
    }
    panel.appendChild(box);
    var actions = el("div", "stage__actions");
    var back = el("a", "btn btn--primary", "Back to hub");
    back.href = "play.html";
    actions.appendChild(back);
    var report = el("a", "btn btn--ghost", "Report Card");
    report.href = "#report";
    actions.appendChild(report);
    panel.appendChild(actions);
    host.appendChild(panel);
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

  function benchmarkText(game) {
    var b = game && game.benchmark;
    if (!b) return null;
    var text = "";
    if (b.r1 != null) text += b.r1 + "% chose A";
    if (b.r2 != null) text += (text ? " · " : "") + b.r2 + "% chose C";
    if (b.source) text += (text ? " · " : "") + b.source;
    return text || null;
  }

  function verdictFor(result, game) {
    if (root.AllaisGame && game && game.id === "allais") {
      try {
        return root.AllaisGame.verdict(result.choices, game);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  function renderReport(host) {
    clear(host);
    var game = games().allais;
    var result = root.GameStore ? root.GameStore.get("allais") : null;

    if (!result || !game) {
      var empty = el("section", "report-empty");
      empty.appendChild(el("p", "eyebrow", "Paradox Report Card"));
      empty.appendChild(el("h1", "report-empty__title", "No card yet"));
      empty.appendChild(
        el(
          "p",
          "report-empty__copy",
          "Play The Caravan Lockboxes to fill in your choice pattern, the expected-utility verdict and the slide references."
        )
      );
      var cta = el("a", "btn btn--primary", "Play The Caravan Lockboxes");
      cta.href = "#allais";
      empty.appendChild(cta);
      var back = el("a", "btn btn--ghost", "Back to hub");
      back.href = "play.html";
      empty.appendChild(back);
      host.appendChild(empty);
      return;
    }

    var verdict = verdictFor(result, game);
    var consistent =
      typeof result.consistent === "boolean" ? result.consistent : null;
    var card = el("article", "report-card");
    var head = el("header", "report-card__head");
    head.appendChild(el("p", "eyebrow", "Paradox Report Card"));
    head.appendChild(el("h1", "report-card__title", game.title));
    head.appendChild(
      el(
        "p",
        "report-card__paradox",
        game.paradox + (game.paradoxSub ? " · " + game.paradoxSub : "")
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
      result.choices
        ? result.choices.r1 + " → " + result.choices.r2
        : "—"
    );
    field("Benchmark (A+C)", benchmarkText(game) || "—");
    field("Certainty equivalent", "Not measured in this game");
    field("CRRA / risk aversion", "Not measured in this game");
    field("Slide references", formatRefs(game.slideRefs || [10, 11, 12, 13, 14, 15, 16, 22]));
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
      el(
        "span",
        null,
        when ? "Played " + when : "Played on this device"
      )
    );
    if (result.seed) foot.appendChild(el("span", null, "seed " + result.seed));
    card.appendChild(foot);

    var actions = el("div", "stage__actions report-card__actions");
    var again = el("a", "btn btn--primary", "Play again");
    again.href = "#allais";
    actions.appendChild(again);
    var back2 = el("a", "btn btn--ghost", "Back to hub");
    back2.href = "play.html";
    actions.appendChild(back2);
    card.appendChild(actions);

    host.appendChild(card);
    host.appendChild(
      el(
        "p",
        "report-card__footnote",
        "The report card stores only your game result on this device."
      )
    );
  }

  root.Hub = {
    render: render,
    renderComing: renderComing,
    renderReport: renderReport
  };
})(typeof window !== "undefined" ? window : globalThis);
