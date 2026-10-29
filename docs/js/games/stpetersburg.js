/*
 * stpetersburg.js — logic for "Mr. House's Chip Toss" (St. Petersburg).
 *
 * Classic script: no DOM access at load time, so it can be <script>-tagged
 * from file:// and require()d by Node for tests.
 *
 * Slide 6: tails on toss k pays 2^k, so E[prize] = Σ 2^-k · 2^k = ∞. With
 * Bernoulli's u(x) = ln x and wealth w, the most you would pay is the p that
 * solves
 *
 *   Σ_{k≥1} 2^-k ln(w + 2^k − p) = ln w        (p ≈ 7.79 at w = 100,
 *                                               p ≈ 20.87 at w = 10^6)
 *
 * Because Σ 2^-k = 1, that is Σ 2^-k log1p((2^k − p) / w) = 0, which stays
 * accurate even for astronomically large w.
 *
 * Public API:
 *   StPetersburgGame.maxPrice(w)       -> Bernoulli's maximum fee
 *   StPetersburgGame.wealthFor(p)      -> wealth at which p is the maximum fee
 *   StPetersburgGame.play(rng)         -> { flips, k, prize }
 *   StPetersburgGame.init(rng, game, env) -> { wealth } from the caps wallet
 *   StPetersburgGame.resolve(...)      -> engine outcome for one fee
 *   StPetersburgGame.reveal(choices, game, ctx) -> short reveal summary; the
 *                                         player's own w is ctx.wealth
 */
(function (root, factory) {
  "use strict";

  var api = factory();

  if (root) {
    root.StPetersburgGame = api;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  var TERMS = 400;      // 2^-400 of the tail is far below double precision
  var MAX_FLIPS = 30;   // display cap: P(more) = 2^-30
  var COURIER = 100;    // slide 6's w, and the wallet's starting caps
  var HOUSE = 1000000;  // slide 6's w = 10^6, as Mr. House's bankroll

  /* Σ 2^-k log1p((2^k − p) / w): positive below the maximum fee. */
  function gap(p, w) {
    var sum = 0;
    var pow = 1;
    for (var k = 1; k <= TERMS; k += 1) {
      pow *= 2;
      sum += Math.log1p((pow - p) / w) / pow;
    }
    return sum;
  }

  /* Bracket the root by doubling (the fee grows like log2 w, so this is
     fast), then bisect. The k = 1 term needs p < w + 2. */
  function maxPrice(w) {
    var lo = 0;
    var cap = w + 2;
    var hi = Math.min(4, cap);
    while (hi < cap && gap(hi, w) > 0) {
      lo = hi;
      hi = Math.min(hi * 2, cap);
    }
    for (var i = 0; i < 64; i += 1) {
      var mid = (lo + hi) / 2;
      if (gap(mid, w) > 0) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  /* maxPrice grows with w, so bisect on log w. Fees ≤ 2 suit any wealth.
     The range stops at 10^90 (a fee of about 300) so 2^TERMS stays far
     above w; larger fees report Infinity rather than a wrong number. */
  var MAX_FEE_IN_RANGE = 299;
  var cache = {};

  function wealthFor(p) {
    if (!isFinite(p)) return NaN;
    if (p <= 2) return 0;
    if (p > MAX_FEE_IN_RANGE) return Infinity;
    if (cache[p] != null) return cache[p];
    var lo = Math.log(1e-6);
    var hi = Math.log(1e90);
    for (var i = 0; i < 64; i += 1) {
      var mid = (lo + hi) / 2;
      if (maxPrice(Math.exp(mid)) < p) lo = mid;
      else hi = mid;
    }
    cache[p] = Math.exp(hi);
    return cache[p];
  }

  /* Flip until the first tails. Tails on flip k pays 2^k caps. */
  function play(rng) {
    var flips = [];
    for (var k = 1; k <= MAX_FLIPS; k += 1) {
      if (rng.next() < 0.5 || k === MAX_FLIPS) {
        flips.push("T");
        return { flips: flips, k: k, prize: Math.pow(2, k) };
      }
      flips.push("H");
    }
    return { flips: flips, k: MAX_FLIPS, prize: Math.pow(2, MAX_FLIPS) };
  }

  /* ------------------------------------------------------------ formatting */

  function commas(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* 507 -> "507 caps", 1.75e7 -> "17.5 million caps", and past the
     trillions a size anyone can picture: "a 30-digit pile of caps". */
  function fortune(n) {
    if (n < 1e6) return commas(n) + " caps";
    var names = [[1e12, " trillion"], [1e9, " billion"], [1e6, " million"]];
    for (var i = 0; i < names.length; i += 1) {
      if (n >= names[i][0] && n < names[i][0] * 1000) {
        var v = n / names[i][0];
        return (v < 100 ? String(Math.round(v * 10) / 10) : commas(v)) + names[i][1] + " caps";
      }
    }
    return "a " + (Math.floor(Math.log10(n)) + 1) + "-digit pile of caps";
  }

  function two(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  /* --------------------------------------------------------------- engine */

  function feeOf(round, choice) {
    var found = null;
    ((round && round.options) || []).forEach(function (option) {
      if (option.id === choice) found = option;
    });
    if (!found) throw new Error("[StPetersburgGame] unknown fee " + JSON.stringify(choice));
    var fee = Number(found.fee);
    if (!isFinite(fee) || fee < 0) {
      throw new Error("[StPetersburgGame] option " + JSON.stringify(choice) + " needs a numeric fee");
    }
    return fee;
  }

  /* The wallet the player brings is their w (100 on a first run). */
  function init(rng, game, env) {
    var w = env ? Number(env.wallet) : NaN;
    return { wealth: isFinite(w) && w > 0 ? w : COURIER };
  }

  function resolve(round, option, ctx, rng) {
    var fee = Number(option.fee);
    var game = play(rng);
    var net = game.prize - fee;
    return {
      payoff: game.prize,
      flips: game.flips,
      k: game.k,
      fee: fee,
      net: net,
      heading: net > 0 ? "You beat the House!" : net === 0 ? "Even." : "The House wins.",
      /* A receipt: the pot never depends on the fee. */
      copy:
        "Tails on flip " + game.k + ". Pot " + commas(game.prize) + " − fee " + fee + " = " +
        (net > 0 ? "+" : net < 0 ? "−" : "") + commas(Math.abs(net)) + " caps."
    };
  }

  function reveal(choices, game, ctx) {
    var round = (game.rounds || [])[0];
    var fee = feeOf(round, choices[round.id]);
    var wealth = init(null, game, { wallet: ctx && ctx.wealth }).wealth;
    var courier = maxPrice(COURIER);
    var mine = wealth === COURIER ? courier : maxPrice(wealth);
    var house = maxPrice(HOUSE);
    /* "Almost nobody pays more than a few": the crowd pays within
       Bernoulli's bound for their own wallet, so one threshold drives the
       stamp and the Report Card. */
    var fair = fee <= mine;
    var line = fair
      ? "You paid " + fee + ": within what the toss is worth to you."
      : "You paid " + fee + ". That only makes sense if you own " + fortune(wealthFor(fee)) + ".";
    var math = [
      {
        label: "Expected prize",
        tex: "E[\\text{prize}] = \\sum_{k\\ge 1} 2^{-k}\\cdot 2^{k} = 1 + 1 + \\cdots = \\infty"
      },
      {
        label: "Bernoulli: the max fee p solves",
        tex: "\\sum_{k=1}^{\\infty} 2^{-k}\\ln\\!\\left(w + 2^{k} - p\\right) = \\ln w"
      },
      {
        label: "So",
        tex: "p \\approx " + two(courier) + "\\ (w = 100),\\quad p \\approx " + two(house) + "\\ (w = 10^{6})"
      }
    ];
    if (wealth !== COURIER) {
      math.push({
        label: "With your wallet",
        tex: "p \\approx " + two(mine) + "\\ (w = " + commas(wealth).replace(/,/g, "{,}") + ")"
      });
    }
    return {
      you: "Paid " + fee + " caps",
      crowdMatch: fair,
      consistent: fair,
      stamp: fair
        ? { text: "Bernoulli-approved", tone: "green" }
        : { text: "High roller", tone: "amber" },
      line: line,
      /* Why: the average is endless, yet the toss is worth little. */
      tiles: [
        { label: "Average prize", value: "∞ caps", note: "each flip adds 1 cap, forever" },
        { label: "Worth to you", value: two(mine) + " caps", note: "with " + commas(wealth) + " caps", mine: true },
        { label: "Worth to Mr. House", value: two(house) + " caps", note: "with 1M caps" }
      ],
      math: math
    };
  }

  return {
    maxPrice: maxPrice,
    wealthFor: wealthFor,
    play: play,
    fortune: fortune,
    init: init,
    resolve: resolve,
    reveal: reveal
  };
});
