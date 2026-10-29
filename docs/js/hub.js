/*
 * hub.js — the Pip-Boy map and the Vault-Tec Report Card.
 *
 * The map lists the encounters in CONFIG.encounterOrder with a rad meter for
 * progress. The Report Card is the slides' conclusion table (slide 14),
 * personalised from GameStore (localStorage inside try/catch, in-memory
 * fallback). No network, no tracking.
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

  function encounters() {
    var games = CONFIG.games || {};
    return (CONFIG.encounterOrder || []).filter(function (id) {
      return !!games[id];
    }).map(function (id) {
      return games[id];
    });
  }

  function results() {
    return root.GameStore ? root.GameStore.all() : {};
  }

  function flicker(node) {
    if (root.FX && !root.FX.instant()) node.classList.add("flicker-in");
    return node;
  }

  /* Decorative Pip-Boy tab strip; MAP is the live tab. */
  function tabs(active) {
    var strip = el("div", "pipboy-tabs");
    strip.setAttribute("aria-hidden", "true");
    ["STAT", "INV", "DATA", "MAP", "RADIO"].forEach(function (name) {
      strip.appendChild(el("span", "pipboy-tabs__tab" + (name === active ? " is-active" : ""), name));
    });
    return strip;
  }

  function radMeter(done, total) {
    var meter = el("div", "radmeter");
    meter.setAttribute("role", "img");
    meter.setAttribute("aria-label", done + " of " + total + " deals done");
    meter.appendChild(el("span", "radmeter__icon", "☢"));
    var cells = el("span", "radmeter__cells");
    for (var i = 0; i < total; i += 1) {
      cells.appendChild(el("span", "radmeter__cell" + (i < done ? " is-on" : "")));
    }
    meter.appendChild(cells);
    meter.appendChild(el("span", "radmeter__label", done + "/" + total + " RADS"));
    return meter;
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function intText(n) {
    return root.Engine.helpers.intText(n);
  }

  /* New screen: move focus to its heading so it is announced. */
  function focusTitle(host) {
    var h = host.querySelector("h1");
    if (!h) return;
    h.setAttribute("tabindex", "-1");
    try {
      h.focus({ preventScroll: true });
    } catch (err) {
      h.focus();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Map                                                                */
  /* ------------------------------------------------------------------ */

  /* Timers of the Report Card's typed ending, cancelled on any re-render. */
  var endingTimers = [];

  function stopEnding() {
    endingTimers.forEach(function (t) {
      root.clearTimeout(t);
    });
    endingTimers = [];
  }

  function renderMap(host) {
    stopEnding();
    clear(host);
    var copy = CONFIG.map || {};
    var list = encounters();
    var saved = results();
    var done = list.filter(function (g) {
      return saved[g.id] && saved[g.id].done;
    }).length;

    var section = flicker(el("section", "stage stage--map"));
    section.appendChild(tabs("MAP"));
    section.appendChild(el("p", "eyebrow", copy.kicker || "Map"));
    var title = el("h1", "stage__title", copy.title || "The Mojave");
    if (root.FX) root.FX.glitch(title);
    section.appendChild(title);
    if (copy.lead) section.appendChild(el("p", "stage__lead", copy.lead));
    section.appendChild(radMeter(done, list.length));

    var ol = el("ol", "map-list");
    list.forEach(function (game, i) {
      var isDone = !!(saved[game.id] && saved[game.id].done);
      var li = el("li", "map-list__item");
      var a = el("a", "map-row" + (isDone ? " is-done" : ""));
      a.href = "#" + game.id;
      a.appendChild(el("span", "map-row__num", pad(i + 1)));
      var body = el("span", "map-row__body");
      body.appendChild(el("span", "map-row__title", game.title));
      if (game.hook) body.appendChild(el("span", "map-row__hook", game.hook));
      a.appendChild(body);
      var meta = el("span", "map-row__meta");
      meta.appendChild(el("span", "map-row__status", isDone ? "✓ Done" : "New"));
      a.appendChild(meta);
      li.appendChild(a);
      ol.appendChild(li);
    });
    section.appendChild(ol);

    /* The next unplayed deal is always one tap away; the Report Card sits
       beside it once there is something to report. */
    var bar = el("div", "actionbar");
    var nextIndex = -1;
    list.forEach(function (g, i) {
      if (nextIndex === -1 && !(saved[g.id] && saved[g.id].done)) nextIndex = i;
    });
    var reportLabel = (copy.reportCta || "Report Card") + (nextIndex === -1 ? " ▶" : "");
    var report = el("a", "btn " + (nextIndex === -1 ? "btn--primary" : "btn--ghost"), reportLabel);
    report.href = "#report";
    if (nextIndex === -1) {
      bar.appendChild(report);
    } else {
      var start = el("a", "btn btn--primary", (done ? "Next deal " : "Start deal ") + pad(nextIndex + 1) + " ▶");
      start.href = "#" + list[nextIndex].id;
      bar.appendChild(start);
      if (done > 0) {
        bar.classList.add("actionbar--row");
        bar.appendChild(report);
      } else {
        bar.appendChild(el("p", "hint", copy.reportLocked || ""));
      }
    }
    section.appendChild(bar);

    if (done > 0 && root.GameStore) {
      var reset = el("button", "linkbtn", copy.reset || "Reset progress");
      reset.type = "button";
      reset.addEventListener("click", function () {
        var sure = true;
        try {
          sure = root.confirm("Wipe your answers and caps from this Pip-Boy?");
        } catch (err) {
          sure = true;
        }
        if (!sure) return;
        root.GameStore.clear();
        renderMap(host);
      });
      section.appendChild(reset);
    }

    host.appendChild(section);
    focusTitle(host);
  }

  /* ------------------------------------------------------------------ */
  /* Vault-Tec Report Card                                              */
  /* ------------------------------------------------------------------ */

  function rankTitle(matches, total) {
    var ranks = (CONFIG.report && CONFIG.report.ranks) || [];
    if (!ranks.length || !total) return "";
    var index = Math.round((matches / total) * (ranks.length - 1));
    return ranks[Math.max(0, Math.min(ranks.length - 1, index))];
  }

  /* S.P.E.C.I.A.L.-style bars: each played deal scores its chosen options
     (CONFIG.games.<id>.special.points), clamped to 1–10. */
  function statScore(game, record) {
    var points = (game.special && game.special.points) || {};
    var sum = 0;
    var choices = (record && record.choices) || {};
    Object.keys(choices).forEach(function (round) {
      sum += Number(points[choices[round]]) || 0;
    });
    return Math.max(1, Math.min(10, sum));
  }

  function statsBlock(list, saved) {
    var box = el("div", "special");
    box.appendChild(el("p", "special__title", "Your S.P.E.C.I.A.L."));
    list.forEach(function (game) {
      var record = saved[game.id];
      if (!game.special || !(record && record.done)) return;
      var score = statScore(game, record);
      var row = el("div", "special__row");
      row.setAttribute("role", "img");
      row.setAttribute("aria-label", game.special.label + ": " + score + " of 10");
      row.appendChild(el("span", "special__label", game.special.label));
      var bar = el("span", "special__bar");
      for (var i = 1; i <= 10; i += 1) {
        var cell = el("span", "special__cell" + (i <= score ? " is-on" : ""));
        if (root.FX && !root.FX.instant()) cell.style.animationDelay = i * 40 + "ms";
        bar.appendChild(cell);
      }
      row.appendChild(bar);
      row.appendChild(el("span", "special__num", String(score)));
      box.appendChild(row);
    });
    return box;
  }

  /* The perks unlocked so far, one per finished deal. */
  function perksBlock(list, saved) {
    var box = el("div", "perks");
    box.appendChild(el("p", "special__title", "Perks"));
    var grid = el("div", "perks__grid");
    list.forEach(function (game) {
      var record = saved[game.id];
      if (!(record && record.done)) return;
      var perk = root.Engine.helpers.perkOf(game, { crowdMatch: record.crowdMatch });
      if (perk) grid.appendChild(root.Engine.helpers.perkCard(game, perk, false));
    });
    box.appendChild(grid);
    return box;
  }

  function renderReport(host) {
    stopEnding();
    clear(host);
    var copy = CONFIG.report || {};
    var list = encounters();
    var saved = results();
    var played = list.filter(function (g) {
      return saved[g.id] && saved[g.id].done;
    });

    if (!played.length) {
      var empty = flicker(el("section", "stage report-empty"));
      empty.appendChild(el("p", "eyebrow", copy.kicker || "Report Card"));
      empty.appendChild(el("h1", "stage__title", "No data yet"));
      empty.appendChild(el("p", "stage__lead", "Finish a deal on the map first."));
      var go = el("a", "btn btn--primary", "Open the map ▶");
      go.href = "#map";
      empty.appendChild(go);
      host.appendChild(empty);
      focusTitle(host);
      return;
    }

    var matches = played.filter(function (g) {
      return saved[g.id].crowdMatch;
    }).length;
    var complete = played.length === list.length;

    var card = flicker(el("article", "stage report-card"));
    card.appendChild(el("p", "eyebrow", copy.kicker || "Report Card"));
    var title = el(
      "h1",
      "stage__title",
      complete ? rankTitle(matches, list.length) : "Rank pending…"
    );
    if (root.FX) root.FX.glitch(title);
    card.appendChild(title);

    /* Not done yet: say exactly what is left before the rank and ending. */
    if (!complete) {
      var left = list.filter(function (g) {
        return !(saved[g.id] && saved[g.id].done);
      });
      var memo = el("p", "bet-memo report-left");
      memo.appendChild(document.createTextNode("Your rank and the ending unlock after all " + list.length + " deals. Still to play: "));
      left.forEach(function (g, i) {
        var a = el("a", null, g.title);
        a.href = "#" + g.id;
        memo.appendChild(a);
        if (i < left.length - 1) memo.appendChild(document.createTextNode(", "));
      });
      memo.appendChild(document.createTextNode("."));
      card.appendChild(memo);
    }

    /* The journey's end: typed with clicks, then the ending tune. */
    if (complete && copy.ending && root.FX) {
      var ending = el("div", "report-ending");
      card.appendChild(ending);
      root.FX.typeLines(ending, [copy.ending], {
        timers: endingTimers,
        speed: 28,
        delay: 700,
        onDone: function () {
          if (!ending.isConnected) return;
          title.classList.add("is-crowned");
          if (root.SFX) root.SFX.play("ending");
        }
      });
    }

    card.appendChild(
      el(
        "p",
        "stage__lead",
        "You chose like most people in " + matches + " of " + played.length +
          (complete ? " deals." : " deals so far. Play all " + list.length + " for your rank.")
      )
    );

    if (root.GameStore && typeof root.GameStore.wallet === "function") {
      var start = (CONFIG.wallet && CONFIG.wallet.start) || 100;
      var wallet = el("p", "report-wallet");
      wallet.appendChild(root.GameAssets.img("icon_caps", { className: "sprite sprite--pill", alt: "" }));
      wallet.appendChild(el("strong", null, intText(root.GameStore.wallet()) + " caps"));
      wallet.appendChild(el("span", null, "Wallet · started with " + intText(start)));
      card.appendChild(wallet);
    }

    card.appendChild(statsBlock(list, saved));
    card.appendChild(perksBlock(list, saved));

    var table = el("div", "rtable");
    table.setAttribute("role", "table");
    var head = el("div", "rtable__row rtable__row--head");
    head.setAttribute("role", "row");
    ["Paradox", "You", "In studies", "Breaks → fix"].forEach(function (h) {
      var cell = el("span", "rtable__cell", h);
      cell.setAttribute("role", "columnheader");
      head.appendChild(cell);
    });
    table.appendChild(head);

    list.forEach(function (game) {
      var r = saved[game.id];
      var row = el("div", "rtable__row" + (r && r.done ? "" : " is-pending"));
      row.setAttribute("role", "row");

      function cell(label, content) {
        var c = el("span", "rtable__cell");
        c.setAttribute("role", "cell");
        c.setAttribute("data-label", label);
        if (typeof content === "string") c.textContent = content;
        else if (content) c.appendChild(content);
        row.appendChild(c);
        return c;
      }

      var name = el("span", "rtable__name");
      var rep = game.report || {};
      name.appendChild(el("strong", null, rep.name || (game.reveal && game.reveal.name) || game.paradox));
      cell("Paradox", name);

      if (r && r.done) {
        var you = el("span", "rtable__you");
        you.appendChild(el("strong", null, r.you || "—"));
        if (r.stamp) {
          you.appendChild(el("span", "mini-stamp mini-stamp--" + (r.stamp.tone || "green"), r.stamp.text));
        }
        cell("You", you);
      } else {
        var play = el("a", null, "Play ▶");
        play.href = "#" + game.id;
        cell("You", play);
      }
      cell("In studies", (game.reveal && game.reveal.crowd) || "—");
      cell("Breaks → fix", (rep.breaks || "—") + " → " + (rep.fix || "—"));
      table.appendChild(row);
    });
    card.appendChild(table);

    if (copy.closing) {
      var quote = el("blockquote", "takeaway");
      quote.appendChild(el("p", null, copy.closing));
      card.appendChild(quote);
    }

    var bar = el("div", "actionbar");
    var next = list.filter(function (g) {
      return !(saved[g.id] && saved[g.id].done);
    })[0];
    var primary = el("a", "btn btn--primary", next ? "Next deal ▶" : "Back to the map ▶");
    primary.href = next ? "#" + next.id : "#map";
    bar.appendChild(primary);
    if (next) {
      var mapLink = el("a", "btn btn--ghost", "Map");
      mapLink.href = "#map";
      bar.appendChild(mapLink);
    }
    card.appendChild(bar);

    host.appendChild(card);
    focusTitle(host);
  }

  root.Hub = {
    renderMap: renderMap,
    renderReport: renderReport
  };
})(typeof window !== "undefined" ? window : globalThis);
