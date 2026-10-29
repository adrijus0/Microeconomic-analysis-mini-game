/*
 * props.js — outcome animations for the newer encounters, registered on
 * Engine.props next to the built-in lockbox:
 *
 *   chip     Victor flips a Lucky 38 chip until tails (St. Petersburg)
 *   barrel   Festus's barrel of Nuka, star and plain caps (Ellsberg)
 *   capflip  Garret flips one bottle cap, +110 or −100 (loss aversion)
 *
 * A prop may define play(state, host, option, outcome, done),
 * sceneExtra(state, node) (explains the setup on the intro screen),
 * choiceHeader(state, node, round), optionVisual(state, option) (drawn on
 * each option card instead of the odds bar) and revealExtra(state, node,
 * summary).
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

  function sfx(name) {
    if (root.SFX) root.SFX.play(name);
  }

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

  /* The choice screen's one-row version: see the doubling, don't read it. */
  function payStrip() {
    var strip = el("ol", "paystrip");
    strip.setAttribute("aria-label", "Tails on flip 1 pays 2 caps, flip 2 pays 4, flip 3 pays 8, doubling each flip");
    for (var k = 1; k <= LADDER; k += 1) {
      var item = el("li", "paystrip__item");
      item.setAttribute("aria-hidden", "true");
      item.appendChild(el("span", "paystrip__k", "Flip " + k));
      item.appendChild(el("span", "paystrip__pay", String(Math.pow(2, k))));
      strip.appendChild(item);
    }
    var more = el("li", "paystrip__item paystrip__item--more");
    more.setAttribute("aria-hidden", "true");
    more.appendChild(el("span", "paystrip__k", "…"));
    more.appendChild(el("span", "paystrip__pay", "×2"));
    strip.appendChild(more);
    return strip;
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
    choiceHeader: function (state, node) {
      var wrap = el("div", "paystrip-wrap");
      wrap.appendChild(el("p", "paystrip__title", "First tails on… you take the pot"));
      wrap.appendChild(payStrip());
      node.appendChild(wrap);
    },

    play: function (state, host, option, outcome, done) {
      var stage = el("div", "prop__box prop__box--chip");
      var coin = chipFaces();
      stage.appendChild(coin);
      var flips = el("ol", "flips");
      flips.setAttribute("aria-hidden", "true");
      stage.appendChild(flips);
      /* The pot, live: it starts at 2 and every heads doubles it. */
      var pot = el("p", "flips__pot", "Pot: 2 caps");
      pot.setAttribute("aria-hidden", "true");
      stage.appendChild(pot);
      host.appendChild(stage);

      var card = el("div", "prop__card");
      card.appendChild(el("p", "prop__name", "First tails on…"));
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
        pot.textContent = face === "T"
          ? "Tails! You take " + caps(Math.pow(2, i + 1))
          : "Heads: pot doubles to " + caps(Math.pow(2, i + 2));
        pot.classList.toggle("is-tails", face === "T");
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
        sfx("flip");
        var spin = i < 3 ? 650 : i < 6 ? 380 : 160;
        coin.style.animationDuration = spin + "ms";
        FX.later(state.timers, function () {
          if (over) return;
          coin.classList.remove("is-spinning");
          mark(i);
          if (seq[i] === "T") sfx("land");
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

  var KIND_LABEL = { nuka: "Red cap", star: "Star cap", plain: "Plain yellow cap" };

  /* The revealed barrel: 30 red, then the star and plain yellow caps. */
  function grid(mix) {
    var box = el("div", "barrel");
    box.setAttribute("role", "img");
    box.setAttribute(
      "aria-label",
      "The barrel revealed: " + mix.nuka + " red, " + mix.star + " star and " + mix.plain + " plain yellow caps"
    );
    var kinds = [];
    var n;
    for (n = 0; n < mix.nuka; n += 1) kinds.push("nuka");
    for (n = 0; n < mix.star; n += 1) kinds.push("star");
    for (n = 0; n < mix.plain; n += 1) kinds.push("plain");
    kinds.forEach(function (kind, i) {
      var dot = el("span", "capdot capdot--" + kind);
      if (!FX.instant()) dot.style.animationDelay = (i % 15) * 25 + Math.floor(i / 15) * 40 + "ms";
      box.appendChild(dot);
    });
    return box;
  }

  /* withMaybe adds the key for the cards' "?" caps (choice screen only). */
  function legend(hidden, mix, withMaybe) {
    var row = el("p", "barrel__legend");
    function item(kind, text) {
      var span = el("span", "barrel__key");
      span.appendChild(el("span", "capdot capdot--" + kind));
      span.appendChild(document.createTextNode(text));
      row.appendChild(span);
    }
    item("nuka", "30 red");
    if (hidden) {
      item("plain", "60 yellow");
      item("star", "some yellow have a star");
      if (withMaybe) item("unknown", "might win: depends on the stars");
    } else {
      item("star", mix.star + " star");
      item("plain", mix.plain + " plain yellow");
    }
    return row;
  }

  /*
   * The intro's "how many stars?" barrel: 30 red caps, and 60 yellow ones
   * whose star count keeps re-rolling (0 … 60), so "nobody knows how many"
   * is seen, not just read. Reduced motion shows one still "?" barrel.
   */
  var MAYBE = [20, 0, 45, 8, 60, 33];

  function maybeBarrel(state) {
    var wrap = el("div", "barrel-wrap barrel-wrap--scene");
    var box = el("div", "barrel");
    box.setAttribute("role", "img");
    box.setAttribute(
      "aria-label",
      "90 caps: 30 red and 60 yellow. Anywhere from 0 to 60 of the yellow caps have a star; nobody knows how many."
    );
    var yellow = [];
    for (var n = 0; n < 90; n += 1) {
      var dot = el("span", "capdot " + (n < 30 ? "capdot--nuka" : "capdot--unknown"));
      box.appendChild(dot);
      if (n >= 30) yellow.push(dot);
    }
    var caption = el("p", "barrel__maybe", "0 to 60 stars? Nobody knows.");
    caption.setAttribute("aria-hidden", "true");
    wrap.appendChild(box);
    wrap.appendChild(caption);
    wrap.appendChild(legend(true));
    if (FX.instant()) return wrap;

    /* Stars land in a scattered but fixed order, so counts look random. */
    var order = yellow.map(function (dot, i) {
      return yellow[(i * 37) % 60];
    });
    var step = 0;
    function roll() {
      if (state.destroyed || !wrap.isConnected) return;
      var stars = MAYBE[step % MAYBE.length];
      order.forEach(function (dot, i) {
        dot.className = "capdot " + (i < stars ? "capdot--star" : "capdot--plain");
      });
      caption.textContent = (stars ? "Maybe " + stars + " stars…" : "Maybe no stars at all…") + " nobody knows.";
      step += 1;
      FX.later(state.timers, roll, 1300);
    }
    FX.later(state.timers, roll, 900);
    return wrap;
  }

  function chanceRange(lo, hi) {
    return lo === hi ? lo + "%" : lo + "–" + hi + "%";
  }

  /* "You pick → you get", in the same rows as the Allais cards. */
  function betRows(option) {
    var logic = root.EllsbergGame;
    var c = logic && typeof logic.chance === "function" ? logic.chance(option) : { lo: 0, hi: 0 };
    var list = el("span", "lot-list lot-list--bet");
    [
      [chanceRange(c.lo, c.hi), option.when || "Your cap pulled", "+100 caps", c.lo !== c.hi],
      [chanceRange(100 - c.hi, 100 - c.lo), "Anything else", "0", c.lo !== c.hi]
    ].forEach(function (r) {
      var row = el("span", "lot-list__row");
      row.appendChild(el("span", "lot-list__p" + (r[3] ? " is-unknown" : ""), r[0]));
      row.appendChild(el("span", "lot-list__when", r[1]));
      row.appendChild(el("span", "lot-list__x", r[2]));
      list.appendChild(row);
    });
    return list;
  }

  /*
   * One bet as a picture: the 90-cap barrel with this bet's winning caps lit.
   * Yellow caps light up only if the bet wins on star AND plain; if it wins on
   * just one of them, nobody knows how many win, so they show "?" static.
   */
  function betPicture(option) {
    var wins = option.wins || [];
    var red = wins.indexOf("nuka") !== -1;
    var star = wins.indexOf("star") !== -1;
    var plain = wins.indexOf("plain") !== -1;
    var logic = root.EllsbergGame;
    var known = logic && typeof logic.known === "function" ? logic.known(option) : star === plain;

    var frag = document.createDocumentFragment();
    frag.appendChild(betRows(option));
    var pic = el("span", "betpic");
    pic.appendChild(
      el("span", "odds-badge odds-badge--" + (known ? "known" : "unknown"), known ? "Known odds" : "Unknown odds")
    );
    var box = el("span", "barrel barrel--mini");
    box.setAttribute("aria-hidden", "true");
    var yellow = star && plain ? "capdot--plain" : star || plain ? "capdot--unknown" : "capdot--plain is-dim";
    for (var n = 0; n < 90; n += 1) {
      box.appendChild(el("span", "capdot " + (n < 30 ? (red ? "capdot--nuka" : "capdot--nuka is-dim") : yellow)));
    }
    pic.appendChild(box);
    frag.appendChild(pic);
    return frag;
  }

  var barrel = {
    sceneExtra: function (state, node) {
      node.appendChild(maybeBarrel(state));
    },

    choiceHeader: function (state, node, round) {
      /* Bet 2 mirrors bet 1, so show what was picked there. */
      var first = state.game.rounds[0];
      if (round !== first && state.choices[first.id]) {
        var picked = null;
        first.options.forEach(function (o) {
          if (o.id === state.choices[first.id]) picked = o;
        });
        if (picked) {
          var memo = el("p", "bet-memo", "Your bet 1: ");
          memo.appendChild(el("strong", null, picked.label));
          node.appendChild(memo);
        }
      }
      var wrap = el("div", "barrel-wrap barrel-wrap--key");
      wrap.appendChild(legend(true, null, true));
      node.appendChild(wrap);
    },

    optionVisual: function (state, option) {
      return betPicture(option);
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
        sfx("clink");
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
      wrap.appendChild(grid(mix));
      wrap.appendChild(legend(false, mix));
      node.appendChild(wrap);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Garret's cap flip                                                  */
  /* ------------------------------------------------------------------ */

  /* One spin, then the face. Walking away still shows the flip, so the
     card reads "if you had flipped…". */
  var capflip = {
    play: function (state, host, option, outcome, done) {
      var stage = el("div", "prop__box prop__box--capflip");
      var coin = el("div", "coin coin--cap");
      coin.setAttribute("aria-hidden", "true");
      coin.appendChild(root.GameAssets.img("icon_caps", { className: "sprite coin__face coin__face--heads", alt: "" }));
      coin.appendChild(el("span", "coin__face coin__face--tails capback"));
      stage.appendChild(coin);
      var winX = Number(outcome.winX) || 0;
      var loseX = Number(outcome.loseX) || 0;
      var face = el("p", "flips__pot", "Heads +" + winX + " · Tails " + Engine.helpers.intText(loseX));
      face.setAttribute("aria-hidden", "true");
      stage.appendChild(face);
      host.appendChild(stage);
      var card = el("div", "prop__card");
      card.appendChild(el("p", "prop__name", outcome.walked ? "If you had flipped…" : "The bet"));
      var rows = el("ul", "betrows");
      var heads = el("li", "betrows__row");
      heads.appendChild(el("span", null, "Heads"));
      heads.appendChild(el("span", "betrows__mark", "+" + caps(winX)));
      var tails = el("li", "betrows__row");
      tails.appendChild(el("span", null, "Tails"));
      tails.appendChild(el("span", "betrows__mark", caps(loseX)));
      rows.appendChild(heads);
      rows.appendChild(tails);
      card.appendChild(rows);
      host.appendChild(card);

      function land() {
        var isHeads = outcome.face === "H";
        coin.classList.toggle("is-tails", !isHeads);
        face.textContent = isHeads ? "Heads!" : "Tails!";
        face.classList.toggle("is-tails", !isHeads);
        (isHeads ? heads : tails).classList.add("is-hit");
        (isHeads ? tails : heads).classList.add("is-lose");
        if (!outcome.walked) stage.classList.add(isHeads ? "is-win" : "is-lose");
      }

      if (FX.instant()) {
        land();
        done();
        return;
      }
      coin.style.animationDuration = "1100ms";
      coin.classList.add("is-spinning");
      sfx("flip");
      FX.later(state.timers, function () {
        coin.classList.remove("is-spinning");
        land();
        sfx("land");
        FX.buzz(30);
        FX.later(state.timers, done, 350);
      }, 1100);
    }
  };

  Engine.props.chip = chip;
  Engine.props.barrel = barrel;
  Engine.props.capflip = capflip;
})(typeof window !== "undefined" ? window : globalThis);
