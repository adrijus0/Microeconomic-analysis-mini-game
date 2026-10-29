/*
 * lossaversion.js — logic for "The Atomic Wrangler Flip" (loss aversion).
 *
 * Classic script: no DOM access at load time, so it can be <script>-tagged
 * from file:// and require()d by Node for tests.
 *
 * Slide 13: a coin flip, lose 100 or win 110. Most refuse, though the
 * expected gain is +5. Slide 14 explains it with prospect theory:
 *
 *   V(L) = Σ w(p_i) v(x_i),   v(x) = x^α (x ≥ 0), −λ(−x)^β (x < 0),
 *   w(p) = p^γ / (p^γ + (1 − p)^γ)^(1/γ)
 *   α = β = 0.88, λ = 2.25, γ = 0.61
 *
 * which gives the flip a felt value of about −28: below walking away (0).
 *
 * Public API:
 *   LossAversionGame.ev(lottery)          -> expected value
 *   LossAversionGame.ptValue(lottery)     -> prospect-theory value V(L)
 *   LossAversionGame.resolve(...)         -> engine outcome (one cap flip)
 *   LossAversionGame.reveal(choices, game) -> short reveal summary
 */
(function (root, factory) {
  "use strict";

  var api = factory();

  if (root) {
    root.LossAversionGame = api;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  /* Slide 14's parameters. */
  var ALPHA = 0.88;
  var BETA = 0.88;
  var LAMBDA = 2.25;
  var GAMMA = 0.61;

  function w(p) {
    var a = Math.pow(p, GAMMA);
    return a / Math.pow(a + Math.pow(1 - p, GAMMA), 1 / GAMMA);
  }

  function v(x) {
    return x >= 0 ? Math.pow(x, ALPHA) : -LAMBDA * Math.pow(-x, BETA);
  }

  function ev(lottery) {
    return (lottery || []).reduce(function (sum, part) {
      return sum + Number(part.p) * Number(part.x);
    }, 0);
  }

  function ptValue(lottery) {
    return (lottery || []).reduce(function (sum, part) {
      return sum + w(Number(part.p)) * v(Number(part.x));
    }, 0);
  }

  function optionOf(round, id) {
    var found = null;
    ((round && round.options) || []).forEach(function (option) {
      if (option.id === id) found = option;
    });
    if (!found) throw new Error("[LossAversionGame] unknown choice " + JSON.stringify(id));
    return found;
  }

  /* The flip is the option with a loss in it; walking away has none. */
  function isFlip(option) {
    return (option.lottery || []).some(function (part) {
      return Number(part.x) < 0;
    });
  }

  function flipOf(round) {
    var flip = null;
    ((round && round.options) || []).forEach(function (option) {
      if (isFlip(option)) flip = option;
    });
    return flip;
  }

  function signed(n) {
    return (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(Math.round(n));
  }

  /* --------------------------------------------------------------- engine */

  /* The cap is flipped either way, so walking away still shows what
     would have happened. Heads pays the flip's win, tails its loss. */
  function resolve(round, option, ctx, rng) {
    var flip = flipOf(round) || option;
    var parts = (flip.lottery || []).slice().sort(function (a, b) {
      return b.x - a.x;
    });
    var winX = Number(parts[0] && parts[0].x) || 0;
    var loseX = Number(parts[1] && parts[1].x) || 0;
    var heads = rng.next() < 0.5;
    var x = heads ? winX : loseX;
    if (isFlip(option)) {
      return {
        payoff: x,
        net: x,
        face: heads ? "H" : "T",
        winX: winX,
        loseX: loseX,
        heading: heads ? "Heads!" : "Tails.",
        copy: heads ? "Garret pays you " + winX + " caps." : "You pay Garret " + -loseX + " caps."
      };
    }
    return {
      payoff: 0,
      net: 0,
      face: heads ? "H" : "T",
      winX: winX,
      loseX: loseX,
      walked: true,
      heading: "You walked.",
      copy: heads
        ? "It landed heads: you'd have won " + winX + "."
        : "It landed tails: you dodged a " + -loseX + "-cap loss."
    };
  }

  function reveal(choices, game) {
    var round = (game.rounds || [])[0];
    var chosen = optionOf(round, choices[round.id]);
    var flip = flipOf(round);
    var flipped = isFlip(chosen);
    var gain = ev(flip.lottery);
    var felt = ptValue(flip.lottery);
    var half = w(0.5);
    var parts = flip.lottery.slice().sort(function (a, b) {
      return b.x - a.x;
    });
    var winX = Number(parts[0].x);
    var loseX = -Number(parts[1].x);
    return {
      you: flipped ? "Flipped" : "Walked away",
      /* "Most refuse" (slide 13): refusing is the crowd's choice, and it is
         what EU over total wealth cannot explain for a +5 bet. */
      crowdMatch: !flipped,
      consistent: flipped,
      stamp: flipped
        ? { text: "Took the edge", tone: "green" }
        : { text: "Loss averse", tone: "red" },
      line: flipped
        ? "You took the " + signed(gain) + " edge. Most people walk away."
        : "Like most people: the " + loseX + "-cap loss outweighed the " + winX + "-cap win.",
      tiles: [
        { label: "Average gain", value: signed(gain) + " caps", note: "the average says flip" },
        { label: "Losses weigh", value: LAMBDA + "×", note: "as much as gains", mine: true },
        /* ASCII minus: the pixel font has no U+2212 glyph. */
        { label: "Felt value", value: signed(felt).replace("−", "-"), note: "not caps · below 0: walk" }
      ],
      math: [
        {
          label: "Expected value",
          tex: "E = \\tfrac12\\cdot " + winX + " - \\tfrac12\\cdot " + loseX + " = " + signed(gain).replace("−", "-")
        },
        {
          label: "Prospect theory parameters",
          tex: "\\alpha = \\beta = 0.88,\\quad \\lambda = 2.25,\\quad \\gamma = 0.61"
        },
        {
          label: "Felt value of the flip",
          tex: "V = w(\\tfrac12)\\,v(" + winX + ") + w(\\tfrac12)\\,v(-" + loseX + ")"
        },
        {
          label: "So",
          tex: "V = " + half.toFixed(2) + "\\,(" + winX + "^{0.88} - 2.25\\cdot " + loseX + "^{0.88}) \\approx " +
            felt.toFixed(1)
        }
      ]
    };
  }

  return {
    w: w,
    v: v,
    ev: ev,
    ptValue: ptValue,
    resolve: resolve,
    reveal: reveal,
    LAMBDA: LAMBDA
  };
});
