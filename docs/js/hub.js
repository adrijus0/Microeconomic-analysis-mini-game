/*
 * hub.js — the Pip-Boy map and the Vault-Tec Report Card.
 *
 * The map lists the encounters in CONFIG.encounterOrder with a rad meter for
 * progress. The Report Card is the slides' conclusion table (slide 15),
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

  function renderMap(host) {
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
      var slides = game.slides || (game.reveal && game.reveal.slide);
      if (slides) {
        var plural = /[–-]/.test(String(slides)) ? "Slides " : "Slide ";
        meta.appendChild(el("span", "slide-ref", plural + slides));
      }
      a.appendChild(meta);
      li.appendChild(a);
      ol.appendChild(li);
    });
    section.appendChild(ol);

    var bar = el("div", "actionbar");
    if (done > 0) {
      var report = el("a", "btn btn--primary", (copy.reportCta || "Report Card") + " ▶");
      report.href = "#report";
      bar.appendChild(report);
    } else {
      var first = list[0];
      if (first) {
        var start = el("a", "btn btn--primary", "Start deal 01 ▶");
        start.href = "#" + first.id;
        bar.appendChild(start);
      }
      bar.appendChild(el("p", "hint", copy.reportLocked || ""));
    }
    section.appendChild(bar);

    if (done > 0 && root.GameStore) {
      var reset = el("button", "linkbtn", copy.reset || "Reset progress");
      reset.type = "button";
      reset.addEventListener("click", function () {
        var sure = true;
        try {
          sure = root.confirm("Wipe all your answers from this Pip-Boy?");
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

  function renderReport(host) {
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
    card.appendChild(
      el(
        "p",
        "stage__lead",
        "You chose like the crowd in " + matches + " of " + played.length +
          (complete ? " deals." : " deals so far. Play all " + list.length + " for your rank.")
      )
    );

    var table = el("div", "rtable");
    table.setAttribute("role", "table");
    var head = el("div", "rtable__row rtable__row--head");
    head.setAttribute("role", "row");
    ["Paradox", "You", "Crowd", "Breaks → fix"].forEach(function (h) {
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
      name.appendChild(el("strong", null, (game.reveal && game.reveal.name) || game.paradox));
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
      cell("Crowd", (game.reveal && game.reveal.crowd) || "—");
      var rep = game.report || {};
      cell("Breaks → fix", (rep.breaks || "—") + " → " + (rep.fix || "—"));
      table.appendChild(row);
    });
    card.appendChild(table);

    if (copy.closing) {
      var quote = el("blockquote", "takeaway");
      quote.appendChild(el("p", null, copy.closing));
      var cite = el("footer", "takeaway__cite");
      cite.appendChild(el("span", "slide-ref", "Slide 15"));
      cite.appendChild(el("span", null, "From the lecture slides"));
      quote.appendChild(cite);
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
    host.appendChild(
      el("p", "report-footnote", "Stored only on this device.")
    );
    focusTitle(host);
  }

  root.Hub = {
    renderMap: renderMap,
    renderReport: renderReport
  };
})(typeof window !== "undefined" ? window : globalThis);
