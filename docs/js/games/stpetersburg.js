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
 *   StPetersburgGame.resolve(...)      -> engine outcome for one fee
 *   StPetersburgGame.reveal(...)       -> short reveal summary
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
  var COURIER = 100;    // the player's stake, as on slide 6
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

  var SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";

  function superscript(n) {
    return String(n).split("").map(function (d) {
      return SUPERSCRIPT.charAt(Number(d));
    }).join("");
  }

  /* 507 -> "507", 1.75e7 -> "17.5 million", 6.3e29 -> "6 × 10²⁹". */
  function big(n) {
    if (n < 1e6) return commas(n);
    var names = [[1e15, null], [1e12, " trillion"], [1e9, " billion"], [1e6, " million"]];
    for (var i = 1; i < names.length; i += 1) {
      if (n >= names[i][0] && n < names[i - 1][0]) {
        var v = n / names[i][0];
        return (v < 100 ? String(Math.round(v * 10) / 10) : commas(v)) + names[i][1];
      }
    }
    var e = Math.floor(Math.log10(n));
    return Math.round(n / Math.pow(10, e)) + " × 10" + superscript(e);
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
      copy:
        "Tails on flip " + game.k + ": Victor pays " + commas(game.prize) + " caps. After your " +
        fee + "-cap fee you " +
        (net === 0
          ? "break even."
          : (net > 0 ? "are up " : "are down ") + commas(Math.abs(net)) + (Math.abs(net) === 1 ? " cap." : " caps."))
    };
  }

  function reveal(choices, game) {
    var round = (game.rounds || [])[0];
    var fee = feeOf(round, choices[round.id]);
    var courier = maxPrice(COURIER);
    var house = maxPrice(HOUSE);
    var line;
    if (fee <= courier) {
      line = "You'd pay " + fee + " caps for an infinite expected prize — and Bernoulli agrees.";
    } else {
      var w = wealthFor(fee);
      line =
        "A " + fee + "-cap fee only makes sense if you own at least ~" + big(w) + " caps" +
        (w > HOUSE ? " — " + big(w / HOUSE) + " times Mr. House's bankroll." : ".");
    }
    return {
      you: fee + " caps",
      /* "Almost nobody pays more than a few": the crowd pays within
         Bernoulli's bound, so one threshold drives the stamp and the card. */
      crowdMatch: fee <= courier,
      consistent: fee <= courier,
      stamp: fee <= courier
        ? { text: "Bernoulli-approved", tone: "green" }
        : { text: "High roller", tone: "amber" },
      line: line,
      tiles: [
        { label: "Expected prize", value: "∞ caps" },
        { label: "Courier's max fee", value: two(courier) + " caps", note: "with 100 caps", mine: true },
        { label: "Mr. House's max fee", value: two(house) + " caps", note: "with a 1,000,000-cap bankroll" }
      ],
      math: [
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
      ]
    };
  }

  return {
    maxPrice: maxPrice,
    wealthFor: wealthFor,
    play: play,
    big: big,
    resolve: resolve,
    reveal: reveal
  };
});
