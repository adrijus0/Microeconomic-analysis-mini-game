/*
 * props.js — outcome animations for the newer encounters, registered on
 * Engine.props next to the built-in lockbox:
 *
 *   chip    Victor flips a Lucky 38 chip until tails (St. Petersburg)
 *   barrel  Festus's barrel of Nuka, star and plain caps (Ellsberg)
 *
 * A prop may define play(state, host, option, outcome, done),
 * choiceHeader(state, node, round) and revealExtra(state, node, summary).
 * Every animation honours FX.instant() and registers its timers on
 * state.timers so Engine.stop() can cancel them.
 */
(function (root) {
  "use strict";

  var Engine = root.Engine;
  var FX = root.FX;
  if (!Engine || !FX) return;
  var el = Engine.helpers.el;
  var caps = Engine.helpers.caps;

  /* ------------------------------------------------------------------ */
  /* Lucky 38 chip                                                      */
  /* ------------------------------------------------------------------ */

  var LADDER = 6;

  function chipFaces() {
    var coin = el("div", "coin");
    coin.setAttribute("aria-hidden", "true");
    var heads = root.GameAssets.img("chip_heads", { className: "sprite coin__face coin__face--heads", alt: "" });
    var tails = root.GameAssets.img("chip_tails", { className: "sprite coin__face coin__face--tails", alt: "" });
    coin.appendChild(heads);
    coin.appendChild(tails);
    return coin;
  }

  /* The pay ladder makes the doubling visible: 2, 4, 8, 16, … */
  function ladder() {
    var list = el("ol", "ladder");
    list.setAttribute("aria-label", "Tails on flip k pays 2 to the power k caps");
    for (var k = 1; k <= LADDER; k += 1) {
      var rung = el("li", "ladder__rung");
      rung.appendChild(el("span", "ladder__k", "Flip " + k));
      rung.appendChild(el("span", "ladder__pay", caps(Math.pow(2, k))));
      list.appendChild(rung);
    }
    var more = el("li", "ladder__rung ladder__rung--more");
    more.appendChild(el("span", "ladder__k", "…and so on"));
    more.appendChild(el("span", "ladder__pay", "×2 each flip"));
    list.appendChild(more);
    return list;
  }

  function lightRung(list, k) {
    var rungs = list.querySelectorAll(".ladder__rung");
    var more = list.querySelector(".ladder__rung--more");
    if (more && k > LADDER) {
      more.querySelector(".ladder__k").textContent = "Flip " + k;
      more.querySelector(".ladder__pay").textContent = caps(Math.pow(2, k));
    }
    Array.prototype.forEach.call(rungs, function (rung, i) {
      var at = Math.min(k, LADDER + 1) - 1;
      rung.classList.toggle("is-on", i === at);
      rung.classList.toggle("is-past", i < at);
    });
  }

  var chip = {
    play: function (state, host, option, outcome, done) {
      var stage = el("div", "prop__box prop__box--chip");
      var coin = chipFaces();
      stage.appendChild(coin);
      var flips = el("ol", "flips");
      flips.setAttribute("aria-hidden", "true");
      stage.appendChild(flips);
      host.appendChild(stage);

      var card = el("div", "prop__card");
      card.appendChild(el("p", "prop__name", "Tails on…"));
      var list = ladder();
      card.appendChild(list);
      host.appendChild(card);

      var seq = outcome.flips || ["T"];

      function mark(i) {
        var face = seq[i];
        var pill = el("li", "flips__pill flips__pill--" + (face === "T" ? "tails" : "heads"), face === "T" ? "T" : "H");
        flips.appendChild(pill);
        coin.classList.toggle("is-tails", face === "T");
        /* Heads moves the game up to the next rung; tails settles on this one. */
        lightRung(list, face === "T" ? i + 1 : i + 2);
      }

      if (FX.instant()) {
        seq.forEach(function (face, i) {
          mark(i);
        });
        done();
        return;
      }

      var i = 0;
      var over = false;

      /* Long runs of heads speed up; a tap on the chip skips to the end. */
      function finish() {
        if (over || state.destroyed) return;
        over = true;
        coin.classList.remove("is-spinning");
        for (; i < seq.length; i += 1) mark(i);
        FX.buzz(30);
        done();
      }
      stage.addEventListener("click", finish);

      function next() {
        if (over || state.destroyed) return;
        coin.classList.remove("is-spinning");
        void coin.offsetWidth; /* restart the spin animation */
        coin.classList.add("is-spinning");
        var spin = i < 3 ? 650 : i < 6 ? 380 : 160;
        coin.style.animationDuration = spin + "ms";
        FX.later(state.timers, function () {
          if (over) return;
          coin.classList.remove("is-spinning");
          mark(i);
          i += 1;
          if (i < seq.length) {
            FX.later(state.timers, next, i < 6 ? 220 : 80);
          } else {
            over = true;
            FX.buzz(30);
            FX.later(state.timers, done, 300);
          }
        }, spin);
      }
      FX.later(state.timers, next, 250);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Festus's cap barrel                                                */
  /* ------------------------------------------------------------------ */

  var KIND_LABEL = { nuka: "Nuka-Cola cap", star: "Star cap", plain: "Plain Sunset cap" };

  /* 90 caps: 30 Nuka first, then 60 Sunset caps (hidden or revealed). */
  function grid(mix, hidden) {
    var box = el("div", "barrel");
    box.setAttribute("role", "img");
    box.setAttribute(
      "aria-label",
      hidden
        ? "A barrel of 90 caps: 30 Nuka-Cola caps and 60 Sunset Sarsaparilla caps, an unknown number of them star caps"
        : "The barrel revealed: " + mix.nuka + " Nuka-Cola, " + mix.star + " star and " + mix.plain + " plain Sunset caps"
    );
    var kinds = [];
    var n;
    for (n = 0; n < mix.nuka; n += 1) kinds.push("nuka");
    for (n = 0; n < mix.star; n += 1) kinds.push(hidden ? "unknown" : "star");
    for (n = 0; n < mix.plain; n += 1) kinds.push(hidden ? "unknown" : "plain");
    kinds.forEach(function (kind, i) {
      var dot = el("span", "capdot capdot--" + kind);
      if (!hidden && !FX.instant()) dot.style.animationDelay = (i % 15) * 25 + Math.floor(i / 15) * 40 + "ms";
      box.appendChild(dot);
    });
    return box;
  }

  function legend(hidden, mix) {
    var row = el("p", "barrel__legend");
    function item(kind, text) {
      var span = el("span", "barrel__key");
      span.appendChild(el("span", "capdot capdot--" + kind));
      span.appendChild(document.createTextNode(text));
      row.appendChild(span);
    }
    item("nuka", "30 Nuka-Cola");
    if (hidden) {
      item("unknown", "60 Sunset: plain or star?");
    } else {
      item("star", mix.star + " star");
      item("plain", mix.plain + " plain Sunset");
    }
    return row;
  }

  function hiddenMix() {
    return { nuka: 30, star: 0, plain: 60 };
  }

  var barrel = {
    choiceHeader: function (state, node) {
      var wrap = el("div", "barrel-wrap");
      wrap.appendChild(grid(hiddenMix(), true));
      wrap.appendChild(legend(true));
      node.appendChild(wrap);
    },

    play: function (state, host, option, outcome, done) {
      var stage = el("div", "prop__box prop__box--barrel");
      var sprite = root.GameAssets.img("cap_barrel", { className: "sprite sprite--resolve", alt: "" });
      stage.appendChild(sprite);
      var cap = el("span", "bigcap bigcap--" + outcome.cap);
      cap.setAttribute("aria-hidden", "true");
      cap.hidden = true;
      stage.appendChild(cap);
      host.appendChild(stage);

      var card = el("div", "prop__card");
      var drawn = el("p", "prop__drawn", "One cap settles both bets…");
      card.appendChild(drawn);
      var rows = el("ul", "betrows");
      (outcome.rows || [{ label: option.id + " — " + option.label, win: Number(outcome.payoff) > 0 }])
        .forEach(function (row) {
          var li = el("li", "betrows__row");
          li.appendChild(el("span", null, row.label));
          var mark = el("span", "betrows__mark", "…");
          li.appendChild(mark);
          li._win = row.win;
          li._mark = mark;
          rows.appendChild(li);
        });
      card.appendChild(rows);
      host.appendChild(card);

      function reveal() {
        cap.hidden = false;
        drawn.textContent = "Drawn: " + KIND_LABEL[outcome.cap];
        Array.prototype.forEach.call(rows.children, function (li) {
          li.classList.add(li._win ? "is-win" : "is-lose");
          li._mark.textContent = li._win ? "✓ +100 caps" : "✗ 0";
        });
        stage.classList.add(Number(outcome.payoff) > 0 ? "is-win" : "is-lose");
      }

      if (FX.instant()) {
        reveal();
        done();
        return;
      }
      stage.classList.add("is-shaking");
      FX.later(state.timers, function () {
        stage.classList.remove("is-shaking");
        reveal();
        FX.later(state.timers, done, 450);
      }, 900);
    },

    revealExtra: function (state, node) {
      var mix = state.ctx && state.ctx.mix;
      if (!mix) return;
      var wrap = el("div", "barrel-wrap barrel-wrap--revealed");
      wrap.appendChild(grid(mix, false));
      wrap.appendChild(legend(false, mix));
      node.appendChild(wrap);
    }
  };

  Engine.props.chip = chip;
  Engine.props.barrel = barrel;
})(typeof window !== "undefined" ? window : globalThis);
